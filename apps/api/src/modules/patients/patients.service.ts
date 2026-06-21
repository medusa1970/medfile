import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { TenantRole } from '@medfile/types';
import { canPerformClinicalActions, isClinicalCaptureRole } from '@medfile/types';
import { assertValidObjectId } from '../../common/assert-valid-object-id';
import { serializeDocument, serializeDocuments } from '../../common/serialize-document';
import { PlanLimitsService } from '../subscriptions/plan-limits.service';
import { AuditService } from '../team/audit.service';
import { ClinicalCaptureService } from '../team/clinical-capture.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { Patient, PatientDocument } from './patient.schema';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
    private readonly planLimitsService: PlanLimitsService,
    private readonly auditService: AuditService,
    private readonly clinicalCaptureService: ClinicalCaptureService,
  ) {}

  async findAllForTenant(
    tenantId: string,
    actor?: { userId: string; role: TenantRole },
  ) {
    if (actor && isClinicalCaptureRole(actor.role)) {
      return this.clinicalCaptureService.listPatientsForCaptureUser(tenantId, actor.userId);
    }

    const patients = await this.patientModel
      .find({ tenantId, status: { $ne: 'archived' } })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return serializeDocuments(patients);
  }

  async createForTenant(
    tenantId: string,
    input: CreatePatientDto,
    actor: { userId: string; role: TenantRole } = { userId: 'system', role: 'owner' },
  ) {
    if (isClinicalCaptureRole(actor.role)) {
      throw new ForbiddenException('No puedes registrar pacientes.');
    }

    await this.planLimitsService.assertCanCreatePatient(tenantId);

    const payload = { ...input };
    if (!canPerformClinicalActions(actor.role)) {
      delete payload.medicalBackground;
    }

    const patient = await this.patientModel.create({
      tenantId,
      fullName: payload.fullName,
      documentId: payload.documentId,
      sex: payload.sex,
      birthDate: payload.birthDate ? new Date(payload.birthDate) : undefined,
      guardianName: payload.guardianName,
      address: payload.address,
      phone: payload.phone,
      email: payload.email,
      emergencyContactName: payload.emergencyContactName,
      emergencyContactPhone: payload.emergencyContactPhone,
      insuranceName: payload.insuranceName,
      policyNumber: payload.policyNumber,
      status: payload.status ?? 'active',
      activeAlerts: [],
      medicalBackground: payload.medicalBackground ?? {},
    });

    await this.planLimitsService.recordPatientCreated(tenantId);

    await this.auditService.log({
      tenantId,
      userId: actor.userId,
      userRole: actor.role,
      action: 'patient.create',
      resourceType: 'patient',
      resourceId: String(patient._id),
    });

    return serializeDocument(patient.toObject());
  }

  async updateForTenant(
    tenantId: string,
    patientId: string,
    input: UpdatePatientDto,
    actor: { userId: string; role: TenantRole } = { userId: 'system', role: 'owner' },
  ) {
    if (isClinicalCaptureRole(actor.role)) {
      throw new ForbiddenException('No puedes editar datos del paciente.');
    }

    assertValidObjectId(patientId, 'patientId');

    const update: Record<string, unknown> = { ...input };

    if (!canPerformClinicalActions(actor.role)) {
      if (update.medicalBackground !== undefined) {
        throw new ForbiddenException('Los antecedentes solo pueden editarlos el medico titular.');
      }
      if (update.status === 'archived') {
        throw new ForbiddenException('No puedes archivar pacientes.');
      }
    }

    if (input.birthDate) {
      update.birthDate = new Date(input.birthDate);
    }

    const patient = await this.patientModel
      .findOneAndUpdate({ _id: patientId, tenantId }, { $set: update }, { new: true })
      .lean()
      .exec();

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    await this.auditService.log({
      tenantId,
      userId: actor.userId,
      userRole: actor.role,
      action: 'patient.update',
      resourceType: 'patient',
      resourceId: patientId,
    });

    return serializeDocument(patient);
  }

  async findOneForTenant(
    tenantId: string,
    patientId: string,
    actor?: { userId: string; role: TenantRole },
  ) {
    assertValidObjectId(patientId, 'patientId');

    if (actor && isClinicalCaptureRole(actor.role)) {
      await this.clinicalCaptureService.assertPatientAccessForCaptureUser(
        tenantId,
        actor.userId,
        patientId,
      );
    }

    const patient = await this.patientModel.findOne({ _id: patientId, tenantId }).lean().exec();

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    return serializeDocument(patient);
  }
}
