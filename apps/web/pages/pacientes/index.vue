<template>
  <div class="dashboard-page">
      <header class="dashboard-topbar dashboard-topbar--patients">
        <div class="dashboard-topbar__main">
          <EyebrowPill>Módulo clínico</EyebrowPill>
          <h1 class="dashboard-topbar__title">Pacientes</h1>
          <p class="dashboard-topbar__lead">
            {{ listSubtitle }}
          </p>
        </div>
      </header>

      <PanelCard badge="Beta" padded class="dashboard-panel dashboard-panel--patients">
        <template #header>
          <div class="dashboard-panel-heading">
            <h2>Listado de pacientes</h2>
            <p class="panel-description patients-summary-line">
              <span>{{ patients.length }} registrados</span>
              <span v-if="followUpCount">{{ followUpCount }} seguimiento</span>
              <span v-if="criticalCount" class="patients-summary-line--danger">{{ criticalCount }} críticos</span>
              <span v-if="pendingDocuments">{{ pendingDocuments }} docs pendientes</span>
            </p>
          </div>
          <SearchInput
            v-model="query"
            block
            placeholder="Buscar por nombre o teléfono"
          />
        </template>

        <div v-if="loadError" class="form-error patient-list-notice">
          No se pudo conectar al API. Mostrando pacientes de ejemplo.
        </div>

        <PatientRow
          v-for="patient in filteredPatients"
          :key="patient.id"
          :initials="getInitials(patient.fullName)"
          :name="patient.fullName"
          :detail="getPatientDetail(patient)"
          :status="getStatusLabel(patient.status)"
          :tone="getStatusTone(patient.status)"
          :to="`/pacientes/${patient.id}`"
        />
      </PanelCard>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'doctor', ssr: false })
type PatientStatus = 'active' | 'follow_up' | 'critical' | 'archived'
type BadgeTone = '' | 'warning' | 'danger' | 'success'

interface PatientListItem {
  id?: string
  _id?: string
  fullName: string
  phone?: string
  email?: string
  status: PatientStatus
  activeAlerts?: string[]
}

const route = useRoute()
const { apiFetch } = useMedfileApi()
const query = ref(String(route.query.q || ''))

watch(
  () => route.query.q,
  (value) => {
    query.value = String(value || '')
  },
)
const loadError = ref(false)
const pendingDocuments = ref(0)
const sessionRole = ref('owner')

const listSubtitle = computed(() =>
  sessionRole.value === 'clinical_capture'
    ? 'Pacientes en tu cola autorizada de hoy.'
    : 'Archivo médico de tu consulta.',
)

onMounted(async () => {
  try {
    const me = await apiFetch<{ user: { role?: string } }>('/api/auth/me')
    sessionRole.value = me.user.role ?? 'owner'
  } catch {
    sessionRole.value = 'owner'
  }
})

const fallbackPatients: PatientListItem[] = [
  {
    id: 'demo-1',
    fullName: 'Ana Martinez Soto',
    phone: '+1 (809) 555-0301',
    status: 'critical',
    activeAlerts: ['HbA1c elevada'],
  },
  {
    id: 'demo-2',
    fullName: 'Maria Garcia Lopez',
    phone: '+1 (809) 555-0101',
    status: 'follow_up',
    activeAlerts: ['Perfil lipidico pendiente'],
  },
  {
    id: 'demo-3',
    fullName: 'Carlos Rodriguez Perez',
    email: 'carlos@example.com',
    status: 'active',
  },
]

const { data } = await useAsyncData('patients', async () => {
  try {
    const [patients, documents] = await Promise.all([
      apiFetch<PatientListItem[]>('/api/patients'),
      apiFetch<{ status: string }[]>('/api/documents/inbox').catch(() => []),
    ])
    pendingDocuments.value = documents.filter((doc) => doc.status === 'pending_review').length
    return patients
  } catch {
    loadError.value = true
    pendingDocuments.value = 4
    return fallbackPatients
  }
}, { server: false })

const patients = computed(() =>
  (data.value ?? fallbackPatients).map((patient) => ({
    ...patient,
    id: resolveApiId(patient),
  })),
)
const followUpCount = computed(() => patients.value.filter((patient) => patient.status === 'follow_up').length)
const criticalCount = computed(() => patients.value.filter((patient) => patient.status === 'critical').length)

const filteredPatients = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()
  if (!normalizedQuery) return patients.value

  return patients.value.filter((patient) =>
    [patient.fullName, patient.phone, patient.email]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedQuery)),
  )
})

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getPatientDetail(patient: PatientListItem) {
  const contact = patient.phone || patient.email || 'Sin contacto registrado'
  const alert = patient.activeAlerts?.[0]
  return alert ? `${contact} · ${alert}` : contact
}

function getStatusLabel(status: PatientStatus) {
  const labels: Record<PatientStatus, string> = {
    active: 'Activo',
    follow_up: 'Seguimiento',
    critical: 'Critico',
    archived: 'Archivado',
  }

  return labels[status]
}

function getStatusTone(status: PatientStatus): BadgeTone {
  if (status === 'critical') return 'danger'
  if (status === 'follow_up') return 'warning'
  return ''
}
</script>

<style scoped>
.patient-list-notice {
  margin: 0 14px 8px;
  font-size: 13px;
}

.dashboard-panel :deep(.panel-header) {
  padding: 14px 16px;
}

.dashboard-panel :deep(.panel-header h2) {
  font-size: 16px;
}

.dashboard-panel :deep(.patient-row) {
  padding: 10px 14px;
}

.patients-summary-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 4px;
  color: var(--mf-slate-600);
  font-size: 13px;
  line-height: 1.4;
}

.patients-summary-line span:not(:first-child)::before {
  content: '·';
  margin-right: 10px;
  color: var(--mf-slate-400);
}

.patients-summary-line--danger {
  color: var(--mf-danger-700, #b91c1c);
  font-weight: 700;
}
</style>
