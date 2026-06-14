import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { assertValidObjectId } from '../../common/assert-valid-object-id';
import { serializeDocument, serializeDocuments } from '../../common/serialize-document';
import { PlanLimitsService } from '../subscriptions/plan-limits.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { Patient, PatientDocument } from './patient.schema';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
    private readonly planLimitsService: PlanLimitsService,
  ) {}

  async findAllForTenant(tenantId: string) {
    const patients = await this.patientModel
      .find({ tenantId, status: { $ne: 'archived' } })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return serializeDocuments(patients);
  }

  async createForTenant(tenantId: string, input: CreatePatientDto) {
    await this.planLimitsService.assertCanCreatePatient(tenantId);

    const patient = await this.patientModel.create({
      tenantId,
      fullName: input.fullName,
      documentId: input.documentId,
      sex: input.sex,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      guardianName: input.guardianName,
      address: input.address,
      phone: input.phone,
      email: input.email,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      insuranceName: input.insuranceName,
      policyNumber: input.policyNumber,
      status: input.status ?? 'active',
      activeAlerts: [],
      medicalBackground: input.medicalBackground ?? {},
    });

    await this.planLimitsService.recordPatientCreated(tenantId);

    return serializeDocument(patient.toObject());
  }

  async updateForTenant(tenantId: string, patientId: string, input: UpdatePatientDto) {
    assertValidObjectId(patientId, 'patientId');

    const update: Record<string, unknown> = { ...input };

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

    return serializeDocument(patient);
  }

  async findOneForTenant(tenantId: string, patientId: string) {
    assertValidObjectId(patientId, 'patientId');

    const patient = await this.patientModel.findOne({ _id: patientId, tenantId }).lean().exec();

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado.');
    }

    return serializeDocument(patient);
  }
}
