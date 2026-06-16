<template>
  <DoctorShell>
    <div class="dashboard-page">
      <header class="dashboard-topbar">
        <div class="dashboard-topbar__main">
          <EyebrowPill>Módulo clínico</EyebrowPill>
          <h1 class="dashboard-topbar__title">Pacientes</h1>
          <p class="dashboard-topbar__lead">Archivo médico de tu consulta.</p>
        </div>
        <MfButton to="/pacientes/nuevo">Nuevo paciente</MfButton>
      </header>

      <section class="metric-grid metric-grid--dashboard" aria-label="Resumen de pacientes">
        <MetricCard label="Registrados" :value="String(patients.length)" note="tenant actual" />
        <MetricCard label="Seguimiento" :value="String(followUpCount)" note="revisar" tone="warning" />
        <MetricCard label="Críticos" :value="String(criticalCount)" note="prioridad" tone="danger" />
        <MetricCard label="Documentos" :value="String(pendingDocuments)" note="pendientes" />
      </section>

      <PanelCard badge="Beta" padded class="dashboard-panel">
        <template #header>
          <div class="dashboard-panel-heading">
            <h2>Listado de pacientes</h2>
            <p class="panel-description">Busca por nombre o teléfono.</p>
          </div>
          <input v-model="query" class="search-input search-input--dashboard" type="search" placeholder="Buscar…" />
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
  </DoctorShell>
</template>

<script setup lang="ts">
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

const { apiFetch } = useMedfileApi()
const query = ref('')
const loadError = ref(false)
const pendingDocuments = ref(0)

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
</style>
