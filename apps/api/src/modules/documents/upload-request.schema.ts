import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UploadRequestDocument = HydratedDocument<UploadRequest>;
type UploadRequestStatus = 'open' | 'completed' | 'expired' | 'cancelled';

@Schema({ timestamps: true })
export class UploadRequest {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  patientId!: string;

  @Prop({ required: true, unique: true, index: true })
  token!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  instructions?: string;

  @Prop({ required: true, default: 'open', enum: ['open', 'completed', 'expired', 'cancelled'] })
  status!: UploadRequestStatus;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const UploadRequestSchema = SchemaFactory.createForClass(UploadRequest);
UploadRequestSchema.index({ tenantId: 1, patientId: 1, createdAt: -1 });
