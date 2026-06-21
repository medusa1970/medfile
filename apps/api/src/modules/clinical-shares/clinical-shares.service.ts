import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getPlanByCode, isValidMedfileCode, normalizeMedfileCode, normalizePlanCode } from '@medfile/types';
import type { ClinicalSharePermission } from '@medfile/types';
import { assertValidObjectId } from '../../common/assert-valid-object-id';
import { serializeDocument, serializeDocuments } from '../../common/serialize-document';
import { MedicalDocument } from '../documents/medical-document.schema';
import { Encounter } from '../encounters/encounter.schema';
import { Patient } from '../patients/patient.schema';
import { PlanLimitExceededException } from '../subscriptions/plan-limit-exceeded.exception';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { TenantsService } from '../tenants/tenants.service';
import { ClinicalShare, ClinicalShareDocument } from './clinical-share.schema';
import { CreateClinicalShareDto } from './dto/create-clinical-share.dto';

const DEFAULT_VIEW_PERMISSIONS: ClinicalSharePermission[] = [
  'view_summary',
  'view_encounters',
  'view_documents',
];

@Injectable()
export class ClinicalSharesService {
  constructor(
    @InjectModel(ClinicalShare.name)
    private readonly clinicalShareModel: Model<ClinicalShareDocument>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<Patient>,
    @InjectModel(Encounter.name)
    private readonly encounterModel: Model<Encounter>,
    @InjectModel(MedicalDocument.name)
    private readonly documentModel: Model<MedicalDocument>,
    private readonly tenantsService: TenantsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  private async assertCanShareClinicalHistory(tenantId: string) {
    const subscription = await this.subscriptionsService.findRawByTenantId(tenantId);
    const plan = getPlanByCode(normalizePlanCode(subscription?.planCode ?? 'free'));

    if (!plan.capabilities.clinicalShare) {
      throw new PlanLimitExceededException(
        'users',
        'Compartir historial con colegas Medfile requiere plan Profesional.',
        'professional',
      );
    }
  }

  async createForTenant(
    sourceTenantId: string,
    userId: string,
    input: CreateClinicalShareDto,
  ) {
    await this.assertCanShareClinicalHistory(sourceTenantId);

    assertValidObjectId(input.patientId);

    if (!isValidMedfileCode(input.targetMedfileCode)) {
      throw new BadRequestException('Codigo Medfile invalido. Formato: MF-XXXXXX');
    }

    const targetCode = normalizeMedfileCode(input.targetMedfileCode);
    const targetTenant = await this.tenantsService.findByMedfileCode(targetCode);
    const targetTenantId = String(targetTenant._id);

    if (targetTenantId === sourceTenantId) {
      throw new BadRequestException('No puedes compartir contigo mismo. Usa otro Codigo Medfile.');
    }

    if (input.intention !== 'view_only') {
      throw new BadRequestException(
        'Por ahora solo esta disponible "solo mostrar". Colaborar y transferir llegaran pronto.',
      );
    }

    const patient = await this.patientModel
      .findOne({ _id: input.patientId, tenantId: sourceTenantId })
      .lean()
      .exec();

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado en tu consultorio.');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + input.durationDays);

    const share = await this.clinicalShareModel.create({
      sourceTenantId,
      sourcePatientId: input.patientId,
      targetTenantId,
      targetMedfileCode: targetCode,
      intention: input.intention,
      permissions: input.permissions?.length ? input.permissions : DEFAULT_VIEW_PERMISSIONS,
      scope: {
        includeSummary: input.scope?.includeSummary ?? true,
        encounterLimit: input.scope?.encounterLimit ?? 10,
        documentIds: input.scope?.documentIds ?? [],
      },
      status: 'pending',
      expiresAt,
      message: input.message,
      consent: {
        recordedAt: input.consent.recordedAt
          ? new Date(input.consent.recordedAt)
          : new Date(),
        method: input.consent.method,
        recordedByUserId: userId,
      },
      createdByUserId: userId,
    });

    return this.enrichShare(serializeDocument(share.toObject()));
  }

  async listSent(sourceTenantId: string) {
    await this.expireStaleShares();
    const shares = await this.clinicalShareModel
      .find({ sourceTenantId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return Promise.all(
      serializeDocuments(shares).map((share) => this.enrichShare(share)),
    );
  }

  async listInbox(targetTenantId: string) {
    await this.expireStaleShares();
    const shares = await this.clinicalShareModel
      .find({ targetTenantId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return Promise.all(
      serializeDocuments(shares).map((share) => this.enrichShare(share)),
    );
  }

  async acceptShare(targetTenantId: string, userId: string, shareId: string) {
    assertValidObjectId(shareId);
    const share = await this.getShareOrThrow(shareId);

    if (share.targetTenantId !== targetTenantId) {
      throw new ForbiddenException('Este acceso no fue enviado a tu consultorio.');
    }

    if (share.status !== 'pending') {
      throw new BadRequestException('Esta solicitud ya fue procesada.');
    }

    if (this.isExpired(share)) {
      await this.clinicalShareModel.updateOne({ _id: shareId }, { status: 'expired' });
      throw new BadRequestException('Esta solicitud ya expiro.');
    }

    const updated = await this.clinicalShareModel
      .findByIdAndUpdate(
        shareId,
        {
          status: 'active',
          acceptedByUserId: userId,
          acceptedAt: new Date(),
        },
        { new: true },
      )
      .lean()
      .exec();

    return this.enrichShare(serializeDocument(updated!));
  }

  async rejectShare(targetTenantId: string, shareId: string) {
    assertValidObjectId(shareId);
    const share = await this.getShareOrThrow(shareId);

    if (share.targetTenantId !== targetTenantId) {
      throw new ForbiddenException('Este acceso no fue enviado a tu consultorio.');
    }

    if (share.status !== 'pending') {
      throw new BadRequestException('Esta solicitud ya fue procesada.');
    }

    const updated = await this.clinicalShareModel
      .findByIdAndUpdate(shareId, { status: 'rejected' }, { new: true })
      .lean()
      .exec();

    return this.enrichShare(serializeDocument(updated!));
  }

  async revokeShare(sourceTenantId: string, userId: string, shareId: string) {
    assertValidObjectId(shareId);
    const share = await this.getShareOrThrow(shareId);

    if (share.sourceTenantId !== sourceTenantId) {
      throw new ForbiddenException('Solo el medico titular puede revocar este acceso.');
    }

    if (!['pending', 'active'].includes(share.status)) {
      throw new BadRequestException('Esta solicitud ya no se puede revocar.');
    }

    const updated = await this.clinicalShareModel
      .findByIdAndUpdate(
        shareId,
        { status: 'revoked', revokedAt: new Date(), revokedByUserId: userId },
        { new: true },
      )
      .lean()
      .exec();

    return this.enrichShare(serializeDocument(updated!));
  }

  async getSharedPatientView(tenantId: string, shareId: string) {
    assertValidObjectId(shareId);
    await this.expireStaleShares();
    const fresh = await this.getShareOrThrow(shareId);

    const isSource = fresh.sourceTenantId === tenantId;
    const isTarget = fresh.targetTenantId === tenantId;

    if (!isSource && !isTarget) {
      throw new ForbiddenException('No tienes acceso a este historial compartido.');
    }

    if (isTarget && fresh.status !== 'active') {
      throw new BadRequestException('Este acceso aun no esta activo o ya finalizo.');
    }

    if (isTarget && this.isExpired(fresh)) {
      await this.clinicalShareModel.updateOne({ _id: shareId }, { status: 'expired' });
      throw new BadRequestException('Este acceso expiro.');
    }

    const patient = await this.patientModel
      .findOne({ _id: fresh.sourcePatientId, tenantId: fresh.sourceTenantId })
      .lean()
      .exec();

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    const permissions = fresh.permissions ?? DEFAULT_VIEW_PERMISSIONS;
    const encounterLimit = fresh.scope?.encounterLimit ?? 10;

    const encounters = permissions.includes('view_encounters')
      ? await this.encounterModel
          .find({ tenantId: fresh.sourceTenantId, patientId: fresh.sourcePatientId })
          .sort({ occurredAt: -1 })
          .limit(encounterLimit)
          .lean()
          .exec()
      : [];

    const documentQuery: Record<string, unknown> = {
      tenantId: fresh.sourceTenantId,
      patientId: fresh.sourcePatientId,
    };

    if (fresh.scope?.documentIds?.length) {
      documentQuery._id = { $in: fresh.scope.documentIds };
    }

    const documents = permissions.includes('view_documents')
      ? await this.documentModel
          .find(documentQuery)
          .sort({ uploadedAt: -1 })
          .limit(30)
          .lean()
          .exec()
      : [];

    const enrichedShare = await this.enrichShare(serializeDocument(fresh));

    return {
      share: enrichedShare,
      patient: {
        fullName: patient.fullName,
        documentId: permissions.includes('view_contact') ? patient.documentId : undefined,
        birthDate: patient.birthDate?.toISOString?.() ?? patient.birthDate,
        phone: permissions.includes('view_contact') ? patient.phone : undefined,
        email: permissions.includes('view_contact') ? patient.email : undefined,
        status: patient.status,
        medicalBackground: permissions.includes('view_summary')
          ? patient.medicalBackground
          : undefined,
      },
      encounters: serializeDocuments(encounters).map((item) => ({
        id: item.id,
        occurredAt: item.occurredAt,
        reason: item.reason,
        diagnosis: item.diagnosis,
        presentIllness: item.presentIllness,
      })),
      documents: serializeDocuments(documents).map((item) => {
        const row = item as typeof item & { createdAt?: string; documentType?: string; mimeType?: string };
        return {
          id: row.id,
          name: row.name,
          type: row.documentType ?? row.mimeType,
          status: row.status,
          uploadedAt: row.createdAt,
        };
      }),
    };
  }

  private async getShareOrThrow(shareId: string) {
    const share = await this.clinicalShareModel.findById(shareId).lean().exec();
    if (!share) {
      throw new NotFoundException('Solicitud de acceso no encontrada.');
    }
    return share;
  }

  private isExpired(share: { expiresAt: Date | string; status: string }) {
    if (share.status === 'expired') return true;
    return new Date(share.expiresAt).getTime() < Date.now();
  }

  private async expireStaleShares() {
    await this.clinicalShareModel.updateMany(
      {
        status: { $in: ['pending', 'active'] },
        expiresAt: { $lt: new Date() },
      },
      { status: 'expired' },
    );
  }

  private async enrichShare(share: Record<string, unknown> & { id: string }) {
    const [sourceTenant, targetTenant, patient] = await Promise.all([
      this.tenantsService.findById(String(share.sourceTenantId)),
      this.tenantsService.findById(String(share.targetTenantId)),
      this.patientModel.findById(String(share.sourcePatientId)).lean().exec(),
    ]);

    return {
      ...share,
      sourceTenantName: sourceTenant?.name,
      sourceMedfileCode: sourceTenant?.medfileCode,
      targetTenantName: targetTenant?.name,
      targetMedfileCode: share.targetMedfileCode ?? targetTenant?.medfileCode,
      sourcePatientName: patient?.fullName,
      expiresAt:
        share.expiresAt instanceof Date
          ? share.expiresAt.toISOString()
          : share.expiresAt,
      createdAt:
        share.createdAt instanceof Date
          ? share.createdAt.toISOString()
          : share.createdAt,
      acceptedAt:
        share.acceptedAt instanceof Date
          ? share.acceptedAt.toISOString()
          : share.acceptedAt,
      revokedAt:
        share.revokedAt instanceof Date
          ? share.revokedAt.toISOString()
          : share.revokedAt,
    };
  }
}
