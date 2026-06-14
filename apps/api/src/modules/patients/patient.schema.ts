import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  PatientAddress,
  PatientMedicalBackground,
} from '../clinical/clinical-shared.schema';

export type PatientDocument = HydratedDocument<Patient>;
type PatientStatus = 'active' | 'follow_up' | 'critical' | 'archived';
type PatientSex = 'male' | 'female' | 'other';

@Schema({ timestamps: true })
export class Patient {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ trim: true })
  documentId?: string;

  @Prop({ enum: ['male', 'female', 'other'] })
  sex?: PatientSex;

  @Prop()
  birthDate?: Date;

  @Prop({ trim: true })
  guardianName?: string;

  @Prop({ type: PatientAddress })
  address?: PatientAddress;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  emergencyContactName?: string;

  @Prop({ trim: true })
  emergencyContactPhone?: string;

  @Prop({ trim: true })
  insuranceName?: string;

  @Prop({ trim: true })
  policyNumber?: string;

  @Prop({ default: 'active', enum: ['active', 'follow_up', 'critical', 'archived'] })
  status!: PatientStatus;

  @Prop({ type: [String], default: [] })
  activeAlerts!: string[];

  @Prop({ type: PatientMedicalBackground, default: {} })
  medicalBackground!: PatientMedicalBackground;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
PatientSchema.index({ tenantId: 1, fullName: 1 });
