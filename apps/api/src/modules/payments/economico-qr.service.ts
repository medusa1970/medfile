import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createHash } from 'crypto';

function resolveBanecoAesKey(aesKey: string): Buffer {
  const raw = aesKey.trim();
  if (!raw) throw new Error('aesKey de Baneco vacía.');
  if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) {
    const buf = Buffer.from(raw, 'hex');
    if (buf.length === 32) return buf;
    if (buf.length === 16) return createHash('sha256').update(buf).digest();
  }
  const utf = Buffer.from(raw, 'utf8');
  if (utf.length === 32) return utf;
  return createHash('sha256').update(raw, 'utf8').digest();
}

function encryptBanecoFieldLocal(plain: string, aesKey: string): string {
  const key = resolveBanecoAesKey(aesKey);
  const algo = key.length === 16 ? 'aes-128-ecb' : 'aes-256-ecb';
  const cipher = createCipheriv(algo, key, null);
  cipher.setAutoPadding(true);
  return Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]).toString('base64');
}

async function encryptBanecoFieldRemote(
  baseUrl: string,
  plain: string,
  aesKey: string,
): Promise<string> {
  const root = baseUrl.replace(/\/$/, '');
  const url = new URL(`${root}/api/authentication/encrypt`);
  url.searchParams.set('text', plain);
  url.searchParams.set('aesKey', aesKey.trim());
  const res = await fetch(url.toString());
  const body = (await res.text()).trim();
  if (!res.ok || !body) {
    throw new Error(body.slice(0, 120) || `HTTP ${res.status} en encrypt Baneco`);
  }
  if (body.startsWith('{')) throw new Error(body.slice(0, 120));
  if (body.startsWith('"') && body.endsWith('"')) {
    try {
      return JSON.parse(body) as string;
    } catch {
      return body.slice(1, -1);
    }
  }
  return body;
}

export type CreateCheckoutInput = {
  amount: number;
  description: string;
  orderId: string;
  expiresInSec?: number;
};

export type CreateCheckoutResult = {
  mode: 'mock' | 'economico_qr';
  qrId: string;
  qrImageDataUrl: string;
  orderId: string;
  expiresAt: Date;
};

export type QrPaymentStatus = 'pending' | 'paid' | 'expired';

export type StatusResult = {
  status: QrPaymentStatus;
  paidAt?: Date;
  raw?: Record<string, unknown>;
};

export type WebhookParseResult = {
  valid: boolean;
  qrId: string;
  orderId?: string;
  raw: Record<string, unknown>;
};

type BanecoApiResponse = {
  responseCode?: number;
  message?: string;
  token?: string;
  qrId?: string;
  qrImage?: string;
  statusQRCode?: number;
  statusQrCode?: number;
  payment?: BanecoPayment | BanecoPayment[];
};

type BanecoPayment = {
  qrId?: string;
  transactionId?: string;
  paymentDate?: string;
  paymentTime?: string;
  amount?: number;
  currency?: string;
};

const DEFAULT_BASE_URL = 'https://apimktdesa.baneco.com.bo/ApiGateway';
const TOKEN_TTL_MS = 25 * 60 * 1000;

@Injectable()
export class EconomicoQrService {
  private readonly userName: string;
  private readonly password: string;
  private readonly aesKey: string;
  private readonly accountCredit: string;
  private readonly baseUrl: string;
  private readonly branchCode?: string;

  private tokenCache: { token: string; expiresAt: number } | null = null;
  private readonly encryptCache = new Map<string, string>();

  constructor(private readonly config: ConfigService) {
    this.userName = this.config.get<string>('BANECO_USER_NAME')?.trim() ?? '';
    this.password = this.config.get<string>('BANECO_PASSWORD')?.trim() ?? '';
    this.aesKey = this.config.get<string>('BANECO_AES_KEY')?.trim() ?? '';
    this.accountCredit = this.config.get<string>('BANECO_ACCOUNT_CREDIT')?.trim() ?? '';
    this.baseUrl = (this.config.get<string>('BANECO_BASE_URL') ?? DEFAULT_BASE_URL).replace(
      /\/$/,
      '',
    );
    this.branchCode = this.config.get<string>('BANECO_BRANCH_CODE')?.trim();
  }

  isConfigured() {
    return Boolean(
      this.userName && this.password && this.aesKey && this.accountCredit && this.baseUrl,
    );
  }

  useMock() {
    const provider = this.config.get<string>('PAYMENTS_PROVIDER', 'mock');
    if (provider === 'mock') return true;
    return !this.isConfigured();
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const orderId = input.orderId.trim().slice(0, 50);
    if (!orderId) throw new Error('orderId requerido.');

    const expiresAt = new Date(Date.now() + (input.expiresInSec ?? 1800) * 1000);

    if (this.useMock()) {
      const label = encodeURIComponent(`Medfile ${orderId} Bs${input.amount}`);
      return {
        mode: 'mock',
        qrId: orderId,
        qrImageDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${label}`,
        orderId,
        expiresAt,
      };
    }

    const data = await this.authorizedFetch<BanecoApiResponse>('/api/qrsimple/generateQR', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: orderId,
        accountCredit: await this.encrypt(this.accountCredit),
        currency: 'BOB',
        amount: input.amount,
        description: (input.description || 'Pago Medfile').trim().slice(0, 100),
        dueDate: this.formatDueDate(expiresAt),
        singleUse: true,
        modifyAmount: false,
        ...(this.branchCode && { branchCode: this.branchCode.slice(0, 5) }),
      }),
    });

    const qrId = String(data.qrId ?? '').trim();
    const b64 = String(data.qrImage ?? '').trim();
    const qrImageDataUrl = b64
      ? b64.startsWith('data:')
        ? b64
        : `data:image/png;base64,${b64}`
      : '';

    if (!qrId && !qrImageDataUrl) {
      throw new Error('Baneco no devolvió qrId ni qrImage.');
    }

    return {
      mode: 'economico_qr',
      qrId: qrId || orderId,
      qrImageDataUrl,
      orderId,
      expiresAt,
    };
  }

  async getStatus(qrId: string, context?: { expiresAt?: Date }): Promise<StatusResult> {
    if (this.useMock()) {
      if (context?.expiresAt && Date.now() > context.expiresAt.getTime()) {
        return { status: 'expired' };
      }
      return { status: 'pending' };
    }

    const id = qrId.trim();
    if (!id) return { status: 'pending' };

    try {
      const data = await this.authorizedFetch<BanecoApiResponse>(
        `/api/qrsimple/v2/statusQR/${encodeURIComponent(id)}`,
        { method: 'GET' },
      );

      const statusCode = data.statusQRCode ?? data.statusQrCode;
      if (statusCode === 1) {
        const payments = Array.isArray(data.payment)
          ? data.payment
          : data.payment
            ? [data.payment]
            : [];
        return {
          status: 'paid',
          paidAt: this.parsePaidAt(payments[0]),
          raw: data as Record<string, unknown>,
        };
      }
      if (statusCode === 9) {
        return { status: 'expired', raw: data as Record<string, unknown> };
      }
      if (context?.expiresAt && Date.now() > context.expiresAt.getTime()) {
        return { status: 'expired' };
      }
      return { status: 'pending', raw: data as Record<string, unknown> };
    } catch {
      if (context?.expiresAt && Date.now() > context.expiresAt.getTime()) {
        return { status: 'expired' };
      }
      return { status: 'pending' };
    }
  }

  parseWebhook(body: unknown): WebhookParseResult {
    const root = (body ?? {}) as Record<string, unknown>;
    const paymentRaw = root.payment ?? root.Payment ?? root;
    const payment =
      paymentRaw && typeof paymentRaw === 'object'
        ? (paymentRaw as BanecoPayment)
        : ({} as BanecoPayment);
    const qrId = String(payment.qrId ?? root.qrId ?? '').trim();
    const orderId = String(payment.transactionId ?? '').trim() || undefined;
    return {
      valid: Boolean(qrId),
      qrId,
      orderId,
      raw: root,
    };
  }

  webhookSuccessResponse(): Record<string, unknown> {
    return { responseCode: 0, message: '' };
  }

  private async encrypt(plain: string): Promise<string> {
    const cacheKey = `${this.baseUrl}|${this.aesKey}|${plain}`;
    const cached = this.encryptCache.get(cacheKey);
    if (cached) return cached;
    try {
      const remote = await encryptBanecoFieldRemote(this.baseUrl, plain, this.aesKey);
      this.encryptCache.set(cacheKey, remote);
      return remote;
    } catch {
      const local = encryptBanecoFieldLocal(plain, this.aesKey);
      this.encryptCache.set(cacheKey, local);
      return local;
    }
  }

  private async obtainToken(force = false): Promise<string> {
    if (!force && this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }
    const { status, data } = await this.fetchJson<BanecoApiResponse>(
      `${this.baseUrl}/api/authentication/authenticate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: this.userName.trim(),
          password: await this.encrypt(this.password),
        }),
      },
    );
    if (status === 401) {
      throw new Error(data.message || 'Autenticación Baneco rechazada.');
    }
    this.assertOk(data, status);
    const token = data.token?.trim();
    if (!token) throw new Error('Baneco no devolvió token.');
    this.tokenCache = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return token;
  }

  private async authorizedFetch<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let token = await this.obtainToken();
    let headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string> | undefined),
    };
    let { status, data } = await this.fetchJson<BanecoApiResponse>(url, { ...init, headers });
    if (status === 401) {
      token = await this.obtainToken(true);
      headers = { ...headers, Authorization: `Bearer ${token}` };
      ({ status, data } = await this.fetchJson<BanecoApiResponse>(url, { ...init, headers }));
    }
    this.assertOk(data, status);
    return data as T;
  }

  private async fetchJson<T>(url: string, init: RequestInit): Promise<{ status: number; data: T }> {
    const res = await fetch(url, init);
    const text = await res.text();
    let data: T;
    try {
      data = text ? (JSON.parse(text) as T) : ({} as T);
    } catch {
      throw new Error(`Respuesta Baneco no válida (${res.status}): ${text.slice(0, 200)}`);
    }
    return { status: res.status, data };
  }

  private assertOk(data: BanecoApiResponse, httpStatus: number): void {
    const code = data.responseCode;
    if (httpStatus >= 400 || (code !== undefined && code !== 0)) {
      throw new Error(
        data.message?.trim() || `Error Baneco (responseCode=${code ?? httpStatus})`,
      );
    }
  }

  private formatDueDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private parsePaidAt(payment?: BanecoPayment): Date {
    if (!payment?.paymentDate) return new Date();
    const time = payment.paymentTime?.trim() || '00:00:00';
    const iso = `${payment.paymentDate.slice(0, 10)}T${time}`;
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
}
