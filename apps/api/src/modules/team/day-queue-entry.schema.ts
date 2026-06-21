import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DayQueueEntryDocument = HydratedDocument<DayQueueEntry>;
type QueueStatus = 'waiting' | 'in_progress' | 'ready' | 'done';

@Schema({ timestamps: true })
export class DayQueueEntry {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  patientId!: string;

  @Prop({ required: true, index: true })
  clinicSiteId!: string;

  @Prop({ required: true, index: true })
  queueDate!: string;

  @Prop({ required: true, enum: ['waiting', 'in_progress', 'ready', 'done'], default: 'waiting' })
  status!: QueueStatus;

  @Prop({ required: true })
  addedByUserId!: string;

  @Prop({ trim: true })
  notes?: string;
}

export const DayQueueEntrySchema = SchemaFactory.createForClass(DayQueueEntry);
DayQueueEntrySchema.index({ tenantId: 1, queueDate: 1, clinicSiteId: 1, status: 1 });
