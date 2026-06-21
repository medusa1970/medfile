<template>
  <div class="dashboard-page patient-subpage">
    <header class="dashboard-topbar">
      <div class="dashboard-topbar__main">
        <EyebrowPill>Historia clínica</EyebrowPill>
        <h1 class="dashboard-topbar__title">Antecedentes médicos</h1>
        <p class="dashboard-topbar__lead">{{ patientName }}</p>
      </div>
    </header>

    <PanelCard title="Antecedentes personales y familiares" padded class="patient-panel-compact">
      <p v-if="pending" class="panel-empty panel-empty--compact">Cargando antecedentes…</p>

      <PatientBackgroundForm
        v-else
        compact
        :model-value="medicalBackground"
        :loading="saving"
        :saved="saved"
        :error="error"
        @submit="saveBackground"
      />
    </PanelCard>
  </div>
</template>

<script setup lang="ts">
import type { PatientMedicalBackground } from '@medfile/types'

definePageMeta({ layout: 'doctor', ssr: false })

const { patientId, routes, fetchPatient, refreshPatientCaches } = usePatientPage()
const router = useRouter()
const { apiFetch } = useMedfileApi()

const saving = ref(false)
const saved = ref(false)
const error = ref('')

const { data: patientRecord, pending } = await useAsyncData(
  () => `patient-background-${patientId.value}`,
  async () => {
    try {
      const patient = await fetchPatient()
      return {
        fullName: patient?.fullName ?? 'Paciente',
        medicalBackground: patient?.medicalBackground ?? {},
      }
    } catch {
      error.value = 'No pudimos cargar los antecedentes.'
      return {
        fullName: 'Paciente',
        medicalBackground: {} as PatientMedicalBackground,
      }
    }
  },
  { server: false, watch: [patientId] },
)

const patientName = computed(() => patientRecord.value?.fullName ?? 'Paciente')
const medicalBackground = computed(() => patientRecord.value?.medicalBackground ?? {})

async function saveBackground(background: PatientMedicalBackground) {
  error.value = ''
  saved.value = false
  saving.value = true

  try {
    const updated = await apiFetch<{ medicalBackground?: PatientMedicalBackground }>(
      `/api/patients/${patientId.value}`,
      {
        method: 'PATCH',
        body: { medicalBackground: background },
      },
    )

    if (patientRecord.value) {
      patientRecord.value.medicalBackground =
        updated.medicalBackground ?? background
    }

    await refreshPatientCaches()
    saved.value = true
    setTimeout(() => router.push(routes.value.profile), 800)
  } catch (err) {
    error.value = getBackgroundSaveErrorMessage(err)
  } finally {
    saving.value = false
  }
}

function getBackgroundSaveErrorMessage(err: unknown) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (typeof data?.message === 'string') return data.message
  }

  return 'No pudimos guardar los antecedentes. Verifica los datos e intenta nuevamente.'
}
</script>
