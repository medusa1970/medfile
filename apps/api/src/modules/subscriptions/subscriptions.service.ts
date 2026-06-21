import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { collectPlanUsageWarnings, normalizePlanCode } from '@medfile/types';
import { PlanLimitsService } from './plan-limits.service';
import { SimulateUpgradeDto } from './dto/simulate-upgrade.dto';
import { Subscription, SubscriptionDocument } from './subscription.schema';
import { getPlanByCode, subscriptionPlans } from './subscription-plans';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  createFreeForTenant(tenantId: string) {
    const plan = getPlanByCode('free');
    const usagePeriodMonth = new Date().toISOString().slice(0, 7);

    return this.subscriptionModel.create({
      tenantId,
      status: 'active',
      planCode: 'free',
      storageUsedBytes: 0,
      storageLimitBytes: plan.limits.storageBytes,
      patientsUsed: 0,
      uploadRequestsUsedThisMonth: 0,
      whatsappMessagesUsedThisMonth: 0,
      usagePeriodMonth,
    });
  }

  /** @deprecated Usar createFreeForTenant */
  createTrialForTenant(tenantId: string, _trialEndsAt?: Date) {
    return this.createFreeForTenant(tenantId);
  }

  async findCurrentForTenant(tenantId: string) {
    await this.planLimitsService.ensureUsagePeriod(tenantId);
    await this.planLimitsService.syncPatientsUsed(tenantId);
    const usersUsed = await this.planLimitsService.syncUsersUsed(tenantId);

    const subscription = await this.subscriptionModel.findOne({ tenantId }).lean().exec();
    const plan = getPlanByCode(subscription?.planCode ?? 'free');
    const fallback = {
      tenantId,
      status: 'active',
      planCode: 'free',
      trialEndsAt: null,
      storageUsedBytes: 0,
      storageLimitBytes: plan.limits.storageBytes,
      patientsUsed: 0,
      uploadRequestsUsedThisMonth: 0,
      whatsappMessagesUsedThisMonth: 0,
    };

    return this.enrichSubscription(subscription ?? fallback, usersUsed);
  }

  findPlans() {
    return subscriptionPlans;
  }

  async simulateUpgrade(tenantId: string, input: SimulateUpgradeDto) {
    return this.activatePaidPlan({
      tenantId,
      planCode: normalizePlanCode(input.planCode),
      billingPeriod: 'monthly',
      provider: 'mock',
    });
  }

  findRawByTenantId(tenantId: string) {
    return this.subscriptionModel.findOne({ tenantId }).lean().exec();
  }

  findRawByPreapprovalId(preapprovalId: string) {
    return this.subscriptionModel.findOne({ mercadopagoPreapprovalId: preapprovalId }).lean().exec();
  }

  async markCheckoutPending(input: {
    tenantId: string;
    preapprovalId: string;
    planCode: string;
    billingPeriod: 'monthly' | 'quarterly' | 'annual';
    provider: 'mock' | 'mercadopago' | 'economico_qr';
    status?: 'active' | 'past_due';
  }) {
    const subscription = await this.subscriptionModel
      .findOneAndUpdate(
        { tenantId: input.tenantId },
        {
          $set: {
            mercadopagoPreapprovalId: input.preapprovalId,
            pendingPlanCode: normalizePlanCode(input.planCode),
            billingPeriod: input.billingPeriod,
            paymentProvider: input.provider,
            ...(input.status ? { status: input.status } : {}),
          },
        },
        { new: true },
      )
      .lean()
      .exec();

    if (!subscription) {
      throw new NotFoundException('Suscripcion no encontrada.');
    }

    return this.enrichSubscription(subscription);
  }

  async activatePaidPlan(input: {
    tenantId: string;
    planCode: string;
    billingPeriod: 'monthly' | 'quarterly' | 'annual';
    preapprovalId?: string;
    provider?: 'mock' | 'mercadopago' | 'economico_qr';
  }) {
    const planCode = normalizePlanCode(input.planCode);
    const plan = getPlanByCode(planCode);

    const subscription = await this.subscriptionModel
      .findOneAndUpdate(
        { tenantId: input.tenantId },
        {
          $set: {
            status: 'active',
            planCode: plan.code,
            storageLimitBytes: plan.limits.storageBytes,
            trialEndsAt: null,
            pendingPlanCode: null,
            billingPeriod: input.billingPeriod,
            paymentProvider: input.provider,
            lastPaymentAt: new Date(),
            ...(input.preapprovalId ? { mercadopagoPreapprovalId: input.preapprovalId } : {}),
          },
        },
        { upsert: true, new: true },
      )
      .lean()
      .exec();

    return this.enrichSubscription(subscription);
  }

  async downgradeToFree(tenantId: string) {
    const plan = getPlanByCode('free');

    const subscription = await this.subscriptionModel
      .findOneAndUpdate(
        { tenantId },
        {
          $set: {
            status: 'active',
            planCode: 'free',
            storageLimitBytes: plan.limits.storageBytes,
            pendingPlanCode: null,
          },
        },
        { new: true },
      )
      .lean()
      .exec();

    if (!subscription) {
      throw new NotFoundException('Suscripcion no encontrada.');
    }

    return this.enrichSubscription(subscription);
  }

  private enrichSubscription(
    subscription: {
    tenantId: string;
    status: string;
    planCode: string;
    trialEndsAt?: Date | string | null;
    storageUsedBytes: number;
    storageLimitBytes: number;
    patientsUsed?: number;
    uploadRequestsUsedThisMonth?: number;
    whatsappMessagesUsedThisMonth?: number;
  },
    usersUsed = 1,
  ) {
    const planCode = normalizePlanCode(subscription.planCode);
    const plan = getPlanByCode(planCode);
    const trialEndsAt = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
    const trialDaysRemaining = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
      : null;

    const usage = {
      patients: {
        used: subscription.patientsUsed ?? 0,
        limit: plan.limits.patients,
      },
      users: {
        used: usersUsed,
        limit: plan.limits.users,
      },
      storage: {
        used: subscription.storageUsedBytes,
        limit: plan.limits.storageBytes,
      },
      uploadRequests: {
        used: subscription.uploadRequestsUsedThisMonth ?? 0,
        limit: plan.limits.uploadRequestsPerMonth,
      },
      whatsappMessages: {
        used: subscription.whatsappMessagesUsedThisMonth ?? 0,
        limit: plan.limits.whatsappMessagesPerMonth,
      },
    };

    return {
      ...subscription,
      planCode,
      plan,
      usage,
      usageWarnings: collectPlanUsageWarnings({ planCode, usage }),
      trial: {
        endsAt: trialEndsAt?.toISOString() ?? null,
        daysRemaining: trialDaysRemaining,
      },
    };
  }
}
