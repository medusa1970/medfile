import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import {
  BillingPeriod,
  PlanCode,
  calculatePlanChargeBob,
  getPlanByCode,
  isPaidPlan,
  normalizePlanCode,
  parseMedfileExternalReference,
} from '@medfile/types';
import { PlatformSettingsService } from '../admin/platform-settings.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { EconomicoQrService } from './economico-qr.service';
import { MercadoPagoService } from './mercadopago.service';
import { PaymentEvent, PaymentEventDocument } from './payment-event.schema';
import { QrPayment, QrPaymentDocument } from './qr-payment.schema';

export type QrCheckoutView = {
  checkoutId: string;
  mode: 'mock' | 'economico_qr';
  qrImage: string;
  qrImageUrl?: string;
  expiresAt: string;
  status: 'pending' | 'paid' | 'expired';
  amountBob: number;
  planCode: PlanCode;
  billingPeriod: BillingPeriod;
  orderId: string;
  instructions?: string;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly economicoQrService: EconomicoQrService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly platformSettingsService: PlatformSettingsService,
    @InjectModel(PaymentEvent.name)
    private readonly paymentEventModel: Model<PaymentEventDocument>,
    @InjectModel(QrPayment.name)
    private readonly qrPaymentModel: Model<QrPaymentDocument>,
  ) {}

  async getPaymentOptions() {
    const settings = await this.platformSettingsService.getPaymentsSettings();
    const mercadopago =
      settings.mercadopagoEnabled &&
      (this.mercadoPagoService.isConfigured() || this.mercadoPagoService.useMockPayments());
    const economicoQr =
      settings.economicoQrEnabled &&
      (this.economicoQrService.isConfigured() || this.economicoQrService.useMock());

    return {
      mercadopago,
      economicoQr,
      defaultProvider: settings.defaultProvider,
      currency: 'BOB' as const,
      economicoInstructions: settings.economicoInstructions,
      economicoMerchantLabel: settings.economicoMerchantLabel,
    };
  }

  createCheckout(input: {
    tenantId: string;
    payerEmail: string;
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  }) {
    return this.mercadoPagoService.createSubscriptionCheckout(input);
  }

  async createQrCheckout(input: {
    tenantId: string;
    userId: string;
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  }): Promise<QrCheckoutView> {
    const settings = await this.platformSettingsService.getPaymentsSettings();
    if (!settings.economicoQrEnabled) {
      throw new ServiceUnavailableException('Pago QR Banco Económico no habilitado.');
    }

    const planCode = normalizePlanCode(input.planCode);
    if (!isPaidPlan(planCode)) {
      throw new BadRequestException('Solo los planes de pago requieren checkout QR.');
    }

    const plan = getPlanByCode(planCode);
    const amountBob = calculatePlanChargeBob(planCode, input.billingPeriod);
    const orderId = `MF-${planCode.slice(0, 3)}-${randomUUID()}`.slice(0, 50);

    const generated = await this.economicoQrService.createCheckout({
      amount: amountBob,
      description: `Medfile ${plan.name}`,
      orderId,
      expiresInSec: 1800,
    });

    const record = await this.qrPaymentModel.create({
      tenantId: input.tenantId,
      userId: input.userId,
      planCode,
      billingPeriod: input.billingPeriod,
      orderId: generated.orderId,
      qrId: generated.qrId,
      amountBob,
      currency: 'BOB',
      status: 'pending',
      expiresAt: generated.expiresAt,
      qrImageDataUrl: generated.qrImageDataUrl,
    });

    await this.subscriptionsService.markCheckoutPending({
      tenantId: input.tenantId,
      preapprovalId: generated.orderId,
      planCode,
      billingPeriod: input.billingPeriod,
      provider: generated.mode === 'mock' ? 'mock' : 'economico_qr',
    });

    const qrImage = generated.qrImageDataUrl;
    const qrImageUrl = qrImage.startsWith('http') ? qrImage : undefined;

    return {
      checkoutId: String(record._id),
      mode: generated.mode,
      qrImage,
      qrImageUrl,
      expiresAt: generated.expiresAt.toISOString(),
      status: 'pending',
      amountBob,
      planCode,
      billingPeriod: input.billingPeriod,
      orderId: generated.orderId,
      instructions: settings.economicoInstructions,
    };
  }

  async getQrCheckoutStatus(checkoutId: string, tenantId: string): Promise<QrCheckoutView> {
    const record = await this.qrPaymentModel.findById(checkoutId).lean().exec();
    if (!record || record.tenantId !== tenantId) {
      throw new NotFoundException('Checkout no encontrado.');
    }

    if (record.status === 'paid' || record.status === 'expired') {
      return this.toQrCheckoutView(record);
    }

    const remote = await this.economicoQrService.getStatus(record.qrId, {
      expiresAt: record.expiresAt,
    });

    if (remote.status === 'paid') {
      await this.markQrPaid(record, remote.raw);
      const updated = await this.qrPaymentModel.findById(record._id).lean().exec();
      if (!updated) throw new NotFoundException('Checkout no encontrado.');
      return this.toQrCheckoutView(updated);
    }

    if (remote.status === 'expired') {
      await this.qrPaymentModel
        .updateOne({ _id: record._id }, { $set: { status: 'expired' } })
        .exec();
      return this.toQrCheckoutView({ ...record, status: 'expired' });
    }

    return this.toQrCheckoutView(record);
  }

  async confirmMockQrCheckout(checkoutId: string, tenantId: string) {
    if (!this.economicoQrService.useMock()) {
      throw new NotFoundException('Confirmación simulada no disponible.');
    }

    const record = await this.qrPaymentModel.findById(checkoutId).lean().exec();
    if (!record || record.tenantId !== tenantId) {
      throw new NotFoundException('Checkout no encontrado.');
    }

    if (record.status === 'paid') {
      return this.toQrCheckoutView(record);
    }

    await this.markQrPaid(record, { mock: true });
    const updated = await this.qrPaymentModel.findById(checkoutId).lean().exec();
    return this.toQrCheckoutView(updated!);
  }

  async syncCheckoutForTenant(tenantId: string) {
    const subscription = await this.subscriptionsService.findRawByTenantId(tenantId);
    if (!subscription?.mercadopagoPreapprovalId) {
      throw new NotFoundException('No hay un checkout pendiente para sincronizar.');
    }

    return this.applyPreapprovalStatus(
      subscription.mercadopagoPreapprovalId,
      `sync:${tenantId}:${Date.now()}`,
    );
  }

  async confirmMockCheckout(input: {
    tenantId: string;
    preapprovalId: string;
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  }) {
    if (!this.mercadoPagoService.useMockPayments()) {
      throw new NotFoundException('Checkout simulado no disponible.');
    }

    await this.subscriptionsService.markCheckoutPending({
      tenantId: input.tenantId,
      preapprovalId: input.preapprovalId,
      planCode: input.planCode,
      billingPeriod: input.billingPeriod,
      provider: 'mock',
    });

    return this.subscriptionsService.activatePaidPlan({
      tenantId: input.tenantId,
      planCode: input.planCode,
      billingPeriod: input.billingPeriod,
      preapprovalId: input.preapprovalId,
      provider: 'mock',
    });
  }

  async handleMercadoPagoWebhook(input: { topic?: string; resourceId?: string; body?: unknown }) {
    const topic = input.topic ?? 'unknown';
    const resourceId = input.resourceId;

    if (!resourceId) {
      return { ok: true, ignored: true, reason: 'missing_resource_id' };
    }

    const eventKey = `mercadopago:${topic}:${resourceId}`;
    const existing = await this.paymentEventModel.findOne({ eventKey }).lean().exec();
    if (existing) {
      return { ok: true, duplicate: true };
    }

    try {
      if (topic === 'subscription_preapproval' || topic === 'preapproval') {
        await this.applyPreapprovalStatus(resourceId, eventKey, input.body);
        return { ok: true, processed: true };
      }

      await this.paymentEventModel.create({
        eventKey,
        provider: 'mercadopago',
        topic,
        payload: { body: input.body, resourceId },
        status: 'ignored',
      });

      return { ok: true, ignored: true, topic };
    } catch (error) {
      this.logger.error(
        `Webhook MP failed (${eventKey})`,
        error instanceof Error ? error.stack : error,
      );
      await this.paymentEventModel.create({
        eventKey: `${eventKey}:failed`,
        provider: 'mercadopago',
        topic,
        payload: { body: input.body, resourceId, error: String(error) },
        status: 'failed',
      });
      throw error;
    }
  }

  async handleEconomicoWebhook(body: unknown): Promise<Record<string, unknown>> {
    const parsed = this.economicoQrService.parseWebhook(body);
    if (!parsed.valid) {
      throw new BadRequestException('Webhook Baneco inválido.');
    }

    const eventKey = `economico_qr:${parsed.qrId}:${parsed.orderId ?? 'na'}`;
    const existing = await this.paymentEventModel.findOne({ eventKey }).lean().exec();
    if (existing) {
      return this.economicoQrService.webhookSuccessResponse();
    }

    const record =
      (await this.qrPaymentModel.findOne({ qrId: parsed.qrId }).lean().exec()) ??
      (parsed.orderId
        ? await this.qrPaymentModel.findOne({ orderId: parsed.orderId }).lean().exec()
        : null);

    if (record && record.status === 'pending') {
      await this.markQrPaid(record, parsed.raw);
    }

    await this.paymentEventModel.create({
      eventKey,
      provider: 'economico_qr',
      topic: 'qr_payment',
      tenantId: record?.tenantId,
      payload: parsed.raw,
      status: record ? 'processed' : 'ignored',
    });

    return this.economicoQrService.webhookSuccessResponse();
  }

  private async markQrPaid(
    record: {
      _id: unknown;
      tenantId: string;
      planCode: string;
      billingPeriod: BillingPeriod;
      orderId: string;
      status: string;
    },
    raw?: Record<string, unknown>,
  ) {
    if (record.status === 'paid') return;

    await this.qrPaymentModel
      .updateOne(
        { _id: String(record._id) },
        { $set: { status: 'paid', paidAt: new Date(), rawWebhook: raw } },
      )
      .exec();

    await this.subscriptionsService.activatePaidPlan({
      tenantId: record.tenantId,
      planCode: record.planCode,
      billingPeriod: record.billingPeriod,
      preapprovalId: record.orderId,
      provider: this.economicoQrService.useMock() ? 'mock' : 'economico_qr',
    });
  }

  private toQrCheckoutView(record: {
    _id: unknown;
    qrImageDataUrl?: string;
    expiresAt: Date;
    status: 'pending' | 'paid' | 'expired';
    amountBob: number;
    planCode: string;
    billingPeriod: BillingPeriod;
    orderId: string;
  }): QrCheckoutView {
    const qrImage = record.qrImageDataUrl ?? '';
    return {
      checkoutId: String(record._id),
      mode: this.economicoQrService.useMock() ? 'mock' : 'economico_qr',
      qrImage,
      qrImageUrl: qrImage.startsWith('http') ? qrImage : undefined,
      expiresAt: new Date(record.expiresAt).toISOString(),
      status: record.status,
      amountBob: record.amountBob,
      planCode: normalizePlanCode(record.planCode) as PlanCode,
      billingPeriod: record.billingPeriod,
      orderId: record.orderId,
    };
  }

  private async applyPreapprovalStatus(
    preapprovalId: string,
    eventKey: string,
    payload?: unknown,
  ) {
    const preapproval = await this.mercadoPagoService.getPreapproval(preapprovalId);
    const parsed = preapproval.external_reference
      ? parseMedfileExternalReference(preapproval.external_reference)
      : null;

    const subscription = parsed
      ? await this.subscriptionsService.findRawByTenantId(parsed.tenantId)
      : await this.subscriptionsService.findRawByPreapprovalId(preapprovalId);

    const tenantId = parsed?.tenantId ?? subscription?.tenantId;
    if (!tenantId) {
      await this.paymentEventModel.create({
        eventKey,
        provider: preapprovalId.startsWith('mock_') ? 'mock' : 'mercadopago',
        topic: 'subscription_preapproval',
        payload: { preapproval, body: payload },
        status: 'ignored',
      });
      return null;
    }

    const planCode = normalizePlanCode(parsed?.planCode ?? subscription?.pendingPlanCode ?? 'basic');
    const billingPeriod = (parsed?.billingPeriod ??
      subscription?.billingPeriod ??
      'monthly') as BillingPeriod;

    const status = preapproval.status?.toLowerCase();

    if (status === 'authorized' || status === 'active') {
      const result = await this.subscriptionsService.activatePaidPlan({
        tenantId,
        planCode,
        billingPeriod,
        preapprovalId,
        provider: preapprovalId.startsWith('mock_') ? 'mock' : 'mercadopago',
      });

      await this.paymentEventModel.create({
        eventKey,
        provider: preapprovalId.startsWith('mock_') ? 'mock' : 'mercadopago',
        topic: 'subscription_preapproval',
        tenantId,
        payload: { preapproval, body: payload },
        status: 'processed',
      });

      return result;
    }

    if (status === 'cancelled' || status === 'canceled') {
      const result = await this.subscriptionsService.downgradeToFree(tenantId);

      await this.paymentEventModel.create({
        eventKey,
        provider: 'mercadopago',
        topic: 'subscription_preapproval',
        tenantId,
        payload: { preapproval, body: payload },
        status: 'processed',
      });

      return result;
    }

    if (status === 'paused' || status === 'pending') {
      const pendingStatus =
        status === 'paused'
          ? 'past_due'
          : subscription?.status === 'past_due'
            ? 'past_due'
            : 'active';

      const result = await this.subscriptionsService.markCheckoutPending({
        tenantId,
        preapprovalId,
        planCode,
        billingPeriod,
        provider: 'mercadopago',
        status: pendingStatus,
      });

      await this.paymentEventModel.create({
        eventKey,
        provider: 'mercadopago',
        topic: 'subscription_preapproval',
        tenantId,
        payload: { preapproval, body: payload },
        status: 'processed',
      });

      return result;
    }

    await this.paymentEventModel.create({
      eventKey,
      provider: 'mercadopago',
      topic: 'subscription_preapproval',
      tenantId,
      payload: { preapproval, body: payload },
      status: 'ignored',
    });

    return null;
  }
}
