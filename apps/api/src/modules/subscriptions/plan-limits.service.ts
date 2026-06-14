import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getPlanByCode, isQuotaExceeded, normalizePlanCode, type PlanCode } from '@medfile/types';
import { Patient, PatientDocument } from '../patients/patient.schema';
import { PlanLimitExceededException } from './plan-limit-exceeded.exception';
import { Subscription, SubscriptionDocument } from './subscription.schema';

function currentUsagePeriodMonth() {
  return new Date().toISOString().slice(0, 7);
}

function suggestedUpgrade(planCode: PlanCode): PlanCode | undefined {
  if (planCode === 'free') return 'basic';
  if (planCode === 'basic') return 'professional';
  return undefined;
}

@Injectable()
export class PlanLimitsService {
  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {}

  async assertCanCreatePatient(tenantId: string) {
    const subscription = await this.loadSubscription(tenantId);
    const patientsUsed = await this.syncPatientsUsed(tenantId);
    const limit = getPlanByCode(subscription.planCode).limits.patients;

    if (isQuotaExceeded(patientsUsed, limit)) {
      throw new PlanLimitExceededException(
        'patients',
        `Has alcanzado el limite de ${limit} pacientes de tu plan. Mejora tu suscripcion para registrar mas.`,
        suggestedUpgrade(normalizePlanCode(subscription.planCode)),
      );
    }
  }

  async recordPatientCreated(tenantId: string) {
    await this.subscriptionModel
      .updateOne({ tenantId }, { $inc: { patientsUsed: 1 } })
      .exec();
  }

  async assertCanCreateUploadRequest(tenantId: string) {
    const subscription = await this.ensureUsagePeriod(tenantId);
    const plan = getPlanByCode(subscription.planCode);
    const used = subscription.uploadRequestsUsedThisMonth ?? 0;
    const limit = plan.limits.uploadRequestsPerMonth;

    if (isQuotaExceeded(used, limit)) {
      throw new PlanLimitExceededException(
        'uploadRequests',
        `Has alcanzado el limite de ${limit} solicitudes de subida este mes. Mejora tu plan o espera al proximo mes.`,
        suggestedUpgrade(normalizePlanCode(subscription.planCode)),
      );
    }
  }

  async recordUploadRequestCreated(tenantId: string) {
    await this.ensureUsagePeriod(tenantId);
    await this.subscriptionModel
      .updateOne({ tenantId }, { $inc: { uploadRequestsUsedThisMonth: 1 } })
      .exec();
  }

  async assertCanAddStorage(tenantId: string, bytes: number) {
    if (bytes <= 0) return;

    const subscription = await this.loadSubscription(tenantId);
    const used = subscription.storageUsedBytes ?? 0;
    const limit = subscription.storageLimitBytes;

    if (used + bytes > limit) {
      throw new PlanLimitExceededException(
        'storage',
        `No hay espacio suficiente en tu plan (${this.formatBytes(limit)}). Libera archivos o mejora tu suscripcion.`,
        suggestedUpgrade(normalizePlanCode(subscription.planCode)),
      );
    }
  }

  async recordStorageAdded(tenantId: string, bytes: number) {
    if (bytes <= 0) return;

    await this.subscriptionModel
      .updateOne({ tenantId }, { $inc: { storageUsedBytes: bytes } })
      .exec();
  }

  async assertCanSendWhatsApp(tenantId: string) {
    const subscription = await this.ensureUsagePeriod(tenantId);
    const plan = getPlanByCode(subscription.planCode);

    if (!plan.capabilities.whatsappAutomated) {
      throw new PlanLimitExceededException(
        'whatsappMessages',
        'WhatsApp automatico requiere plan Basico o Profesional. Puedes usar el boton wa.me manual en Plan Gratis.',
        'basic',
      );
    }

    const used = subscription.whatsappMessagesUsedThisMonth ?? 0;
    const limit = plan.limits.whatsappMessagesPerMonth;

    if (isQuotaExceeded(used, limit)) {
      throw new PlanLimitExceededException(
        'whatsappMessages',
        `Has usado los ${limit} WhatsApp automaticos incluidos este mes. Mejora a Profesional o espera al proximo mes.`,
        suggestedUpgrade(normalizePlanCode(subscription.planCode)),
      );
    }
  }

  async recordWhatsAppSent(tenantId: string, count = 1) {
    if (count <= 0) return;

    await this.ensureUsagePeriod(tenantId);
    await this.subscriptionModel
      .updateOne({ tenantId }, { $inc: { whatsappMessagesUsedThisMonth: count } })
      .exec();
  }

  async syncPatientsUsed(tenantId: string) {
    const count = await this.patientModel
      .countDocuments({ tenantId, status: { $ne: 'archived' } })
      .exec();

    await this.subscriptionModel.updateOne({ tenantId }, { $set: { patientsUsed: count } }).exec();
    return count;
  }

  async ensureUsagePeriod(tenantId: string) {
    const period = currentUsagePeriodMonth();
    const subscription = await this.subscriptionModel.findOne({ tenantId }).exec();

    if (!subscription) {
      throw new NotFoundException('Suscripcion no encontrada.');
    }

    if (subscription.usagePeriodMonth === period) {
      return subscription;
    }

    subscription.usagePeriodMonth = period;
    subscription.uploadRequestsUsedThisMonth = 0;
    subscription.whatsappMessagesUsedThisMonth = 0;
    await subscription.save();

    return subscription;
  }

  private async loadSubscription(tenantId: string) {
    const subscription = await this.subscriptionModel.findOne({ tenantId }).exec();

    if (!subscription) {
      throw new NotFoundException('Suscripcion no encontrada.');
    }

    return subscription;
  }

  private formatBytes(bytes: number) {
    if (bytes >= 1073741824) return `${Math.round(bytes / 1073741824)} GB`;
    if (bytes >= 1048576) return `${Math.round(bytes / 1048576)} MB`;
    return `${bytes} B`;
  }
}
