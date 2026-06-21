import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../subscriptions/subscription.schema';
import { Tenant, TenantDocument } from '../tenants/tenant.schema';
import { User, UserDocument } from '../users/user.schema';
import { PlatformSettingsService } from './platform-settings.service';

type LeanTenant = Tenant & { _id: unknown; createdAt?: Date };

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  async getOverview() {
    const [tenants, users, subscriptions, paidPlans] = await Promise.all([
      this.tenantModel.countDocuments().exec(),
      this.userModel.countDocuments().exec(),
      this.subscriptionModel.countDocuments().exec(),
      this.subscriptionModel.countDocuments({ planCode: { $in: ['basic', 'professional'] } }).exec(),
    ]);

    return {
      tenants,
      users,
      subscriptions,
      paidTenants: paidPlans,
    };
  }

  async listClients() {
    const tenants = (await this.tenantModel
      .find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean()
      .exec()) as LeanTenant[];
    const tenantIds = tenants.map((tenant) => String(tenant._id));

    const [owners, subscriptions] = await Promise.all([
      this.userModel
        .find({ tenantId: { $in: tenantIds }, role: 'owner' })
        .lean()
        .exec(),
      this.subscriptionModel
        .find({ tenantId: { $in: tenantIds } })
        .lean()
        .exec(),
    ]);

    const ownerByTenant = new Map(owners.map((owner) => [owner.tenantId, owner]));
    const subscriptionByTenant = new Map(
      subscriptions.map((subscription) => [subscription.tenantId, subscription]),
    );

    return tenants.map((tenant) => {
        const id = String(tenant._id);
        const owner = ownerByTenant.get(id);
        const subscription = subscriptionByTenant.get(id);

        return {
          id,
          name: tenant.name,
          medfileCode: tenant.medfileCode,
          status: tenant.status,
          createdAt: tenant.createdAt ?? null,
          owner: owner
            ? {
                id: String(owner._id),
                fullName: owner.fullName,
                email: owner.email,
                status: owner.status,
                emailVerified: owner.emailVerified,
              }
            : null,
          subscription: subscription
            ? {
                planCode: subscription.planCode,
                status: subscription.status,
                paymentProvider: subscription.paymentProvider ?? null,
                billingPeriod: subscription.billingPeriod ?? 'monthly',
              }
            : null,
        };
      });
  }

  getPaymentSettings() {
    return this.platformSettingsService.getPaymentsSettings();
  }

  updatePaymentSettings(input: Parameters<PlatformSettingsService['updatePaymentsSettings']>[0]) {
    return this.platformSettingsService.updatePaymentsSettings(input);
  }
}
