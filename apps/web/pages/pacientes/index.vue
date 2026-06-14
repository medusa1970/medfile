<template>
  <DoctorShell>
    <header class="app-header">
      <div>
        <EyebrowPill>Modulo clinico</EyebrowPill>
        <h1>Pacientes</h1>
        <p>Gestiona el archivo medico de cada paciente de tu consulta.</p>
      </div>
      <MfButton to="/pacientes/nuevo">Nuevo paciente</MfButton>
    </header>

    <section class="clinical-summary" aria-label="Resumen de pacientes">
      <MetricCard label="Registrados" :value="String(patients.length)" note="tenant actual" />
      <MetricCard label="Seguimiento" :value="String(followUpCount)" note="revisar" tone="warning" />
      <MetricCard label="Criticos" :value="String(criticalCount)" note="prioridad" tone="danger" />
      <MetricCard label="Documentos" value="4" note="pendientes" />
    </section>

    <PanelCard title="Listado de pacientes" badge="Beta">
      <template #header>
        <div>
          <h2>Listado de pacientes</h2>
          <p class="panel-description">Datos cargados desde API cuando el backend esta disponible.</p>
        </div>
        <input v-model="query" class="search-input" type="search" placeholder="Buscar por nombre o telefono" />
      </template>

      <div v-if="loadError" class="form-error patient-list-notice">
        No se pudo conectar al API. Mostrando pacientes de ejemplo para mantener el flujo visual.
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
    return await apiFetch<PatientListItem[]>('/api/patients')
  } catch {
    loadError.value = true
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
