<template>
  <DoctorShell>
    <header class="app-header">
      <div>
        <EyebrowPill>Facturacion</EyebrowPill>
        <h1>Suscripcion</h1>
        <p>
          Plan actual, limites y uso. Tus datos clinicos permanecen aunque no pagues; los planes de
          pago desbloquean capacidad y automatizacion.
        </p>
      </div>
      <StatusBadge :tone="statusTone">{{ statusLabel }}</StatusBadge>
    </header>

    <div v-if="checkoutNotice" class="checkout-notice" :class="checkoutNotice.tone" role="status">
      <strong>{{ checkoutNotice.title }}</strong>
      <p>{{ checkoutNotice.message }}</p>
    </div>

    <section class="section compact-section billing-period-section">
      <SectionHeading
        title="Periodo de facturacion"
        description="El cobro recurrente se procesa con Mercado Pago en bolivianos."
      />
      <div class="billing-toggle" role="group" aria-label="Periodo de facturacion">
        <button
          v-for="option in billingOptions"
          :key="option.id"
          type="button"
          :class="{ active: billingPeriod === option.id }"
          @click="billingPeriod = option.id"
        >
          {{ option.label }}
          <span v-if="option.save" class="save-badge">{{ option.save }}</span>
        </button>
      </div>
    </section>

    <section class="clinical-summary" aria-label="Resumen de suscripcion">
      <MetricCard label="Plan actual" :value="subscription.plan.name" :note="planTierLabel" />
      <MetricCard label="Pacientes" :value="formatUsage(subscription.usage.patients)" note="limite" />
      <MetricCard
        v-if="whatsappUsage"
        label="WhatsApp / mes"
        :value="formatUsage(whatsappUsage)"
        :note="whatsappUsageNote"
      />
      <MetricCard label="Subidas / mes" :value="formatUsage(subscription.usage.uploadRequests)" note="limite" />
      <MetricCard label="Storage" :value="formatStorageUsage" note="usado" />
    </section>

    <div v-if="whatsappWarning" class="whatsapp-quota-banner" role="status">
      <strong>{{ whatsappWarning.title }}</strong>
      <p>{{ whatsappWarning.message }}</p>
      <MfButton v-if="subscription.planCode === 'basic'" variant="primary" to="/suscripcion">
        Ver plan Profesional
      </MfButton>
    </div>

    <section class="dashboard-grid">
      <PanelCard title="Uso del plan" padded>
        <div class="usage-list">
          <div v-for="item in usageItems" :key="item.label" class="usage-item">
            <div>
              <strong>{{ item.label }}</strong>
              <span>{{ item.used }} de {{ item.limit }}</span>
            </div>
            <div class="usage-bar">
              <span :style="{ width: `${item.percent}%` }"></span>
            </div>
          </div>
        </div>

        <div v-if="loadError" class="form-error upload-page-notice">
          No se pudo conectar al API. Mostrando suscripcion demo.
        </div>
      </PanelCard>

      <PanelCard title="Incluido en tu plan" padded>
        <ul class="plan-capability-list">
          <li v-for="feature in subscription.plan.features" :key="feature">{{ feature }}</li>
        </ul>
        <p class="mobile-copy plan-data-note">
          Si bajas de plan, conservas acceso a pacientes y documentos ya registrados. Solo se
          pausan funciones premium y topes de creacion.
        </p>
        <MfButton variant="secondary" block to="/documentos">Probar enlace + WhatsApp</MfButton>
      </PanelCard>
    </section>

    <section class="section compact-section">
      <SectionHeading
        title="Comparar planes"
        description="Gratis permanente. Basico y Profesional incluyen WhatsApp automatico. Profesional permite compartir historiales con colegas Medfile bajo permisos, alcance y revocacion que tu defines."
      />

      <div class="plan-compare-grid">
        <article v-for="plan in plans" :key="plan.code" class="feature-card plan-card plan-compare-card">
          <span class="plan-tier-badge" :class="`plan-tier-badge--${plan.tier}`">
            {{ plan.tier === 'free' ? 'Gratis' : 'De pago' }}
          </span>
          <h3>{{ plan.name }}</h3>
          <p>
            <strong>{{ plan.monthlyPriceUsd === 0 ? '$0' : `$${plan.monthlyPriceUsd}/mes` }}</strong>
          </p>
          <ul class="plan-features">
            <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
          </ul>
          <ul v-if="plan.capabilities" class="plan-capabilities-mini">
            <li :class="{ off: !plan.capabilities.emailReminders }">Email automatico</li>
            <li :class="{ off: !plan.capabilities.whatsappAutomated }">WhatsApp automatico</li>
            <li :class="{ off: !plan.capabilities.clinicalShare }">Compartir historial colega</li>
            <li :class="{ off: !plan.capabilities.assistantUsers }">Usuario asistente</li>
          </ul>
          <MfButton
            block
            :variant="planButtonVariant(plan.code)"
            :disabled="checkoutLoading === plan.code"
            @click="handlePlanAction(plan.code)"
          >
            {{ planButtonLabel(plan.code) }}
          </MfButton>
          <p v-if="plan.tier === 'paid' && plan.code !== subscription.planCode" class="plan-price-bob">
            {{ formatCheckoutPrice(plan.code) }}
          </p>
        </article>
      </div>
    </section>
  </DoctorShell>
</template>

<script setup lang="ts">
import type { BillingPeriod, PlanCapabilities, PlanCode, PlanTier } from '@medfile/types/plans'
import {
  calculatePlanChargeBob,
  shouldWarnWhatsAppQuota,
  isWhatsAppQuotaExceeded,
} from '@medfile/types/plans'

type BadgeTone = '' | 'warning' | 'danger' | 'success'

interface CheckoutResponse {
  mode: 'mercadopago' | 'mock'
  preapprovalId: string
  initPoint: string
  amountBob: number
  planCode: PlanCode
  billingPeriod: BillingPeriod
}

interface Plan {
  code: PlanCode
  name: string
  tier: PlanTier
  monthlyPriceUsd: number
  limits: {
    patients: number
    users: number
    storageBytes: number
    uploadRequestsPerMonth: number
    whatsappMessagesPerMonth: number
  }
  features: string[]
  capabilities?: PlanCapabilities
}

interface SubscriptionState {
  tenantId: string
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended'
  planCode: PlanCode
  plan: Plan
  usage: {
    patients: Usage
    users: Usage
    storage: Usage
    uploadRequests: Usage
    whatsappMessages?: Usage
  }
}

interface Usage {
  used: number
  limit: number
}

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { apiFetch } = useMedfileApi()
const loadError = ref(false)
const checkoutLoading = ref<PlanCode | ''>('')
const checkoutNotice = ref<{ title: string; message: string; tone: string } | null>(null)
const billingPeriod = ref<BillingPeriod>('monthly')

const billingOptions = [
  { id: 'monthly' as BillingPeriod, label: 'Mensual', save: '' },
  { id: 'quarterly' as BillingPeriod, label: 'Trimestral', save: '-10%' },
  { id: 'annual' as BillingPeriod, label: 'Anual', save: '-20%' },
]

const freePlan: Plan = {
  code: 'free',
  name: 'Gratis',
  tier: 'free',
  monthlyPriceUsd: 0,
  limits: { patients: 50, users: 1, storageBytes: 2147483648, uploadRequestsPerMonth: 30, whatsappMessagesPerMonth: 0 },
  features: [
    'Hasta 50 pacientes',
    'Historia clinica y consultas',
    'Enlace subida paciente',
    'WhatsApp manual (compartir enlace)',
    'Codigo Medfile · preparado para compartir con colegas',
    '1 usuario · 2 GB',
  ],
  capabilities: {
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
  },
}

const fallbackPlans: Plan[] = [
  freePlan,
  {
    code: 'basic',
    name: 'Basico',
    tier: 'paid',
    monthlyPriceUsd: 14,
    limits: { patients: 200, users: 1, storageBytes: 8589934592, uploadRequestsPerMonth: 150, whatsappMessagesPerMonth: 100 },
    features: [
      'Hasta 200 pacientes',
      '8 GB · 1 medico',
      '100 WhatsApp automaticos / mes incluidos',
      'Email y logo en enlaces',
    ],
    capabilities: {
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
    },
  },
  {
    code: 'professional',
    name: 'Profesional',
    tier: 'paid',
    monthlyPriceUsd: 32,
    limits: { patients: 800, users: 1, storageBytes: 26843545600, uploadRequestsPerMonth: 500, whatsappMessagesPerMonth: 600 },
    features: [
      'Hasta 800 pacientes',
      '25 GB · 1 medico alto volumen',
      '600 WhatsApp automaticos / mes incluidos',
      'Compartir historial con colegas (permisos y revocacion)',
      'Automatizaciones y reportes',
    ],
    capabilities: {
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
    },
  },
]

const fallbackSubscription: SubscriptionState = {
  tenantId: 'demo-tenant',
  status: 'active',
  planCode: 'free',
  plan: freePlan,
  usage: {
    patients: { used: 3, limit: 50 },
    users: { used: 1, limit: 1 },
    storage: { used: 0, limit: 2147483648 },
    uploadRequests: { used: 2, limit: 30 },
    whatsappMessages: { used: 0, limit: 0 },
  },
}

const { data: subscriptionData, refresh: refreshSubscription } = await useAsyncData(
  'subscription-current',
  async () => {
    try {
      return await apiFetch<SubscriptionState>('/api/subscriptions/current')
    } catch {
      loadError.value = true
      return fallbackSubscription
    }
  },
  { server: false },
)

const { data: plansData } = await useAsyncData('subscription-plans', async () => {
  try {
    return await $fetch<Plan[]>(`${config.public.apiUrl}/api/subscriptions/plans`)
  } catch {
    return fallbackPlans
  }
})

const subscription = computed(() => subscriptionData.value ?? fallbackSubscription)
const plans = computed(() => plansData.value ?? fallbackPlans)

const planTierLabel = computed(() =>
  subscription.value.plan.tier === 'paid' ? 'plan de pago' : 'gratis permanente',
)

const formatStorageUsage = computed(() => {
  const storage = subscription.value.usage.storage
  return `${formatBytes(storage.used)} / ${formatBytes(storage.limit)}`
})

const statusLabel = computed(() => {
  const labels: Record<SubscriptionState['status'], string> = {
    trialing: 'Activo',
    active: 'Activo',
    past_due: 'Pago pendiente',
    canceled: 'Cancelado',
    suspended: 'Suspendido',
  }

  return labels[subscription.value.status]
})

const statusTone = computed<BadgeTone>(() => {
  if (subscription.value.status === 'active' || subscription.value.status === 'trialing') {
    return subscription.value.plan.tier === 'paid' ? 'success' : ''
  }
  if (subscription.value.status === 'past_due' || subscription.value.status === 'suspended') {
    return 'danger'
  }
  return 'warning'
})

const whatsappUsage = computed(() => subscription.value.usage.whatsappMessages)

const whatsappUsageNote = computed(() => {
  const usage = whatsappUsage.value
  if (!usage || usage.limit <= 0) return 'solo wa.me manual'
  return 'incluidos en tu plan'
})

const whatsappWarning = computed(() => {
  const usage = whatsappUsage.value
  if (!usage || usage.limit <= 0) return null

  if (isWhatsAppQuotaExceeded(usage.used, usage.limit)) {
    return {
      title: 'Cupo WhatsApp agotado este mes',
      message:
        'Los nuevos recordatorios automaticos por WhatsApp se pausan hasta el proximo mes. Puedes seguir usando wa.me manual o subir a Profesional (600/mes).',
    }
  }

  if (shouldWarnWhatsAppQuota(usage.used, usage.limit)) {
    const remaining = usage.limit - usage.used
    const upgradeHint =
      subscription.value.planCode === 'basic'
        ? ' Si tu consulta crece, el plan Profesional incluye 600 mensajes/mes.'
        : ''
    return {
      title: 'Te acercas al limite de WhatsApp',
      message: `Has usado ${usage.used} de ${usage.limit} mensajes incluidos (quedan ${remaining}).${upgradeHint}`,
    }
  }

  return null
})

const usageItems = computed(() => {
  const items = [
    buildUsageItem('Pacientes', subscription.value.usage.patients),
    buildUsageItem('Usuarios', subscription.value.usage.users),
    buildUsageItem('Almacenamiento', subscription.value.usage.storage, true),
    buildUsageItem('Solicitudes de subida', subscription.value.usage.uploadRequests),
  ]

  const wa = whatsappUsage.value
  if (wa && wa.limit > 0) {
    items.splice(3, 0, buildUsageItem('WhatsApp automaticos', wa))
  }

  return items
})

function formatCheckoutPrice(planCode: PlanCode) {
  if (planCode === 'free') return ''
  const amount = calculatePlanChargeBob(planCode, billingPeriod.value)
  const suffix =
    billingPeriod.value === 'quarterly'
      ? '/ trimestre'
      : billingPeriod.value === 'annual'
        ? '/ año'
        : '/ mes'
  return `~Bs ${amount}${suffix} · Mercado Pago`
}

function planButtonLabel(planCode: PlanCode) {
  if (planCode === subscription.value.planCode) return 'Plan actual'
  if (planCode === 'free') return 'Plan Gratis'
  if (checkoutLoading.value === planCode) return 'Redirigiendo...'
  return 'Pagar con Mercado Pago'
}

function planButtonVariant(planCode: PlanCode) {
  if (planCode === subscription.value.planCode) return 'secondary'
  if (planCode === 'free') return 'secondary'
  return 'primary'
}

async function handlePlanAction(planCode: PlanCode) {
  if (planCode === subscription.value.planCode || planCode === 'free') return
  await startCheckout(planCode)
}

async function startCheckout(planCode: PlanCode) {
  checkoutLoading.value = planCode
  checkoutNotice.value = null

  try {
    const checkout = await apiFetch<CheckoutResponse>('/api/payments/checkout', {
      method: 'POST',
      body: { planCode, billingPeriod: billingPeriod.value },
    })

    if (checkout.mode === 'mock') {
      window.location.href = checkout.initPoint
      return
    }

    window.location.href = checkout.initPoint
  } catch (error) {
    loadError.value = true
    checkoutNotice.value = {
      tone: 'error',
      title: 'No se pudo iniciar el pago',
      message: getErrorMessage(error),
    }
  } finally {
    checkoutLoading.value = ''
  }
}

async function handleCheckoutReturn() {
  const checkout = route.query.checkout

  if (checkout === 'mock') {
    const preapprovalId = String(route.query.preapprovalId ?? '')
    const plan = String(route.query.plan ?? 'basic') as PlanCode
    const period = String(route.query.period ?? 'monthly') as BillingPeriod

    if (!preapprovalId) return

    try {
      await apiFetch('/api/payments/confirm-mock', {
        method: 'POST',
        body: { preapprovalId, planCode: plan, billingPeriod: period },
      })
      checkoutNotice.value = {
        tone: 'success',
        title: 'Plan activado (modo prueba)',
        message: 'Checkout simulado completado. En produccion esto ocurre via Mercado Pago.',
      }
    } catch {
      loadError.value = true
    } finally {
      await refreshSubscription()
      await router.replace({ path: '/suscripcion' })
    }
    return
  }

  if (checkout === 'return') {
    try {
      await apiFetch('/api/payments/sync-checkout', { method: 'POST' })
      checkoutNotice.value = {
        tone: 'success',
        title: 'Pago recibido',
        message: 'Tu suscripcion se actualizo correctamente.',
      }
    } catch {
      checkoutNotice.value = {
        tone: 'warning',
        title: 'Pago en proceso',
        message: 'Si ya pagaste, el plan se activara en unos minutos. Actualiza esta pagina.',
      }
    } finally {
      await refreshSubscription()
      await router.replace({ path: '/suscripcion' })
    }
  }
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data
    const message = data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'Intenta de nuevo o contacta soporte.'
}

onMounted(() => {
  void handleCheckoutReturn()
})

function buildUsageItem(label: string, usage: Usage, bytes = false) {
  return {
    label,
    used: bytes ? formatBytes(usage.used) : usage.used,
    limit: bytes ? formatBytes(usage.limit) : usage.limit,
    percent: usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0,
  }
}

function formatUsage(usage: Usage) {
  return `${usage.used}/${usage.limit}`
}

function formatBytes(bytes: number) {
  if (bytes >= 1073741824) return `${Math.round(bytes / 1073741824)} GB`
  if (bytes >= 1048576) return `${Math.round(bytes / 1048576)} MB`
  return `${bytes} B`
}
</script>

<style scoped>
.plan-capability-list {
  margin: 0 0 16px;
  padding-left: 18px;
  color: var(--mf-slate-700);
  line-height: 1.55;
}

.plan-data-note {
  margin: 0 0 16px;
  font-size: 14px;
}

.plan-compare-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.plan-compare-card {
  display: flex;
  flex-direction: column;
}

.plan-tier-badge {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.plan-tier-badge--free {
  background: rgb(0 169 206 / 0.12);
  color: var(--mf-teal-600);
}

.plan-tier-badge--paid {
  background: rgb(0 31 92 / 0.08);
  color: var(--mf-navy-900);
}

.plan-capabilities-mini {
  display: grid;
  gap: 6px;
  margin: 0 0 16px;
  padding: 0;
  list-style: none;
  font-size: 13px;
  color: var(--mf-slate-700);
}

.plan-capabilities-mini li::before {
  content: '✓ ';
  color: var(--mf-teal-500);
  font-weight: 700;
}

.plan-capabilities-mini li.off {
  opacity: 0.45;
}

.plan-capabilities-mini li.off::before {
  content: '— ';
  color: var(--mf-neutral-500);
}

.checkout-notice {
  margin-bottom: 20px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid rgb(0 169 206 / 0.25);
  background: rgb(0 169 206 / 0.08);
}

.checkout-notice.success {
  border-color: rgb(16 185 129 / 0.35);
  background: rgb(16 185 129 / 0.1);
}

.checkout-notice.warning,
.checkout-notice.error {
  border-color: rgb(245 158 11 / 0.35);
  background: rgb(245 158 11 / 0.1);
}

.checkout-notice strong {
  display: block;
  margin-bottom: 6px;
}

.checkout-notice p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.billing-period-section {
  margin-bottom: 20px;
}

.billing-toggle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.billing-toggle button {
  border: 1px solid rgb(0 31 92 / 0.12);
  background: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
}

.billing-toggle button.active {
  background: var(--mf-navy-900);
  color: #fff;
  border-color: var(--mf-navy-900);
}

.save-badge {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--mf-teal-600);
}

.billing-toggle button.active .save-badge {
  color: rgb(255 255 255 / 0.85);
}

.plan-price-bob {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--mf-slate-600);
  text-align: center;
}

.whatsapp-quota-banner {
  margin-bottom: 20px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid rgb(245 158 11 / 0.35);
  background: rgb(245 158 11 / 0.1);
  color: var(--mf-slate-800);
}

.whatsapp-quota-banner strong {
  display: block;
  margin-bottom: 6px;
}

.whatsapp-quota-banner p {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 980px) {
  .plan-compare-grid {
    grid-template-columns: 1fr;
  }
}
</style>
