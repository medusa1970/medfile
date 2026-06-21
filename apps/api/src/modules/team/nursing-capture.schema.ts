import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { VitalSigns } from '../clinical/clinical-shared.schema';

export type NursingCaptureDocument = HydratedDocument<NursingCapture>;
type CaptureStatus = 'ready' | 'incorporated';

@Schema({ timestamps: true })
export class NursingCapture {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  patientId!: string;

  @Prop({ required: true, index: true })
  clinicSiteId!: string;

  @Prop({ required: true, index: true })
  createdByUserId!: string;

  @Prop({ required: true, default: 'clinical_capture' })
  createdByRole!: string;

  @Prop({ type: VitalSigns })
  vitalSigns?: VitalSigns;

  @Prop({ trim: true })
  nursingNote?: string;

  @Prop({ enum: ['low', 'medium', 'high'] })
  triageLevel?: 'low' | 'medium' | 'high';

  @Prop({ required: true, enum: ['ready', 'incorporated'], default: 'ready' })
  status!: CaptureStatus;

  @Prop({ required: true, default: Date.now })
  occurredAt!: Date;
}

export const NursingCaptureSchema = SchemaFactory.createForClass(NursingCapture);
NursingCaptureSchema.index({ tenantId: 1, patientId: 1, occurredAt: -1 });
