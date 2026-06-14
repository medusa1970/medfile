import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
type TenantRole = 'owner' | 'doctor' | 'assistant';
type UserStatus = 'active' | 'invited' | 'disabled';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, default: 'owner', enum: ['owner', 'doctor', 'assistant'] })
  role!: TenantRole;

  @Prop({ required: true, default: 'active', enum: ['active', 'invited', 'disabled'] })
  status!: UserStatus;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop()
  emailVerificationCode?: string;

  @Prop()
  emailVerificationExpiresAt?: Date;

  @Prop()
  passwordResetTokenHash?: string;

  @Prop()
  passwordResetExpiresAt?: Date;

  @Prop()
  onboardingCompletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ tenantId: 1, email: 1 });
