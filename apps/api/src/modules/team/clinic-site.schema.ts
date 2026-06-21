import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClinicSiteDocument = HydratedDocument<ClinicSite>;

@Schema({ timestamps: true })
export class ClinicSite {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  label?: string;

  @Prop({ default: true })
  active!: boolean;
}

export const ClinicSiteSchema = SchemaFactory.createForClass(ClinicSite);
ClinicSiteSchema.index({ tenantId: 1, name: 1 }, { unique: true });
