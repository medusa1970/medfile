import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TenantDocument = HydratedDocument<Tenant>;
type TenantStatus = 'active' | 'trialing' | 'suspended';

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  /** Identificador publico del consultorio (ej. MF-K7R4N2). Unico en la plataforma. */
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  medfileCode!: string;

  @Prop({ index: true })
  ownerUserId?: string;

  @Prop({ default: 'active', enum: ['active', 'trialing', 'suspended'] })
  status!: TenantStatus;

  @Prop()
  trialEndsAt?: Date;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
