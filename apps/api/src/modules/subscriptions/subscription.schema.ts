import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubscriptionDocument = HydratedDocument<Subscription>;
type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended';

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, unique: true, index: true })
  tenantId!: string;

  @Prop({ required: true, default: 'active' })
  status!: SubscriptionStatus;

  @Prop({ required: true, default: 'free' })
  planCode!: string;

  @Prop()
  trialEndsAt?: Date;

  @Prop({ default: 0 })
  storageUsedBytes!: number;

  @Prop({ default: 1073741824 })
  storageLimitBytes!: number;

  @Prop({ default: 0 })
  patientsUsed!: number;

  @Prop({ default: 0 })
  uploadRequestsUsedThisMonth!: number;

  @Prop({ default: 0 })
  whatsappMessagesUsedThisMonth!: number;

  /** YYYY-MM — al cambiar mes se resetean contadores mensuales. */
  @Prop({ default: () => new Date().toISOString().slice(0, 7) })
  usagePeriodMonth!: string;

  @Prop({ enum: ['mock', 'mercadopago'] })
  paymentProvider?: 'mock' | 'mercadopago';

  @Prop({ index: true })
  mercadopagoPreapprovalId?: string;

  @Prop()
  pendingPlanCode?: string;

  @Prop({ enum: ['monthly', 'quarterly', 'annual'], default: 'monthly' })
  billingPeriod?: 'monthly' | 'quarterly' | 'annual';

  @Prop()
  lastPaymentAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
