import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MedicalDocumentRecord = HydratedDocument<MedicalDocument>;
type MedicalDocumentSource = 'doctor' | 'assistant' | 'patient' | 'nurse';
type MedicalDocumentStatus =
  | 'received'
  | 'pending_review'
  | 'classified'
  | 'linked'
  | 'archived';

@Schema({ timestamps: true })
export class MedicalDocument {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  patientId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  mimeType!: string;

  @Prop({ required: true })
  storageKey!: string;

  @Prop({ default: 0 })
  fileSizeBytes!: number;

  @Prop({ trim: true })
  documentType?: string;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ index: true })
  uploadRequestId?: string;

  @Prop({ required: true, enum: ['doctor', 'assistant', 'patient', 'nurse'] })
  source!: MedicalDocumentSource;

  @Prop({
    default: 'pending_review',
    enum: ['received', 'pending_review', 'classified', 'linked', 'archived'],
  })
  status!: MedicalDocumentStatus;
}

export const MedicalDocumentSchema = SchemaFactory.createForClass(MedicalDocument);
MedicalDocumentSchema.index({ tenantId: 1, patientId: 1, createdAt: -1 });
