import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getPlanByCode, normalizePlanCode } from '@medfile/types';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

export type AuditInput = {
  tenantId: string;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async log(input: AuditInput) {
    try {
      const subscription = await this.subscriptionsService.findRawByTenantId(input.tenantId);
      const plan = getPlanByCode(normalizePlanCode(subscription?.planCode ?? 'free'));

      if (!plan.capabilities.auditLog) {
        return null;
      }

      return this.auditModel.create({
        tenantId: input.tenantId,
        userId: input.userId,
        userRole: input.userRole,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        metadata: input.metadata,
      });
    } catch (error) {
      this.logger.warn(`Audit log failed: ${String(error)}`);
      return null;
    }
  }

  async listForTenant(tenantId: string, limit = 50) {
    const subscription = await this.subscriptionsService.findRawByTenantId(tenantId);
    const plan = getPlanByCode(normalizePlanCode(subscription?.planCode ?? 'free'));

    if (!plan.capabilities.auditLog) {
      return [];
    }

    const entries = await this.auditModel
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100))
      .lean()
      .exec();

    return entries.map((entry) => ({
      id: String(entry._id),
      userId: entry.userId,
      userRole: entry.userRole,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId ?? null,
      metadata: entry.metadata ?? null,
      at: (entry as { createdAt?: Date }).createdAt?.toISOString() ?? null,
    }));
  }
}
