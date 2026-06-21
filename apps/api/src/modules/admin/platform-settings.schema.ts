import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { PaymentProviderCode } from '../../common/platform-admin';

export type PlatformSettingsDocument = HydratedDocument<PlatformSettings>;

@Schema({ _id: false })
export class PlatformPaymentSettings {
  @Prop({ default: 'mock', enum: ['mock', 'mercadopago', 'economico_qr'] })
  defaultProvider!: PaymentProviderCode;

  @Prop({ default: true })
  mercadopagoEnabled!: boolean;

  @Prop({ default: false })
  economicoQrEnabled!: boolean;

  @Prop({ trim: true, default: 'Banco Economico' })
  economicoMerchantLabel!: string;

  @Prop({ trim: true })
  economicoInstructions?: string;
}

@Schema({ timestamps: true })
export class PlatformSettings {
  @Prop({ required: true, unique: true, default: 'global' })
  scope!: string;

  @Prop({ type: PlatformPaymentSettings, default: () => ({}) })
  payments!: PlatformPaymentSettings;
}

export const PlatformSettingsSchema = SchemaFactory.createForClass(PlatformSettings);
