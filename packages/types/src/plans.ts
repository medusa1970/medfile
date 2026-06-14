export type PlanCode = 'free' | 'basic' | 'professional';

export type PlanTier = 'free' | 'paid';

export type BillingPeriod = 'monthly' | 'quarterly' | 'annual';

/** Tipo de cambio referencial para mostrar precios en BOB (Bolivia). */
export const PLAN_PRICE_BOB_PER_USD = 7;

/**
 * Costo Meta Utility por mensaje entregado a paciente (+591 Bolivia).
 * @see docs/25-whatsapp-incluido-en-planes.md
 */
export const WHATSAPP_UTILITY_USD_PER_MESSAGE = 0.0113;

export interface PlanCapabilities {
  whatsappShareLink: boolean;
  whatsappAutomated: boolean;
  emailReminders: boolean;
  smsReminders: boolean;
  assistantUsers: boolean;
  automatedDigest: boolean;
  advancedReports: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
  clinicalShare: boolean;
}

export interface SubscriptionPlanDefinition {
  code: PlanCode;
  name: string;
  tier: PlanTier;
  monthlyPriceUsd: number;
  monthlyPriceBob: number;
  limits: {
    patients: number;
    users: number;
    storageBytes: number;
    uploadRequestsPerMonth: number;
    /** Mensajes WhatsApp automaticos a pacientes / mes (0 = solo wa.me manual). */
    whatsappMessagesPerMonth: number;
  };
  features: string[];
  capabilities: PlanCapabilities;
}

export function normalizePlanCode(code: string): PlanCode {
  if (code === 'trial') return 'free';
  if (code === 'free' || code === 'basic' || code === 'professional') return code;
  return 'free';
}

export const FREE_PLAN_FEATURES = [
  'Hasta 50 pacientes',
  'Historia clinica y consultas',
  'Enlace para subida de examenes',
  'WhatsApp manual (wa.me) sin limite',
  'Codigo Medfile para colegas',
  '1 medico · 2 GB · sin vencimiento',
] as const;

export const PAID_BASIC_FEATURES = [
  'Hasta 200 pacientes',
  '8 GB almacenamiento',
  '100 WhatsApp automaticos / mes incluidos',
  'Recordatorios por email incluidos',
  'Logo del consultorio en enlaces',
  '1 medico independiente',
] as const;

export const PAID_PROFESSIONAL_FEATURES = [
  'Hasta 800 pacientes',
  '25 GB almacenamiento',
  '600 WhatsApp automaticos / mes incluidos',
  'Automatizaciones y digest semanal',
  'Compartir historial con colegas Medfile',
  'Reportes y soporte prioritario',
] as const;

const capabilitiesFree: PlanCapabilities = {
  whatsappShareLink: true,
  whatsappAutomated: false,
  emailReminders: false,
  smsReminders: false,
  assistantUsers: false,
  automatedDigest: false,
  advancedReports: false,
  customBranding: false,
  prioritySupport: false,
  clinicalShare: false,
};

const capabilitiesBasic: PlanCapabilities = {
  whatsappShareLink: true,
  whatsappAutomated: true,
  emailReminders: true,
  smsReminders: false,
  assistantUsers: false,
  automatedDigest: false,
  advancedReports: false,
  customBranding: true,
  prioritySupport: false,
  clinicalShare: false,
};

const capabilitiesProfessional: PlanCapabilities = {
  whatsappShareLink: true,
  whatsappAutomated: true,
  emailReminders: true,
  smsReminders: false,
  assistantUsers: false,
  automatedDigest: true,
  advancedReports: true,
  customBranding: true,
  prioritySupport: true,
  clinicalShare: true,
};

export const subscriptionPlans: SubscriptionPlanDefinition[] = [
  {
    code: 'free',
    name: 'Gratis',
    tier: 'free',
    monthlyPriceUsd: 0,
    monthlyPriceBob: 0,
    limits: {
      patients: 50,
      users: 1,
      storageBytes: 2147483648,
      uploadRequestsPerMonth: 30,
      whatsappMessagesPerMonth: 0,
    },
    features: [...FREE_PLAN_FEATURES],
    capabilities: capabilitiesFree,
  },
  {
    code: 'basic',
    name: 'Basico',
    tier: 'paid',
    monthlyPriceUsd: 14,
    monthlyPriceBob: 98,
    limits: {
      patients: 200,
      users: 1,
      storageBytes: 8589934592,
      uploadRequestsPerMonth: 150,
      whatsappMessagesPerMonth: 100,
    },
    features: [...PAID_BASIC_FEATURES],
    capabilities: capabilitiesBasic,
  },
  {
    code: 'professional',
    name: 'Profesional',
    tier: 'paid',
    monthlyPriceUsd: 32,
    monthlyPriceBob: 224,
    limits: {
      patients: 800,
      users: 1,
      storageBytes: 26843545600,
      uploadRequestsPerMonth: 500,
      whatsappMessagesPerMonth: 600,
    },
    features: [...PAID_PROFESSIONAL_FEATURES],
    capabilities: capabilitiesProfessional,
  },
];

export function getPlanByCode(code: string): SubscriptionPlanDefinition {
  const normalized = normalizePlanCode(code);
  return subscriptionPlans.find((plan) => plan.code === normalized) ?? subscriptionPlans[0];
}

export function getPlanCapabilities(code: string): PlanCapabilities {
  return getPlanByCode(code).capabilities;
}

export function isPaidPlan(code: string): boolean {
  return getPlanByCode(code).tier === 'paid';
}

export function formatPlanPriceBob(plan: SubscriptionPlanDefinition) {
  if (plan.monthlyPriceBob === 0) return 'Gratis';
  return `Bs ${plan.monthlyPriceBob}`;
}

export function formatPlanPriceUsd(plan: SubscriptionPlanDefinition) {
  if (plan.monthlyPriceUsd === 0) return 'Gratis';
  return `$${plan.monthlyPriceUsd}`;
}

export function calculatePlanChargeBob(planCode: PlanCode, billingPeriod: BillingPeriod = 'monthly') {
  const plan = getPlanByCode(planCode);
  if (plan.tier === 'free') return 0;

  const monthlyBob = plan.monthlyPriceBob;
  if (billingPeriod === 'quarterly') return Math.round(monthlyBob * 3 * 0.9);
  if (billingPeriod === 'annual') return Math.round(monthlyBob * 12 * 0.8);
  return monthlyBob;
}

export function getMercadoPagoRecurringConfig(billingPeriod: BillingPeriod) {
  if (billingPeriod === 'quarterly') {
    return { frequency: 3, frequencyType: 'months' as const };
  }
  if (billingPeriod === 'annual') {
    return { frequency: 12, frequencyType: 'months' as const };
  }
  return { frequency: 1, frequencyType: 'months' as const };
}

export function parseMedfileExternalReference(reference: string) {
  const [prefix, tenantId, planCode, billingPeriod] = reference.split(':');
  if (prefix !== 'medfile' || !tenantId || !planCode) return null;

  return {
    tenantId,
    planCode: normalizePlanCode(planCode),
    billingPeriod: (billingPeriod as BillingPeriod) || 'monthly',
  };
}

export function buildMedfileExternalReference(
  tenantId: string,
  planCode: PlanCode,
  billingPeriod: BillingPeriod,
) {
  return `medfile:${tenantId}:${planCode}:${billingPeriod}`;
}

/** Costo Meta maximo si el medico usa el 100% del cupo WhatsApp del plan. */
export function estimateWhatsAppCostUsd(messages: number) {
  return Math.round(messages * WHATSAPP_UTILITY_USD_PER_MESSAGE * 100) / 100;
}

/** Umbral (0-1) para avisar al medico que se acerca al limite de cualquier recurso. */
export const PLAN_USAGE_WARN_RATIO = 0.8;

/** @deprecated Usar PLAN_USAGE_WARN_RATIO */
export const WHATSAPP_USAGE_WARN_RATIO = PLAN_USAGE_WARN_RATIO;

export function isQuotaExceeded(used: number, limit: number) {
  if (limit <= 0) return used > 0;
  return used >= limit;
}

export function shouldWarnQuota(used: number, limit: number) {
  if (limit <= 0) return false;
  return used / limit >= PLAN_USAGE_WARN_RATIO && used < limit;
}

export function isWhatsAppQuotaExceeded(used: number, limit: number) {
  if (limit <= 0) return true;
  return used >= limit;
}

export function shouldWarnWhatsAppQuota(used: number, limit: number) {
  return shouldWarnQuota(used, limit);
}

export type PlanLimitResource =
  | 'patients'
  | 'uploadRequests'
  | 'storage'
  | 'whatsappMessages';

export interface PlanUsageWarning {
  resource: PlanLimitResource;
  used: number;
  limit: number;
  message: string;
  upgradePlanCode?: PlanCode;
}

export function collectPlanUsageWarnings(input: {
  planCode: PlanCode;
  usage: {
    patients: { used: number; limit: number };
    uploadRequests: { used: number; limit: number };
    storage: { used: number; limit: number };
    whatsappMessages?: { used: number; limit: number };
  };
}): PlanUsageWarning[] {
  const warnings: PlanUsageWarning[] = [];
  const upgrade =
    input.planCode === 'free' ? 'basic' : input.planCode === 'basic' ? 'professional' : undefined;

  const push = (resource: PlanLimitResource, used: number, limit: number, label: string) => {
    if (!shouldWarnQuota(used, limit)) return;
    warnings.push({
      resource,
      used,
      limit,
      message: `Has usado ${used} de ${limit} ${label} de tu plan.`,
      upgradePlanCode: upgrade,
    });
  };

  push('patients', input.usage.patients.used, input.usage.patients.limit, 'pacientes');
  push('uploadRequests', input.usage.uploadRequests.used, input.usage.uploadRequests.limit, 'solicitudes de subida');
  push('storage', input.usage.storage.used, input.usage.storage.limit, 'bytes de almacenamiento');

  const wa = input.usage.whatsappMessages;
  if (wa && wa.limit > 0) {
    push('whatsappMessages', wa.used, wa.limit, 'mensajes WhatsApp');
  }

  return warnings;
}
