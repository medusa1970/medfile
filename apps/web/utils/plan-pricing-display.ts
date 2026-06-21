import {
  ANNUAL_BILLING_MONTHS_PAID,
  calculatePlanChargeBob,
  calculatePlanChargeUsd,
  calculatePlanEffectiveMonthlyBob,
  formatPlanPriceBob,
  getPlanByCode,
  type BillingPeriod,
  type PlanCode,
} from '@medfile/types/plans'

/** Etiqueta del periodo de facturacion en espanol. */
export function billingPeriodSuffix(period: BillingPeriod) {
  if (period === 'quarterly') return '/ trimestre'
  if (period === 'annual') return '/ año'
  return '/ mes'
}

/** Precio principal en BOB para mostrar en UI (Bolivia). */
export function formatPlanPricePrimary(planCode: PlanCode, period: BillingPeriod = 'monthly') {
  const plan = getPlanByCode(planCode)
  if (plan.tier === 'free') return 'Gratis'

  const amount = calculatePlanChargeBob(planCode, period)
  return `Bs ${amount}${billingPeriodSuffix(period)}`
}

/** Precio mensual de referencia (tarjeta cuando el toggle es mensual). */
export function formatPlanMonthlyBob(planCode: PlanCode) {
  const plan = getPlanByCode(planCode)
  if (plan.tier === 'free') return 'Gratis'
  return formatPlanPriceBob(plan)
}

/** Referencia USD secundaria (opcional, tooltip o nota legal). */
export function formatPlanUsdReference(planCode: PlanCode, period: BillingPeriod = 'monthly') {
  const plan = getPlanByCode(planCode)
  if (plan.tier === 'free') return ''

  const monthly = plan.monthlyPriceUsd
  if (period === 'monthly') return `ref. $${monthly} USD`
  if (period === 'quarterly') return `ref. $${calculatePlanChargeUsd(planCode, period)} USD trim.`
  return `ref. $${calculatePlanChargeUsd(planCode, period)} USD/año`
}

/** Nota de precio mensual efectivo (trimestral / anual). */
export function formatPlanEffectiveMonthlyNote(planCode: PlanCode, period: BillingPeriod = 'monthly') {
  const plan = getPlanByCode(planCode)
  if (plan.tier === 'free' || period === 'monthly') return ''

  const effective = calculatePlanEffectiveMonthlyBob(planCode, period)
  return `≈ Bs ${effective}/mes`
}

/** Nota corta del descuento anual para badges y copy. */
export function annualBillingPromoLabel() {
  return '2 meses gratis'
}

/** Linea de periodo para tarjetas de plan en landing. */
export function formatPlanPeriodNote(planCode: PlanCode, period: BillingPeriod) {
  if (period === 'monthly') {
    if (planCode === 'basic') {
      return '1 médico + 1 asistente · 100 WhatsApp/mes · precios en Bs'
    }
    if (planCode === 'professional') {
      return '1 médico + asistente + enfermería · 600 WhatsApp/mes'
    }
    return ''
  }
  if (period === 'quarterly') return 'Facturación trimestral · −10 %'
  return `Paga ${ANNUAL_BILLING_MONTHS_PAID} meses · 12 meses de servicio`
}
