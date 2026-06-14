import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { assertValidObjectId } from '../../common/assert-valid-object-id';
import { serializeDocument, serializeDocuments } from '../../common/serialize-document';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { Encounter, EncounterDocument } from './encounter.schema';

@Injectable()
export class EncountersService {
  constructor(
    @InjectModel(Encounter.name)
    private readonly encounterModel: Model<EncounterDocument>,
  ) {}

  async findForPatient(tenantId: string, patientId: string) {
    assertValidObjectId(patientId, 'patientId');

    const encounters = await this.encounterModel
      .find({ tenantId, patientId })
      .sort({ occurredAt: -1 })
      .limit(100)
      .lean()
      .exec();

    return serializeDocuments(encounters);
  }

  async createForTenant(tenantId: string, input: CreateEncounterDto) {
    assertValidObjectId(input.patientId, 'patientId');

    const tags = ['Consulta'];

    if (input.template === 'emergency') tags.push('Emergencia');
    if (input.diagnosis) tags.push('Diagnostico');
    if (input.patientDestination === 'observation') tags.push('Observacion');

    const encounter = await this.encounterModel.create({
      tenantId,
      patientId: input.patientId,
      template: input.template ?? 'emergency',
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
      careType: input.careType,
      careTypeOther: input.careTypeOther,
      serviceName: input.serviceName,
      assistedArrival: input.assistedArrival,
      assistedBy: input.assistedBy,
      reason: input.reason,
      presentIllness: input.presentIllness,
      diagnosis: input.diagnosis,
      treatmentPlan: input.treatmentPlan,
      notes: input.notes,
      physicalExamNotes: input.physicalExamNotes,
      auxiliaryExams: input.auxiliaryExams,
      companionName: input.companionName,
      patientDestination: input.patientDestination,
      referralFacility: input.referralFacility,
      responsiblePhysicianName: input.responsiblePhysicianName,
      observationAdmissionAt: input.observationAdmissionAt
        ? new Date(input.observationAdmissionAt)
        : undefined,
      observationRoom: input.observationRoom,
      evolutionNotes: input.evolutionNotes,
      dischargeDiagnosis: input.dischargeDiagnosis,
      dischargedAt: input.dischargedAt ? new Date(input.dischargedAt) : undefined,
      notesToFamily: input.notesToFamily,
      responsibleFamilyName: input.responsibleFamilyName,
      responsibleFamilyDocumentId: input.responsibleFamilyDocumentId,
      vitalSigns: input.vitalSigns,
      tags,
    });

    return serializeDocument(encounter.toObject());
  }
}
