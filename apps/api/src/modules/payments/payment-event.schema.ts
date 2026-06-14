import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentEventDocument = HydratedDocument<PaymentEvent>;

@Schema({ timestamps: true })
export class PaymentEvent {
  @Prop({ required: true, unique: true, index: true })
  eventKey!: string;

  @Prop({ required: true, index: true })
  provider!: 'mercadopago' | 'mock';

  @Prop({ required: true })
  topic!: string;

  @Prop({ index: true })
  tenantId?: string;

  @Prop({ type: Object })
  payload?: Record<string, unknown>;

  @Prop({ default: 'processed' })
  status!: 'processed' | 'ignored' | 'failed';
}

export const PaymentEventSchema = SchemaFactory.createForClass(PaymentEvent);
