import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BillingPeriod,
  PlanCode,
  normalizePlanCode,
  parseMedfileExternalReference,
} from '@medfile/types';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MercadoPagoService } from './mercadopago.service';
import { PaymentEvent, PaymentEventDocument } from './payment-event.schema';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly subscriptionsService: SubscriptionsService,
    @InjectModel(PaymentEvent.name)
    private readonly paymentEventModel: Model<PaymentEventDocument>,
  ) {}

  createCheckout(input: {
    tenantId: string;
    payerEmail: string;
    planCode: PlanCode;
    billingPeriod: BillingPeriod;
  }) {
    return this.mercadoPagoService.createSubscriptionCheckout(input);
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
      this.logger.error(`Webhook MP failed (${eventKey})`, error instanceof Error ? error.stack : error);
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
