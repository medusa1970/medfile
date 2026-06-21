<template>
  <div class="dashboard-page">
      <header class="dashboard-topbar">
        <div class="dashboard-topbar__main">
          <EyebrowPill>{{ planLabel }}</EyebrowPill>
          <h1 class="dashboard-topbar__title">{{ greeting }}</h1>
          <p class="dashboard-topbar__lead">
            Resumen clínico de {{ clinicName }}.
          </p>
        </div>
        <SearchInput
          v-model="searchQuery"
          block
          placeholder="Buscar paciente o documento"
          aria-label="Buscar paciente o documento"
          @submit="goToSearch"
        />
      </header>

      <QuickAccessGrid :items="quickAccessItems" :subtitle="quickAccessSubtitle" />

      <MedfileCodeCard
        v-if="medfileCode"
        :code="medfileCode"
        compact
      />

      <StatStrip :items="dashboardStats" aria-label="Indicadores del consultorio" />

      <div v-if="usageWarnings.length" class="plan-usage-warnings" role="status">
        <article v-for="warning in usageWarnings" :key="warning.resource" class="plan-usage-warning">
          <strong>{{ warningTitle(warning.resource) }}</strong>
          <p>{{ warning.message }}</p>
          <MfButton v-if="warning.upgradePlanCode" variant="secondary" to="/suscripcion">
            Ver planes
          </MfButton>
        </article>
      </div>

      <section class="dashboard-grid dashboard-grid--compact" aria-label="Actividad reciente">
        <PanelCard padded class="patient-panel-compact dashboard-panel-compact">
          <template #header>
            <h2>Pacientes que requieren atención</h2>
          </template>

          <div class="panel-toolbar">
            <span class="panel-toolbar__meta">
              {{ patients.length }} registrados
              <template v-if="priorityPatients.length">
                · {{ priorityPatients.length }} prioritarios
              </template>
            </span>
            <NuxtLink to="/pacientes/nuevo" class="panel-toolbar__link">Nuevo paciente</NuxtLink>
          </div>

          <p v-if="isLoading" class="panel-empty panel-empty--compact">Cargando tu panel…</p>

          <p v-else-if="loadError" class="form-error dashboard-notice">
            No pudimos cargar tus datos. Inicia sesión nuevamente o verifica que el API esté activo.
          </p>

          <p v-else-if="priorityPatients.length === 0" class="panel-empty panel-empty--compact">
            Aún no tienes pacientes.
            <NuxtLink to="/pacientes/nuevo">Crear el primero</NuxtLink>
          </p>

          <div v-else class="dashboard-patient-list">
            <PatientRow
              v-for="patient in priorityPatients"
              :key="patient.id"
              :initials="patient.initials"
              :name="patient.name"
              :detail="patient.detail"
              :status="patient.status"
              :tone="patient.tone"
              :to="`/pacientes/${patient.id}`"
            />
          </div>
        </PanelCard>

        <PanelCard padded class="patient-panel-compact dashboard-panel-compact">
          <template #header>
            <h2>Bandeja de archivos</h2>
          </template>

          <div class="panel-toolbar">
            <span class="panel-toolbar__meta">
              {{ documents.length }} recibidos
              <template v-if="pendingDocuments > 0">
                · <strong class="panel-toolbar__emphasis">{{ pendingDocuments }} por revisar</strong>
              </template>
            </span>
            <NuxtLink to="/documentos" class="panel-toolbar__link">Ver bandeja</NuxtLink>
          </div>

          <p v-if="pendingDocuments === 0 && documents.length === 0" class="panel-empty panel-empty--compact">
            Sin documentos pendientes. Pide a tus pacientes que suban exámenes con un enlace seguro.
          </p>

          <p v-else-if="pendingDocuments === 0" class="panel-empty panel-empty--compact">
            Bandeja al día. No hay archivos pendientes de revisión.
          </p>

          <p v-else class="panel-hint panel-hint--compact">
            Tienes {{ pendingDocuments }} archivo(s) por clasificar en la historia clínica.
          </p>
        </PanelCard>
      </section>
    </div>
</template>

<script setup lang="ts">
import { buildDoctorQuickAccess } from '~/utils/doctor-quick-access'
import type { PlanCapabilities } from '@medfile/types/plans'
import type { StatStripItem } from '~/components/ui/StatStrip.vue'

import type { PlanLimitResource, PlanUsageWarning } from '@medfile/types/plans'

definePageMeta({
  layout: 'doctor',
  ssr: false,
})

type BadgeTone = '' | 'warning' | 'danger' | 'success'
type PatientStatus = 'active' | 'follow_up' | 'critical' | 'archived'

interface SessionResponse {
  user: {
    fullName: string
    email: string
    emailVerified: boolean
    role?: string
  }
  tenant: {
    name: string
    medfileCode?: string
  }
  subscription: {
    planCode: string
    plan: {
      name: string
      tier?: string
      capabilities?: PlanCapabilities
    }
    usage: {
      patients: { used: number; limit: number }
      uploadRequests: { used: number; limit: number }
      storage: { used: number; limit: number }
      users?: { used: number; limit: number }
      whatsappMessages?: { used: number; limit: number }
    }
    usageWarnings?: PlanUsageWarning[]
  }
}

interface PatientListItem {
  id?: string
  _id?: string
  fullName: string
  phone?: string
  email?: string
  status: PatientStatus
  activeAlerts?: string[]
}

interface DocumentItem {
  id?: string
  _id?: string
  status: string
}

interface DashboardData {
  session: SessionResponse
  patients: PatientListItem[]
  documents: DocumentItem[]
}

const { apiFetch, hasSession } = useMedfileApi()
const router = useRouter()
const loadError = ref(false)
const searchQuery = ref('')

function goToSearch() {
  const q = searchQuery.value.trim()
  if (!q) {
    router.push('/pacientes')
    return
  }

  router.push({ path: '/pacientes', query: { q } })
}

const { data: dashboardData, pending } = await useAsyncData('dashboard', async () => {
  if (!hasSession()) {
    await navigateTo('/login')
    return null
  }

  try {
    const [session, patients, documents] = await Promise.all([
      apiFetch<SessionResponse>('/api/auth/me'),
      apiFetch<PatientListItem[]>('/api/patients'),
      apiFetch<DocumentItem[]>('/api/documents/inbox'),
    ])

    if (!session.user.emailVerified) {
      await navigateTo({
        path: '/verificar-correo',
        query: { email: session.user.email },
      })
      return null
    }

    const role = session.user.role ?? 'owner'
    if (role === 'clinical_capture') {
      await navigateTo('/cola-clinica')
      return null
    }

    return { session, patients, documents } satisfies DashboardData
  } catch {
    loadError.value = true
    return null
  }
}, { server: false })

const session = computed(() => dashboardData.value?.session ?? null)
const patients = computed(() => dashboardData.value?.patients ?? [])
const documents = computed(() => dashboardData.value?.documents ?? [])

const isLoading = computed(() => pending.value || (!dashboardData.value && !loadError.value))

const greeting = computed(() => {
  const fullName = session.value?.user.fullName?.trim()
  if (!fullName) return 'Bienvenido a Medfile'

  const hour = new Date().getHours()
  const saludo = hour < 12 ? 'Buenos dias' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  return `${saludo}, ${fullName}`
})

const clinicName = computed(() => session.value?.tenant.name ?? 'tu consulta')

const medfileCode = computed(() => session.value?.tenant.medfileCode ?? '')

const planLabel = computed(() => {
  const plan = session.value?.subscription.plan
  if (!plan) return 'Plan Gratis'
  return plan.tier === 'paid' ? `Plan ${plan.name}` : 'Plan Gratis'
})

const usageWarnings = computed(() => session.value?.subscription.usageWarnings ?? [])

function warningTitle(resource: PlanLimitResource) {
  const titles: Record<PlanLimitResource, string> = {
    patients: 'Cerca del limite de pacientes',
    uploadRequests: 'Cerca del limite de subidas',
    storage: 'Cerca del limite de almacenamiento',
    whatsappMessages: 'Cerca del limite de WhatsApp',
    users: 'Cerca del limite de usuarios',
  }
  return titles[resource]
}

const storagePercent = computed(() => {
  const storage = session.value?.subscription.usage.storage
  if (!storage?.limit) return '0%'

  const percent = Math.min(100, Math.round((storage.used / storage.limit) * 100))
  return `${percent}%`
})

const pendingDocuments = computed(
  () => documents.value.filter((document) => document.status === 'pending_review').length,
)

const sessionRole = computed(() => session.value?.user.role ?? 'owner')

const quickAccessItems = computed(() =>
  buildDoctorQuickAccess({
    pendingDocuments: pendingDocuments.value,
    role: sessionRole.value,
    capabilities: session.value?.subscription.plan.capabilities,
    usersUsed: session.value?.subscription.usage.users?.used,
    usersLimit: session.value?.subscription.usage.users?.limit,
    returnTo: '/dashboard',
  }),
)

const quickAccessSubtitle = computed(() => {
  if (sessionRole.value === 'assistant') {
    return 'Tareas administrativas de tu consultorio.'
  }
  const caps = session.value?.subscription.plan.capabilities
  if (!caps?.assistantUsers) {
    return 'Funciones de tu consulta. Los accesos con candado mejoran con plan Básico o Profesional.'
  }
  if (!caps.clinicalCaptureUsers) {
    return 'Tu equipo y consulta. Enfermería delegada requiere plan Profesional.'
  }
  return 'Funciones principales de tu consulta y equipo.'
})

const dashboardStats = computed<StatStripItem[]>(() => {
  const usage = session.value?.subscription.usage
  const criticalCount = patients.value.filter((patient) => patient.status === 'critical').length
  const followUpCount = patients.value.filter((patient) => patient.status === 'follow_up').length
  const patientUsed = usage?.patients.used ?? patients.value.length
  const patientLimit = usage?.patients.limit
  const usersUsed = usage?.users?.used
  const usersLimit = usage?.users?.limit
  const showUsers = sessionRole.value === 'owner' || sessionRole.value === 'doctor'

  const stats: StatStripItem[] = [
    {
      label: 'Pacientes',
      value: patientLimit ? `${patientUsed}/${patientLimit}` : String(patientUsed),
      badge: 'registrados',
      badgeTone: toneForUsage(patientUsed, patientLimit ?? 0),
    },
    {
      label: 'Documentos',
      value: String(documents.value.length),
      badge: pendingDocuments.value ? `${pendingDocuments.value} sin revisar` : 'al día',
      badgeTone: pendingDocuments.value ? 'warning' : 'success',
    },
    {
      label: 'Seguimiento',
      value: String(followUpCount),
      badge: criticalCount ? `${criticalCount} críticos` : 'sin alertas',
      badgeTone: criticalCount ? 'danger' : followUpCount ? 'warning' : '',
    },
  ]

  if (showUsers && usersLimit && usersLimit > 1) {
    stats.push({
      label: 'Usuarios',
      value: `${usersUsed ?? 1}/${usersLimit}`,
      badge: `plan ${session.value?.subscription.plan.name?.toLowerCase() ?? 'gratis'}`,
      badgeTone: toneForUsage(usersUsed ?? 1, usersLimit),
    })
  } else {
    stats.push({
      label: 'Almacenamiento',
      value: storagePercent.value,
      badge: `plan ${session.value?.subscription.plan.name?.toLowerCase() ?? 'gratis'}`,
      badgeTone: toneForUsage(usage?.storage.used ?? 0, usage?.storage.limit ?? 0),
    })
  }

  return stats
})

function toneForUsage(used: number, limit: number): BadgeTone {
  if (!limit) return ''
  if (used / limit >= 1) return 'danger'
  if (used / limit >= 0.8) return 'warning'
  return ''
}

const priorityPatients = computed(() =>
  [...patients.value]
    .sort((left, right) => statusPriority(left.status) - statusPriority(right.status))
    .slice(0, 4)
    .map((patient) => ({
      id: patient.id || patient._id || patient.fullName,
      initials: getInitials(patient.fullName),
      name: patient.fullName,
      detail: getPatientDetail(patient),
      status: getStatusLabel(patient.status),
      tone: getStatusTone(patient.status),
    })),
)

function statusPriority(status: PatientStatus) {
  if (status === 'critical') return 0
  if (status === 'follow_up') return 1
  if (status === 'active') return 2
  return 3
}

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function getPatientDetail(patient: PatientListItem) {
  const alerts = patient.activeAlerts?.join(' · ')
  const contact = patient.phone || patient.email
  return [alerts, contact].filter(Boolean).join(' · ') || 'Sin alertas activas'
}

function getStatusLabel(status: PatientStatus) {
  if (status === 'critical') return 'Critico'
  if (status === 'follow_up') return 'Seguimiento'
  if (status === 'archived') return 'Archivado'
  return 'Activo'
}

function getStatusTone(status: PatientStatus): BadgeTone {
  if (status === 'critical') return 'danger'
  if (status === 'follow_up') return 'warning'
  return ''
}
</script>

<style scoped>
.plan-usage-warnings {
  display: grid;
  gap: 10px;
}

.plan-usage-warning {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgb(245 158 11 / 0.35);
  background: rgb(245 158 11 / 0.1);
  color: var(--mf-slate-800);
}

.plan-usage-warning strong {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
}

.plan-usage-warning p {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.45;
}
</style>
