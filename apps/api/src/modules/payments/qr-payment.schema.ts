import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QrPaymentDocument = HydratedDocument<QrPayment>;
type QrPaymentStatus = 'pending' | 'paid' | 'expired';

@Schema({ timestamps: true })
export class QrPayment {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, enum: ['basic', 'professional'] })
  planCode!: string;

  @Prop({ required: true, enum: ['monthly', 'quarterly', 'annual'], default: 'monthly' })
  billingPeriod!: 'monthly' | 'quarterly' | 'annual';

  @Prop({ required: true, unique: true, index: true })
  orderId!: string;

  @Prop({ required: true, unique: true, index: true })
  qrId!: string;

  @Prop({ required: true })
  amountBob!: number;

  @Prop({ required: true, default: 'BOB' })
  currency!: string;

  @Prop({ required: true, enum: ['pending', 'paid', 'expired'], default: 'pending' })
  status!: QrPaymentStatus;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  paidAt?: Date;

  @Prop()
  qrImageDataUrl?: string;

  @Prop({ type: Object })
  rawWebhook?: Record<string, unknown>;
}

export const QrPaymentSchema = SchemaFactory.createForClass(QrPayment);
