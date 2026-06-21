import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TeamInvitationDocument = HydratedDocument<TeamInvitation>;
type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

@Schema({ timestamps: true })
export class TeamInvitation {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, enum: ['assistant', 'clinical_capture'], default: 'assistant' })
  role!: 'assistant' | 'clinical_capture';

  @Prop({ type: [String], default: [] })
  clinicContextIds!: string[];

  @Prop({ required: true, index: true })
  invitedByUserId!: string;

  @Prop({ required: true, unique: true, index: true })
  tokenHash!: string;

  @Prop({ required: true, enum: ['pending', 'accepted', 'revoked', 'expired'], default: 'pending' })
  status!: InvitationStatus;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  acceptedUserId?: string;
}

export const TeamInvitationSchema = SchemaFactory.createForClass(TeamInvitation);
