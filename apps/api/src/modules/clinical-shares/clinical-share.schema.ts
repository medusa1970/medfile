import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClinicalShareDocument = HydratedDocument<ClinicalShare>;

export type ClinicalShareIntention = 'view_only' | 'collaborate' | 'transfer';
export type ClinicalShareStatus = 'pending' | 'active' | 'rejected' | 'revoked' | 'expired';
export type ClinicalSharePermission =
  | 'view_summary'
  | 'view_encounters'
  | 'view_documents'
  | 'view_contact'
  | 'download';

@Schema({ _id: false })
export class ClinicalShareScope {
  @Prop({ default: true })
  includeSummary!: boolean;

  @Prop()
  encounterLimit?: number;

  @Prop({ type: [String], default: [] })
  documentIds!: string[];
}

@Schema({ _id: false })
export class ClinicalShareConsent {
  @Prop({ required: true })
  recordedAt!: Date;

  @Prop({
    required: true,
    enum: ['verbal_documented', 'written', 'digital_checkbox', 'form_photo'],
  })
  method!: string;

  @Prop({ required: true })
  recordedByUserId!: string;
}

@Schema({ timestamps: true })
export class ClinicalShare {
  @Prop({ required: true, index: true })
  sourceTenantId!: string;

  @Prop({ required: true, index: true })
  sourcePatientId!: string;

  @Prop({ required: true, index: true })
  targetTenantId!: string;

  @Prop({ required: true, uppercase: true, trim: true })
  targetMedfileCode!: string;

  @Prop({ required: true, enum: ['view_only', 'collaborate', 'transfer'] })
  intention!: ClinicalShareIntention;

  @Prop({
    type: [String],
    default: ['view_summary', 'view_encounters', 'view_documents'],
  })
  permissions!: ClinicalSharePermission[];

  @Prop({ type: ClinicalShareScope, default: () => ({ includeSummary: true }) })
  scope!: ClinicalShareScope;

  @Prop({
    required: true,
    enum: ['pending', 'active', 'rejected', 'revoked', 'expired'],
    default: 'pending',
    index: true,
  })
  status!: ClinicalShareStatus;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  message?: string;

  @Prop({ type: ClinicalShareConsent })
  consent?: ClinicalShareConsent;

  @Prop({ required: true })
  createdByUserId!: string;

  @Prop()
  acceptedByUserId?: string;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  revokedAt?: Date;

  @Prop()
  revokedByUserId?: string;
}

export const ClinicalShareSchema = SchemaFactory.createForClass(ClinicalShare);

ClinicalShareSchema.index({ sourceTenantId: 1, sourcePatientId: 1, status: 1 });
ClinicalShareSchema.index({ targetTenantId: 1, status: 1 });
