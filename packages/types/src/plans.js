"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WHATSAPP_USAGE_WARN_RATIO = exports.PLAN_USAGE_WARN_RATIO = exports.subscriptionPlans = exports.PAID_PROFESSIONAL_FEATURES = exports.PAID_BASIC_FEATURES = exports.FREE_PLAN_FEATURES = exports.WHATSAPP_UTILITY_USD_PER_MESSAGE = exports.PLAN_PRICE_BOB_PER_USD = void 0;
exports.normalizePlanCode = normalizePlanCode;
exports.getPlanByCode = getPlanByCode;
exports.getPlanCapabilities = getPlanCapabilities;
exports.isPaidPlan = isPaidPlan;
exports.formatPlanPriceBob = formatPlanPriceBob;
exports.formatPlanPriceUsd = formatPlanPriceUsd;
exports.calculatePlanChargeBob = calculatePlanChargeBob;
exports.getMercadoPagoRecurringConfig = getMercadoPagoRecurringConfig;
exports.parseMedfileExternalReference = parseMedfileExternalReference;
exports.buildMedfileExternalReference = buildMedfileExternalReference;
exports.estimateWhatsAppCostUsd = estimateWhatsAppCostUsd;
exports.isQuotaExceeded = isQuotaExceeded;
exports.shouldWarnQuota = shouldWarnQuota;
exports.isWhatsAppQuotaExceeded = isWhatsAppQuotaExceeded;
exports.shouldWarnWhatsAppQuota = shouldWarnWhatsAppQuota;
exports.collectPlanUsageWarnings = collectPlanUsageWarnings;
/** Tipo de cambio referencial para mostrar precios en BOB (Bolivia). */
exports.PLAN_PRICE_BOB_PER_USD = 7;
/**
 * Costo Meta Utility por mensaje entregado a paciente (+591 Bolivia).
 * @see docs/25-whatsapp-incluido-en-planes.md
 */
exports.WHATSAPP_UTILITY_USD_PER_MESSAGE = 0.0113;
function normalizePlanCode(code) {
    if (code === 'trial')
        return 'free';
    if (code === 'free' || code === 'basic' || code === 'professional')
        return code;
    return 'free';
}
exports.FREE_PLAN_FEATURES = [
    'Hasta 50 pacientes',
    'Historia clinica y consultas',
    'Enlace para subida de examenes',
    'WhatsApp manual (wa.me) sin limite',
    'Codigo Medfile para colegas',
    '1 medico · 2 GB · sin vencimiento',
];
exports.PAID_BASIC_FEATURES = [
    'Hasta 200 pacientes',
    '8 GB almacenamiento',
    '100 WhatsApp automaticos / mes incluidos',
    'Recordatorios por email incluidos',
    'Logo del consultorio en enlaces',
    '1 medico independiente',
];
exports.PAID_PROFESSIONAL_FEATURES = [
    'Hasta 800 pacientes',
    '25 GB almacenamiento',
    '600 WhatsApp automaticos / mes incluidos',
    'Automatizaciones y digest semanal',
    'Compartir historial con colegas Medfile',
    'Reportes y soporte prioritario',
];
const capabilitiesFree = {
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
const capabilitiesBasic = {
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
const capabilitiesProfessional = {
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
exports.subscriptionPlans = [
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
        features: [...exports.FREE_PLAN_FEATURES],
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
        features: [...exports.PAID_BASIC_FEATURES],
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
        features: [...exports.PAID_PROFESSIONAL_FEATURES],
        capabilities: capabilitiesProfessional,
    },
];
function getPlanByCode(code) {
    const normalized = normalizePlanCode(code);
    return exports.subscriptionPlans.find((plan) => plan.code === normalized) ?? exports.subscriptionPlans[0];
}
function getPlanCapabilities(code) {
    return getPlanByCode(code).capabilities;
}
function isPaidPlan(code) {
    return getPlanByCode(code).tier === 'paid';
}
function formatPlanPriceBob(plan) {
    if (plan.monthlyPriceBob === 0)
        return 'Gratis';
    return `Bs ${plan.monthlyPriceBob}`;
}
function formatPlanPriceUsd(plan) {
    if (plan.monthlyPriceUsd === 0)
        return 'Gratis';
    return `$${plan.monthlyPriceUsd}`;
}
function calculatePlanChargeBob(planCode, billingPeriod = 'monthly') {
    const plan = getPlanByCode(planCode);
    if (plan.tier === 'free')
        return 0;
    const monthlyBob = plan.monthlyPriceBob;
    if (billingPeriod === 'quarterly')
        return Math.round(monthlyBob * 3 * 0.9);
    if (billingPeriod === 'annual')
        return Math.round(monthlyBob * 12 * 0.8);
    return monthlyBob;
}
function getMercadoPagoRecurringConfig(billingPeriod) {
    if (billingPeriod === 'quarterly') {
        return { frequency: 3, frequencyType: 'months' };
    }
    if (billingPeriod === 'annual') {
        return { frequency: 12, frequencyType: 'months' };
    }
    return { frequency: 1, frequencyType: 'months' };
}
function parseMedfileExternalReference(reference) {
    const [prefix, tenantId, planCode, billingPeriod] = reference.split(':');
    if (prefix !== 'medfile' || !tenantId || !planCode)
        return null;
    return {
        tenantId,
        planCode: normalizePlanCode(planCode),
        billingPeriod: billingPeriod || 'monthly',
    };
}
function buildMedfileExternalReference(tenantId, planCode, billingPeriod) {
    return `medfile:${tenantId}:${planCode}:${billingPeriod}`;
}
/** Costo Meta maximo si el medico usa el 100% del cupo WhatsApp del plan. */
function estimateWhatsAppCostUsd(messages) {
    return Math.round(messages * exports.WHATSAPP_UTILITY_USD_PER_MESSAGE * 100) / 100;
}
/** Umbral (0-1) para avisar al medico que se acerca al limite de cualquier recurso. */
exports.PLAN_USAGE_WARN_RATIO = 0.8;
/** @deprecated Usar PLAN_USAGE_WARN_RATIO */
exports.WHATSAPP_USAGE_WARN_RATIO = exports.PLAN_USAGE_WARN_RATIO;
function isQuotaExceeded(used, limit) {
    if (limit <= 0)
        return used > 0;
    return used >= limit;
}
function shouldWarnQuota(used, limit) {
    if (limit <= 0)
        return false;
    return used / limit >= exports.PLAN_USAGE_WARN_RATIO && used < limit;
}
function isWhatsAppQuotaExceeded(used, limit) {
    if (limit <= 0)
        return true;
    return used >= limit;
}
function shouldWarnWhatsAppQuota(used, limit) {
    return shouldWarnQuota(used, limit);
}
function collectPlanUsageWarnings(input) {
    const warnings = [];
    const upgrade = input.planCode === 'free' ? 'basic' : input.planCode === 'basic' ? 'professional' : undefined;
    const push = (resource, used, limit, label) => {
        if (!shouldWarnQuota(used, limit))
            return;
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
