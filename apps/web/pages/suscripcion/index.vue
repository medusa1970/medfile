<template>
  <div class="dashboard-page subscription-page">
    <header class="dashboard-topbar">
      <div class="dashboard-topbar__main">
        <EyebrowPill>Facturación</EyebrowPill>
        <h1 class="dashboard-topbar__title">Suscripción</h1>
        <p class="dashboard-topbar__lead">
          Plan actual, límites y uso. Tus datos clínicos permanecen aunque no pagues; los planes de
          pago desbloquean capacidad y automatización.
        </p>
      </div>
      <StatusBadge :tone="statusTone">{{ statusLabel }}</StatusBadge>
    </header>

    <div v-if="checkoutNotice" class="checkout-notice" :class="checkoutNotice.tone" role="status">
      <strong>{{ checkoutNotice.title }}</strong>
      <p>{{ checkoutNotice.message }}</p>
    </div>

    <PanelCard padded class="patient-panel-compact">
      <template #header>
        <h2>Periodo de facturación</h2>
      </template>
      <p class="panel-hint panel-hint--compact">
        Precios en <strong>bolivianos (Bs)</strong>. Elige Mercado Pago o QR Banco Económico según
        disponibilidad.
      </p>
      <div class="billing-toggle" role="group" aria-label="Periodo de facturacion">
        <button
          v-for="option in billingOptions"
          :key="option.id"
          type="button"
          class="billing-toggle__btn"
          :class="{ 'billing-toggle__btn--active': billingPeriod === option.id }"
          @click="billingPeriod = option.id"
        >
          {{ option.label }}
          <span v-if="option.save" class="billing-toggle__save">{{ option.save }}</span>
        </button>
      </div>
    </PanelCard>

    <StatStrip :items="subscriptionStats" aria-label="Resumen del plan" />

    <div v-if="upgradeHint" class="subscription-alert subscription-alert--upgrade" role="status">
      <strong>{{ upgradeHint.title }}</strong>
      <p>{{ upgradeHint.message }}</p>
    </div>

    <div v-if="whatsappWarning" class="subscription-alert" role="status">
      <strong>{{ whatsappWarning.title }}</strong>
      <p>{{ whatsappWarning.message }}</p>
      <MfButton v-if="subscription.planCode === 'basic'" variant="secondary" to="/suscripcion">
        Ver plan Profesional
      </MfButton>
    </div>

    <section class="dashboard-grid dashboard-grid--compact">
      <PanelCard title="Uso del plan" padded class="patient-panel-compact">
        <div class="usage-list usage-list--compact">
          <div v-for="item in usageItems" :key="item.label" class="usage-item">
            <div class="usage-item__head">
              <strong>{{ item.label }}</strong>
              <span>{{ item.used }} de {{ item.limit }}</span>
            </div>
            <div class="usage-bar">
              <span :style="{ width: `${item.percent}%` }"></span>
            </div>
          </div>
        </div>

        <p v-if="loadError" class="form-error upload-page-notice">
          No se pudo conectar al API. Mostrando suscripción demo.
        </p>
      </PanelCard>

      <PanelCard title="Incluido en tu plan" padded class="patient-panel-compact">
        <ul class="plan-capability-list">
          <li v-for="feature in subscription.plan.features" :key="feature">{{ feature }}</li>
        </ul>
        <p class="panel-hint panel-hint--compact">
          Si bajas de plan, conservas acceso a pacientes y documentos ya registrados. Solo se
          pausan funciones premium y topes de creación.
        </p>
        <MfButton variant="secondary" block to="/documentos">Probar enlace + WhatsApp</MfButton>
      </PanelCard>
    </section>

    <PanelCard padded class="patient-panel-compact subscription-plans-panel">
      <template #header>
        <h2>Comparar planes</h2>
      </template>
      <p class="panel-hint panel-hint--compact">
        Gratis permanente. Básico incluye 1 asistente o secretaria. Profesional añade enfermería con
        permiso temporal del médico y compartir historiales con colegas Medfile.
      </p>

      <div class="plan-compare-grid">
        <article
          v-for="plan in plans"
          :key="plan.code"
          :id="`plan-${plan.code}`"
          class="plan-compare-card"
          :class="{ 'plan-compare-card--highlight': highlightPlanCode === plan.code }"
        >
          <span class="plan-tier-badge" :class="`plan-tier-badge--${plan.tier}`">
            {{ plan.tier === 'free' ? 'Gratis' : 'De pago' }}
          </span>
          <h3>{{ plan.name }}</h3>
          <p class="plan-compare-card__price">
            <strong>{{ formatPlanCardPrice(plan.code) }}</strong>
            <span v-if="plan.tier === 'paid'" class="plan-compare-card__price-ref">
              {{ formatPlanUsdReference(plan.code, billingPeriod) }}
            </span>
          </p>
          <p
            v-if="plan.tier === 'paid' && formatPlanEffectiveMonthlyNote(plan.code, billingPeriod)"
            class="plan-compare-card__effective"
          >
            {{ formatPlanEffectiveMonthlyNote(plan.code, billingPeriod) }}
          </p>
          <ul class="plan-features">
            <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
          </ul>
          <ul v-if="plan.capabilities" class="plan-capabilities-mini">
            <li :class="{ off: !plan.capabilities.emailReminders }">Email automático</li>
            <li :class="{ off: !plan.capabilities.whatsappAutomated }">WhatsApp automático</li>
            <li :class="{ off: !plan.capabilities.assistantUsers }">Asistente o secretaria</li>
            <li :class="{ off: !plan.capabilities.clinicalCaptureUsers }">Enfermería delegada</li>
            <li :class="{ off: !plan.capabilities.auditLog }">Auditoría por usuario</li>
            <li :class="{ off: !plan.capabilities.clinicalShare }">Compartir historial colega</li>
          </ul>
          <MfButton
            v-if="plan.tier === 'paid' && plan.code !== subscription.planCode && paymentOptions.economicoQr"
            block
            variant="secondary"
            class="plan-checkout-secondary"
            :disabled="checkoutLoading === plan.code"
            @click="startEconomicoCheckout(plan.code)"
          >
            {{ economicoButtonLabel(plan.code) }}
          </MfButton>
          <MfButton
            block
            :variant="planButtonVariant(plan.code)"
            :disabled="isPlanCheckoutDisabled(plan.code)"
            @click="handlePlanAction(plan.code)"
          >
            {{ planButtonLabel(plan.code) }}
          </MfButton>
          <p v-if="plan.tier === 'paid' && plan.code !== subscription.planCode" class="plan-price-bob">
            {{ formatCheckoutPrice(plan.code) }}
          </p>
        </article>
      </div>
    </PanelCard>

    <PanelCard
      v-if="economicoCheckout"
      title="Pago con QR — Banco Económico"
      padded
      class="patient-panel-compact economico-checkout-panel"
    >
      <p class="panel-hint panel-hint--compact">
        Escanea el QR con la app del Banco Económico. Monto:
        <strong>Bs {{ economicoCheckout.amountBob }}</strong>
      </p>
      <div v-if="economicoCheckout.status === 'paid'" class="checkout-notice success" role="status">
        <strong>Pago confirmado</strong>
        <p>Tu plan se activó correctamente.</p>
      </div>
      <div v-else-if="economicoCheckout.status === 'expired'" class="checkout-notice warning" role="status">
        <strong>QR expirado</strong>
        <p>Genera un nuevo código para continuar.</p>
      </div>
      <p v-else-if="qrPolling" class="panel-hint panel-hint--compact">
        Esperando confirmación del banco…
      </p>
      <p v-if="economicoCheckout.instructions" class="economico-instructions">
        {{ economicoCheckout.instructions }}
      </p>
      <img
        v-if="economicoQrSrc && economicoCheckout.status === 'pending'"
        :src="economicoQrSrc"
        alt="Codigo QR de pago"
        class="economico-qr-image"
      />
      <p class="panel-hint panel-hint--compact">
        Referencia: {{ economicoCheckout.orderId }} · Vence
        {{ formatEconomicoExpiry(economicoCheckout.expiresAt) }}
      </p>
      <MfButton
        v-if="economicoCheckout.mode === 'mock' && economicoCheckout.status === 'pending'"
        block
        :disabled="mockConfirmLoading"
        @click="confirmMockQrPayment"
      >
        {{ mockConfirmLoading ? 'Activando…' : 'Simular pago confirmado (dev)' }}
      </MfButton>
      <MfButton variant="secondary" block @click="closeEconomicoCheckout">Cerrar</MfButton>
    </PanelCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'doctor', ssr: false })
import type { BillingPeriod, PlanCapabilities, PlanCode, PlanTier } from '@medfile/types/plans'
import {
  calculatePlanChargeBob,
  shouldWarnWhatsAppQuota,
  isWhatsAppQuotaExceeded,
} from '@medfile/types/plans'
import type { StatStripItem } from '~/components/ui/StatStrip.vue'
import { readReturnToQuery } from '~/utils/app-back-route'
import { subscriptionRoute } from '~/utils/subscription-route'
import {
  billingPeriodSuffix,
  formatPlanEffectiveMonthlyNote,
  formatPlanPricePrimary,
  formatPlanUsdReference,
} from '~/utils/plan-pricing-display'

type BadgeTone = '' | 'warning' | 'danger' | 'success'

interface CheckoutResponse {
  mode: 'mercadopago' | 'mock' | 'economico_qr'
  preapprovalId: string
  initPoint: string
  amountBob: number
  planCode: PlanCode
  billingPeriod: BillingPeriod
}

interface EconomicoCheckoutResponse {
  checkoutId: string
  mode: 'economico_qr' | 'mock'
  orderId: string
  amountBob: number
  planCode: PlanCode
  billingPeriod: BillingPeriod
  qrImage: string
  qrImageUrl?: string
  expiresAt: string
  status: 'pending' | 'paid' | 'expired'
  instructions?: string
}

interface PaymentOptionsResponse {
  mercadopago: boolean
  economicoQr: boolean
  defaultProvider: string
  currency: 'BOB'
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

const apiBaseUrl = usePublicApiBaseUrl()
const route = useRoute()
const router = useRouter()
const { apiFetch } = useMedfileApi()
const loadError = ref(false)
const checkoutLoading = ref<PlanCode | ''>('')
const checkoutNotice = ref<{ title: string; message: string; tone: string } | null>(null)
const billingPeriod = ref<BillingPeriod>('monthly')
const paymentOptions = ref<PaymentOptionsResponse>({
  mercadopago: true,
  economicoQr: false,
  defaultProvider: 'mock',
  currency: 'BOB',
})
const economicoCheckout = ref<EconomicoCheckoutResponse | null>(null)
const qrPolling = ref(false)
const mockConfirmLoading = ref(false)
let qrPollTimer: ReturnType<typeof setInterval> | null = null

const economicoQrSrc = computed(() => {
  const checkout = economicoCheckout.value
  if (!checkout) return ''
  if (checkout.qrImageUrl) return checkout.qrImageUrl
  if (checkout.qrImage?.startsWith('data:') || checkout.qrImage?.startsWith('http')) {
    return checkout.qrImage
  }
  return checkout.qrImage ? `data:image/png;base64,${checkout.qrImage}` : ''
})

const billingOptions = [
  { id: 'monthly' as BillingPeriod, label: 'Mensual', save: '' },
  { id: 'quarterly' as BillingPeriod, label: 'Trimestral', save: '-10%' },
  { id: 'annual' as BillingPeriod, label: 'Anual', save: '2 meses gratis' },
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
    'WhatsApp manual (wa.me)',
    'Codigo Medfile (compartir historial en plan Profesional)',
    '1 usuario · 2 GB',
  ],
  capabilities: {
    whatsappShareLink: true,
    whatsappAutomated: false,
    emailReminders: false,
    smsReminders: false,
    assistantUsers: false,
    clinicalCaptureUsers: false,
    auditLog: false,
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
    limits: { patients: 200, users: 2, storageBytes: 8589934592, uploadRequestsPerMonth: 150, whatsappMessagesPerMonth: 100 },
    features: [
      'Hasta 200 pacientes',
      '8 GB · 1 medico + 1 asistente',
      'Cupo 100 WhatsApp / mes (envio proximamente)',
      'Email y logo en enlaces (proximamente)',
    ],
    capabilities: {
      whatsappShareLink: true,
      whatsappAutomated: true,
      emailReminders: true,
      smsReminders: false,
      assistantUsers: true,
      clinicalCaptureUsers: false,
      auditLog: false,
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
    limits: { patients: 800, users: 3, storageBytes: 26843545600, uploadRequestsPerMonth: 500, whatsappMessagesPerMonth: 600 },
    features: [
      'Hasta 800 pacientes',
      '25 GB · equipo ampliado',
      'Cupo 600 WhatsApp / mes (envio proximamente)',
      'Enfermeria: vitales, cola y triage',
      'Auditoria por usuario',
      'Compartir historial con colegas',
      'Automatizaciones y reportes (proximamente)',
    ],
    capabilities: {
      whatsappShareLink: true,
      whatsappAutomated: true,
      emailReminders: true,
      smsReminders: false,
      assistantUsers: true,
      clinicalCaptureUsers: true,
      auditLog: true,
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
    return await $fetch<Plan[]>(`${apiBaseUrl}/api/subscriptions/plans`)
  } catch {
    return fallbackPlans
  }
})

const subscription = computed(() => subscriptionData.value ?? fallbackSubscription)
const plans = computed(() => plansData.value ?? fallbackPlans)

const highlightPlanCode = computed(() => {
  const upgrade = String(route.query.upgrade ?? '')
  if (upgrade === 'basic' || upgrade === 'professional') return upgrade as PlanCode
  return null
})

const upgradeHint = computed(() => {
  if (highlightPlanCode.value === 'basic') {
    return {
      title: 'Mejora a plan Básico',
      message:
        'Desbloquea 1 asistente o secretaria para filiación, solicitudes de subida y bandeja administrativa.',
    }
  }
  if (highlightPlanCode.value === 'professional') {
    return {
      title: 'Mejora a plan Profesional',
      message:
        'Desbloquea enfermería delegada, cola clínica, auditoría por usuario y compartir historial con colegas.',
    }
  }
  return null
})

onMounted(() => {
  if (!highlightPlanCode.value || !import.meta.client) return
  nextTick(() => {
    document.getElementById(`plan-${highlightPlanCode.value}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
})

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

const subscriptionStats = computed<StatStripItem[]>(() => {
  const sub = subscription.value
  const items: StatStripItem[] = [
    {
      label: 'Plan',
      value: sub.plan.name,
      badge: planTierLabel.value,
      badgeTone: sub.plan.tier === 'paid' ? 'success' : '',
    },
    {
      label: 'Pacientes',
      value: formatUsage(sub.usage.patients),
      badge: 'límite',
    },
    {
      label: 'Subidas',
      value: formatUsage(sub.usage.uploadRequests),
      badge: 'límite',
    },
    {
      label: 'Storage',
      value: formatStorageUsage.value,
      badge: 'usado',
    },
  ]

  const wa = whatsappUsage.value
  if (wa) {
    items.push({
      label: 'WhatsApp',
      value: formatUsage(wa),
      badge: whatsappUsageNote.value,
      badgeTone: wa.limit <= 0 ? '' : wa.used / wa.limit >= 0.8 ? 'warning' : '',
    })
  }

  return items
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

function formatPlanCardPrice(planCode: PlanCode) {
  return formatPlanPricePrimary(planCode, billingPeriod.value)
}

function formatCheckoutPrice(planCode: PlanCode) {
  if (planCode === 'free') return ''
  const amount = calculatePlanChargeBob(planCode, billingPeriod.value)
  const provider =
    paymentOptions.value.economicoQr && !paymentOptions.value.mercadopago
      ? 'QR Banco Económico'
      : paymentOptions.value.mercadopago
        ? 'Mercado Pago o QR'
        : 'modo prueba'
  return `Bs ${amount}${billingPeriodSuffix(billingPeriod.value)} · ${provider}`
}

function planButtonLabel(planCode: PlanCode) {
  if (planCode === subscription.value.planCode) return 'Plan actual'
  if (planCode === 'free') return 'Plan Gratis'
  if (checkoutLoading.value === planCode) return 'Procesando…'
  if (!paymentOptions.value.mercadopago) return 'Mercado Pago no disponible'
  return 'Pagar con Mercado Pago'
}

function isPlanCheckoutDisabled(planCode: PlanCode) {
  if (checkoutLoading.value === planCode) return true
  if (planCode === subscription.value.planCode || planCode === 'free') return false
  return !paymentOptions.value.mercadopago
}

function economicoButtonLabel(planCode: PlanCode) {
  if (checkoutLoading.value === planCode) return 'Generando QR…'
  return 'Pagar con QR Banco Económico'
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

async function startEconomicoCheckout(planCode: PlanCode) {
  checkoutLoading.value = planCode
  checkoutNotice.value = null
  stopQrPolling()
  economicoCheckout.value = null

  try {
    const checkout = await apiFetch<EconomicoCheckoutResponse>('/api/payments/checkout/qr', {
      method: 'POST',
      body: { planCode, billingPeriod: billingPeriod.value },
    })
    economicoCheckout.value = checkout
    checkoutNotice.value = {
      tone: 'success',
      title: 'QR generado',
      message:
        'Escanea el codigo con tu app del Banco Economico. El plan se activara al confirmar el pago.',
    }
    if (checkout.status === 'pending') {
      startQrPolling(checkout.checkoutId)
    }
  } catch (error) {
    checkoutNotice.value = {
      tone: 'error',
      title: 'No se pudo generar el QR',
      message: getErrorMessage(error),
    }
  } finally {
    checkoutLoading.value = ''
  }
}

function startQrPolling(checkoutId: string) {
  stopQrPolling()
  qrPolling.value = true
  qrPollTimer = setInterval(() => {
    void pollQrStatus(checkoutId)
  }, 2500)
  void pollQrStatus(checkoutId)
}

function stopQrPolling() {
  if (qrPollTimer) {
    clearInterval(qrPollTimer)
    qrPollTimer = null
  }
  qrPolling.value = false
}

async function pollQrStatus(checkoutId: string) {
  try {
    const status = await apiFetch<EconomicoCheckoutResponse>(
      `/api/payments/checkout/${checkoutId}/status`,
    )
    if (!economicoCheckout.value || economicoCheckout.value.checkoutId !== checkoutId) return

    economicoCheckout.value = { ...economicoCheckout.value, ...status }

    if (status.status === 'paid') {
      stopQrPolling()
      checkoutNotice.value = {
        tone: 'success',
        title: 'Pago confirmado',
        message: 'Tu plan quedó activo. Gracias por suscribirte a Medfile.',
      }
      await refreshSubscription()
    } else if (status.status === 'expired') {
      stopQrPolling()
    }
  } catch {
    // Ignorar errores transitorios de polling
  }
}

async function confirmMockQrPayment() {
  const checkout = economicoCheckout.value
  if (!checkout || checkout.mode !== 'mock') return

  mockConfirmLoading.value = true
  try {
    const updated = await apiFetch<EconomicoCheckoutResponse>(
      `/api/payments/checkout/${checkout.checkoutId}/confirm-mock`,
      { method: 'POST' },
    )
    economicoCheckout.value = { ...checkout, ...updated, status: 'paid' }
    stopQrPolling()
    checkoutNotice.value = {
      tone: 'success',
      title: 'Plan activado (modo prueba)',
      message: 'Pago QR simulado. En produccion el banco confirma via webhook.',
    }
    await refreshSubscription()
  } catch (error) {
    checkoutNotice.value = {
      tone: 'error',
      title: 'No se pudo simular el pago',
      message: getErrorMessage(error),
    }
  } finally {
    mockConfirmLoading.value = false
  }
}

function closeEconomicoCheckout() {
  stopQrPolling()
  economicoCheckout.value = null
}

function formatEconomicoExpiry(value: string) {
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadPaymentOptions() {
  try {
    paymentOptions.value = await apiFetch<PaymentOptionsResponse>('/api/payments/options')
  } catch {
    paymentOptions.value = {
      mercadopago: true,
      economicoQr: false,
      defaultProvider: 'mock',
      currency: 'BOB',
    }
  }
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
      const returnTo = readReturnToQuery(route.query)
      await router.replace(returnTo ? subscriptionRoute(returnTo) : { path: '/suscripcion' })
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
      const returnTo = readReturnToQuery(route.query)
      await router.replace(returnTo ? subscriptionRoute(returnTo) : { path: '/suscripcion' })
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
  void loadPaymentOptions()
})

onUnmounted(() => {
  stopQrPolling()
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
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

.plan-price-bob {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--mf-slate-600);
  text-align: center;
}

.plan-compare-card__price-ref {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--mf-slate-500);
}

.plan-compare-card__effective {
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--mf-teal-600);
  text-align: center;
}

.plan-checkout-secondary {
  margin-bottom: 8px;
}

.economico-checkout-panel {
  margin-top: 10px;
}

.economico-qr-image {
  display: block;
  max-width: 240px;
  margin: 12px auto;
  border-radius: 12px;
  border: 1px solid rgb(15 23 42 / 0.08);
}

.economico-instructions,
.economico-qr-payload {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--mf-slate-700);
  word-break: break-word;
}

@media (max-width: 980px) {
  .plan-compare-grid {
    grid-template-columns: 1fr;
  }
}
</style>
