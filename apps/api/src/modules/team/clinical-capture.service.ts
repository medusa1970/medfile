import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getPlanByCode, isClinicalCaptureRole, normalizePlanCode } from '@medfile/types';
import { assertValidObjectId } from '../../common/assert-valid-object-id';
import { serializeDocument } from '../../common/serialize-document';
import { Patient, PatientDocument } from '../patients/patient.schema';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UsersService } from '../users/users.service';
import { AuditService } from './audit.service';
import { ClinicSite, ClinicSiteDocument } from './clinic-site.schema';
import { DayQueueEntry, DayQueueEntryDocument } from './day-queue-entry.schema';
import { NursingCapture, NursingCaptureDocument } from './nursing-capture.schema';

function todayQueueDate() {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class ClinicalCaptureService {
  constructor(
    @InjectModel(ClinicSite.name)
    private readonly clinicSiteModel: Model<ClinicSiteDocument>,
    @InjectModel(DayQueueEntry.name)
    private readonly queueModel: Model<DayQueueEntryDocument>,
    @InjectModel(NursingCapture.name)
    private readonly nursingCaptureModel: Model<NursingCaptureDocument>,
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  private async assertClinicalCapturePlan(tenantId: string) {
    const subscription = await this.subscriptionsService.findRawByTenantId(tenantId);
    const plan = getPlanByCode(normalizePlanCode(subscription?.planCode ?? 'free'));

    if (!plan.capabilities.clinicalCaptureUsers) {
      throw new ForbiddenException('Captura clinica requiere plan Profesional.');
    }
  }

  async listClinicSites(tenantId: string) {
    return this.clinicSiteModel.find({ tenantId, active: true }).sort({ name: 1 }).lean().exec();
  }

  async createClinicSite(tenantId: string, name: string, label?: string) {
    await this.assertClinicalCapturePlan(tenantId);
    const site = await this.clinicSiteModel.create({
      tenantId,
      name: name.trim(),
      label: label?.trim(),
      active: true,
    });
    return serializeDocument(site.toObject());
  }

  async listQueue(input: {
    tenantId: string;
    userId: string;
    role: string;
    clinicSiteId?: string;
    queueDate?: string;
  }) {
    await this.assertClinicalCapturePlan(input.tenantId);

    const date = input.queueDate ?? todayQueueDate();
    const filter: Record<string, unknown> = {
      tenantId: input.tenantId,
      queueDate: date,
      status: { $ne: 'done' },
    };

    if (input.clinicSiteId) {
      filter.clinicSiteId = input.clinicSiteId;
    } else if (isClinicalCaptureRole(input.role as 'clinical_capture')) {
      const user = await this.usersService.findById(input.userId);
      const contexts = user?.clinicContexts ?? [];
      if (!contexts.length) {
        return [];
      }
      filter.clinicSiteId = { $in: contexts };
    }

    const entries = await this.queueModel.find(filter).sort({ updatedAt: -1 }).limit(100).lean().exec();
    const patientIds = entries.map((entry) => entry.patientId);
    const patients = await this.patientModel
      .find({ _id: { $in: patientIds }, tenantId: input.tenantId })
      .lean()
      .exec();
    const patientById = new Map(patients.map((patient) => [String(patient._id), patient]));

    return entries.map((entry) => {
      const patient = patientById.get(entry.patientId);
      return {
        id: String(entry._id),
        patientId: entry.patientId,
        patientName: patient?.fullName ?? 'Paciente',
        activeAlerts: patient?.activeAlerts ?? [],
        clinicSiteId: entry.clinicSiteId,
        queueDate: entry.queueDate,
        status: entry.status,
        notes: entry.notes ?? null,
      };
    });
  }

  async addToQueue(input: {
    tenantId: string;
    userId: string;
    role: string;
    patientId: string;
    clinicSiteId: string;
    notes?: string;
  }) {
    await this.assertClinicalCapturePlan(input.tenantId);
    assertValidObjectId(input.patientId, 'patientId');
    assertValidObjectId(input.clinicSiteId, 'clinicSiteId');

    const patient = await this.patientModel
      .findOne({ _id: input.patientId, tenantId: input.tenantId })
      .lean()
      .exec();
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    const site = await this.clinicSiteModel
      .findOne({ _id: input.clinicSiteId, tenantId: input.tenantId, active: true })
      .lean()
      .exec();
    if (!site) {
      throw new NotFoundException('Clinica no encontrada.');
    }

    const queueDate = todayQueueDate();
    const entry = await this.queueModel.findOneAndUpdate(
      { tenantId: input.tenantId, patientId: input.patientId, queueDate, clinicSiteId: input.clinicSiteId },
      {
        $set: {
          status: 'waiting',
          notes: input.notes?.trim(),
          addedByUserId: input.userId,
        },
        $setOnInsert: { tenantId: input.tenantId, patientId: input.patientId, queueDate, clinicSiteId: input.clinicSiteId },
      },
      { upsert: true, new: true },
    );

    await this.auditService.log({
      tenantId: input.tenantId,
      userId: input.userId,
      userRole: input.role,
      action: 'queue.add',
      resourceType: 'day_queue',
      resourceId: String(entry._id),
      metadata: { patientId: input.patientId, clinicSiteId: input.clinicSiteId },
    });

    return serializeDocument(entry.toObject());
  }

  async createNursingCapture(input: {
    tenantId: string;
    userId: string;
    role: string;
    patientId: string;
    clinicSiteId: string;
    vitalSigns?: Record<string, unknown>;
    nursingNote?: string;
    triageLevel?: 'low' | 'medium' | 'high';
  }) {
    await this.assertClinicalCapturePlan(input.tenantId);

    if (!isClinicalCaptureRole(input.role as 'clinical_capture')) {
      throw new ForbiddenException('Solo captura clinica puede registrar signos vitales.');
    }

    const user = await this.usersService.findById(input.userId);
    const contexts = user?.clinicContexts ?? [];
    if (!contexts.includes(input.clinicSiteId)) {
      throw new ForbiddenException('No tienes acceso a esta clinica.');
    }

    assertValidObjectId(input.patientId, 'patientId');
    assertValidObjectId(input.clinicSiteId, 'clinicSiteId');

    const capture = await this.nursingCaptureModel.create({
      tenantId: input.tenantId,
      patientId: input.patientId,
      clinicSiteId: input.clinicSiteId,
      createdByUserId: input.userId,
      createdByRole: input.role,
      vitalSigns: input.vitalSigns,
      nursingNote: input.nursingNote?.trim(),
      triageLevel: input.triageLevel,
      status: 'ready',
      occurredAt: new Date(),
    });

    await this.queueModel
      .updateOne(
        {
          tenantId: input.tenantId,
          patientId: input.patientId,
          clinicSiteId: input.clinicSiteId,
          queueDate: todayQueueDate(),
        },
        { $set: { status: 'ready' } },
      )
      .exec();

    await this.auditService.log({
      tenantId: input.tenantId,
      userId: input.userId,
      userRole: input.role,
      action: 'nursing.capture',
      resourceType: 'nursing_capture',
      resourceId: String(capture._id),
      metadata: { patientId: input.patientId, clinicSiteId: input.clinicSiteId },
    });

    return serializeDocument(capture.toObject());
  }

  async listNursingCaptures(tenantId: string, patientId: string) {
    await this.assertClinicalCapturePlan(tenantId);
    assertValidObjectId(patientId, 'patientId');

    const captures = await this.nursingCaptureModel
      .find({ tenantId, patientId, status: 'ready' })
      .sort({ occurredAt: -1 })
      .limit(20)
      .lean()
      .exec();

    return captures.map((capture) => serializeDocument(capture));
  }

  async listPatientsForCaptureUser(tenantId: string, userId: string) {
    await this.assertClinicalCapturePlan(tenantId);

    const user = await this.usersService.findById(userId);
    const contexts = user?.clinicContexts ?? [];
    if (!contexts.length) {
      return [];
    }

    const queueDate = todayQueueDate();
    const entries = await this.queueModel
      .find({
        tenantId,
        queueDate,
        clinicSiteId: { $in: contexts },
        status: { $ne: 'done' },
      })
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean()
      .exec();

    const patientIds = [...new Set(entries.map((entry) => entry.patientId))];
    if (!patientIds.length) {
      return [];
    }

    const patients = await this.patientModel
      .find({ _id: { $in: patientIds }, tenantId })
      .sort({ fullName: 1 })
      .lean()
      .exec();

    return patients.map((patient) =>
      serializeDocument({
        ...patient,
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email,
        status: patient.status,
        activeAlerts: patient.activeAlerts ?? [],
        birthDate: patient.birthDate,
      }),
    );
  }

  async assertPatientAccessForCaptureUser(tenantId: string, userId: string, patientId: string) {
    await this.assertClinicalCapturePlan(tenantId);
    assertValidObjectId(patientId, 'patientId');

    const user = await this.usersService.findById(userId);
    const contexts = user?.clinicContexts ?? [];
    if (!contexts.length) {
      throw new ForbiddenException('No tienes clinicas asignadas.');
    }

    const entry = await this.queueModel
      .findOne({
        tenantId,
        patientId,
        queueDate: todayQueueDate(),
        clinicSiteId: { $in: contexts },
        status: { $ne: 'done' },
      })
      .lean()
      .exec();

    if (!entry) {
      throw new ForbiddenException('Este paciente no esta en tu cola autorizada de hoy.');
    }
  }
}
