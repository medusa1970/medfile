import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BillingPeriod,
  PlanCode,
  buildMedfileExternalReference,
  calculatePlanChargeBob,
  getMercadoPagoRecurringConfig,
  getPlanByCode,
  isPaidPlan,
  normalizePlanCode,
} from '@medfile/types';

interface MercadoPagoPreapproval {
  id: string;
  status: string;
  init_point?: string;
  sandbox_init_point?: string;
  external_reference?: string;
  payer_email?: string;
  auto_recurring?: {
    transaction_amount?: number;
    currency_id?: string;
  };
  date_created?: string;
  last_modified?: string;
}

export interface MercadoPagoCheckoutResult {
  mode: 'mercadopago' | 'mock';
  preapprovalId: string;
  initPoint: string;
  amountBob: number;
  planCode: PlanCode;
  billingPeriod: BillingPeriod;
}

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly apiBase = 'https://api.mercadopago.com';

  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.getAccessToken());
  }

  useMockPayments() {
    const provider = this.config.get<string>('PAYMENTS_PROVIDER', 'mock');
    if (provider === 'mock') return true;
    return !this.isConfigured();
  }

  async createSubscriptionCheckout(input: {
    tenantId: string;
    payerEmail: string;
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  }): Promise<MercadoPagoCheckoutResult> {
    const planCode = normalizePlanCode(input.planCode);
    if (!isPaidPlan(planCode)) {
      throw new BadRequestException('Solo los planes de pago requieren checkout.');
    }

    const plan = getPlanByCode(planCode);
    const amountBob = calculatePlanChargeBob(planCode, input.billingPeriod);
    const recurring = getMercadoPagoRecurringConfig(input.billingPeriod);
    const externalReference = buildMedfileExternalReference(
      input.tenantId,
      planCode,
      input.billingPeriod,
    );

    if (this.useMockPayments()) {
      const preapprovalId = `mock_preapproval_${input.tenantId}_${planCode}_${Date.now()}`;
      const webOrigin = this.config.get<string>('WEB_ORIGIN', 'http://localhost:3100').split(',')[0];
      return {
        mode: 'mock',
        preapprovalId,
        initPoint: `${webOrigin}/suscripcion?checkout=mock&preapprovalId=${encodeURIComponent(preapprovalId)}&plan=${planCode}&period=${input.billingPeriod}`,
        amountBob,
        planCode,
        billingPeriod: input.billingPeriod,
      };
    }

    const accessToken = this.getAccessToken();
    const webOrigin = this.config.get<string>('WEB_ORIGIN', 'http://localhost:3100').split(',')[0];
    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() + 5);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 10);

    const body = {
      reason: `Medfile ${plan.name}`,
      external_reference: externalReference,
      payer_email: input.payerEmail,
      auto_recurring: {
        frequency: recurring.frequency,
        frequency_type: recurring.frequencyType,
        transaction_amount: amountBob,
        currency_id: 'BOB',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
      back_url: `${webOrigin}/suscripcion?checkout=return`,
      status: 'pending',
    };

    const response = await fetch(`${this.apiBase}/preapproval`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as MercadoPagoPreapproval & {
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      this.logger.error(`Mercado Pago preapproval error: ${JSON.stringify(payload)}`);
      throw new ServiceUnavailableException(
        payload.message || payload.error || 'No se pudo iniciar el pago con Mercado Pago.',
      );
    }

    const initPoint = payload.init_point || payload.sandbox_init_point;
    if (!initPoint) {
      throw new ServiceUnavailableException('Mercado Pago no devolvio URL de checkout.');
    }

    return {
      mode: 'mercadopago',
      preapprovalId: payload.id,
      initPoint,
      amountBob,
      planCode,
      billingPeriod: input.billingPeriod,
    };
  }

  async getPreapproval(preapprovalId: string) {
    if (preapprovalId.startsWith('mock_preapproval_')) {
      return {
        id: preapprovalId,
        status: 'authorized',
        external_reference: undefined,
      } satisfies MercadoPagoPreapproval;
    }

    const accessToken = this.getAccessToken();
    const response = await fetch(`${this.apiBase}/preapproval/${preapprovalId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = (await response.json()) as MercadoPagoPreapproval & { message?: string };
    if (!response.ok) {
      throw new ServiceUnavailableException(
        payload.message || 'No se pudo consultar la suscripcion en Mercado Pago.',
      );
    }

    return payload;
  }

  private getAccessToken() {
    return this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN')?.trim() ?? '';
  }
}
