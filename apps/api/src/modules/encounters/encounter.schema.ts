import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { VitalSigns } from '../clinical/clinical-shared.schema';

export type EncounterDocument = HydratedDocument<Encounter>;

type CareType = 'private' | 'epidemiological' | 'soat' | 'other';
type PatientDestination =
  | 'home'
  | 'referred'
  | 'death'
  | 'external_followup'
  | 'absconded'
  | 'observation'
  | 'interconsultation';

@Schema({ timestamps: true })
export class Encounter {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  patientId!: string;

  @Prop({ default: 'emergency', enum: ['general', 'emergency'] })
  template!: 'general' | 'emergency';

  @Prop({ required: true, default: Date.now })
  occurredAt!: Date;

  @Prop({ enum: ['private', 'epidemiological', 'soat', 'other'] })
  careType?: CareType;

  @Prop({ trim: true })
  careTypeOther?: string;

  @Prop({ trim: true })
  serviceName?: string;

  @Prop()
  assistedArrival?: boolean;

  @Prop({ trim: true })
  assistedBy?: string;

  @Prop({ required: true, trim: true })
  reason!: string;

  @Prop({ trim: true })
  presentIllness?: string;

  @Prop({ trim: true })
  diagnosis?: string;

  @Prop({ trim: true })
  treatmentPlan?: string;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ trim: true })
  physicalExamNotes?: string;

  @Prop({ trim: true })
  auxiliaryExams?: string;

  @Prop({ trim: true })
  companionName?: string;

  @Prop({
    enum: [
      'home',
      'referred',
      'death',
      'external_followup',
      'absconded',
      'observation',
      'interconsultation',
    ],
  })
  patientDestination?: PatientDestination;

  @Prop({ trim: true })
  referralFacility?: string;

  @Prop({ trim: true })
  responsiblePhysicianName?: string;

  @Prop()
  observationAdmissionAt?: Date;

  @Prop({ trim: true })
  observationRoom?: string;

  @Prop({ trim: true })
  evolutionNotes?: string;

  @Prop({ trim: true })
  dischargeDiagnosis?: string;

  @Prop()
  dischargedAt?: Date;

  @Prop({ trim: true })
  notesToFamily?: string;

  @Prop({ trim: true })
  responsibleFamilyName?: string;

  @Prop({ trim: true })
  responsibleFamilyDocumentId?: string;

  @Prop({ type: VitalSigns })
  vitalSigns?: VitalSigns;

  @Prop({ type: [String], default: [] })
  tags!: string[];
}

export const EncounterSchema = SchemaFactory.createForClass(Encounter);
EncounterSchema.index({ tenantId: 1, patientId: 1, occurredAt: -1 });
