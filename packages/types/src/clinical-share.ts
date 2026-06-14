export type ClinicalShareIntention = 'view_only' | 'collaborate' | 'transfer';

export type ClinicalShareStatus =
  | 'pending'
  | 'active'
  | 'rejected'
  | 'revoked'
  | 'expired';

export type ClinicalSharePermission =
  | 'view_summary'
  | 'view_encounters'
  | 'view_documents'
  | 'view_contact'
  | 'download';

export interface ClinicalShareScope {
  includeSummary: boolean;
  encounterLimit?: number;
  documentIds?: string[];
}

export interface ClinicalShareConsent {
  recordedAt: string;
  method: 'verbal_documented' | 'written' | 'digital_checkbox' | 'form_photo';
  recordedByUserId: string;
}

export interface TenantPublicProfile {
  id: string;
  name: string;
  medfileCode: string;
  ownerName?: string;
}

export interface ClinicalShareSummary {
  id: string;
  sourceTenantId: string;
  sourcePatientId: string;
  sourcePatientName?: string;
  sourceTenantName?: string;
  sourceMedfileCode?: string;
  targetTenantId: string;
  targetTenantName?: string;
  targetMedfileCode?: string;
  intention: ClinicalShareIntention;
  permissions: ClinicalSharePermission[];
  scope: ClinicalShareScope;
  status: ClinicalShareStatus;
  expiresAt: string;
  message?: string;
  createdAt: string;
  acceptedAt?: string;
  revokedAt?: string;
}

export interface SharedPatientView {
  share: ClinicalShareSummary;
  patient: {
    fullName: string;
    documentId?: string;
    birthDate?: string;
    phone?: string;
    email?: string;
    status: string;
    medicalBackground?: Record<string, unknown>;
  };
  encounters: Array<{
    id: string;
    occurredAt: string;
    reason: string;
    diagnosis?: string;
    presentIllness?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    uploadedAt: string;
  }>;
}
