export type TenantRole = 'owner' | 'doctor' | 'assistant' | 'clinical_capture';

export function canManageTeam(role: TenantRole) {
  return role === 'owner' || role === 'doctor';
}

export function canPerformClinicalActions(role: TenantRole) {
  return role === 'owner' || role === 'doctor';
}

export function canShareWithColleague(role: TenantRole) {
  return role === 'owner' || role === 'doctor';
}

export function isClinicalCaptureRole(role: TenantRole) {
  return role === 'clinical_capture';
}

export function canAccessDayQueue(role: TenantRole) {
  return role === 'owner' || role === 'doctor' || role === 'clinical_capture';
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'suspended';

export type PatientStatus = 'active' | 'follow_up' | 'critical' | 'archived';

export type MedicalDocumentStatus =
  | 'received'
  | 'pending_review'
  | 'classified'
  | 'linked'
  | 'archived';

export type MedicalDocumentSource = 'doctor' | 'assistant' | 'patient' | 'nurse';

export * from './clinical';
export * from './plans';
export * from './medfile-code';
export * from './clinical-share';

import type { VitalSigns } from './clinical';

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  /** Identificador publico del consultorio (ej. MF-K7R4N2). */
  medfileCode: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string;
}

export interface PatientSummary {
  id: string;
  tenantId: string;
  fullName: string;
  birthDate?: string;
  phone?: string;
  email?: string;
  status: PatientStatus;
  lastEncounterAt?: string;
  activeAlerts: string[];
}

export interface EncounterSummary {
  id: string;
  tenantId: string;
  patientId: string;
  occurredAt: string;
  reason: string;
  diagnosis?: string;
  presentIllness?: string;
  patientDestination?: string;
  vitalSigns?: VitalSigns;
}

export interface MedicalDocumentSummary {
  id: string;
  tenantId: string;
  patientId: string;
  name: string;
  type: string;
  source: MedicalDocumentSource;
  status: MedicalDocumentStatus;
  uploadedAt: string;
}
