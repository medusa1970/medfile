<template>
  <div class="dashboard-page patient-subpage">
    <header class="dashboard-topbar">
      <div class="dashboard-topbar__main">
        <EyebrowPill>Documentos</EyebrowPill>
        <h1 class="dashboard-topbar__title">Solicitar subida</h1>
        <p class="dashboard-topbar__lead">
          Genera un enlace para que <strong>{{ patientName }}</strong> envíe fotos o PDF desde su móvil.
        </p>
      </div>
    </header>

    <PanelCard padded class="patient-panel-compact">
      <template #header>
        <h2>Nueva solicitud</h2>
      </template>

      <UploadRequestForm
        :patient-id="patientId"
        :patient-name="patientName"
        :patient-phone="patientPhone"
        :doctor-label="doctorLabel"
        :loading="creating"
        :error="error"
        :created-link="createdLink"
        @submit="createUploadRequest"
        @reset="resetRequest"
      />
    </PanelCard>
  </div>
</template>

<script setup lang="ts">
import { type UploadRequestResult } from '~/utils/medical-documents'

definePageMeta({ layout: 'doctor', ssr: false })

const { patientId, fetchPatient, ensurePatientId } = usePatientPage()
const { apiFetch } = useMedfileApi()

const creating = ref(false)
const error = ref('')
const createdLink = ref('')

const { data: pageData } = await useAsyncData(
  () => `upload-request-page-${patientId.value}`,
  async () => {
    if (!(await ensurePatientId())) return null

    try {
      const [patient, session] = await Promise.all([
        fetchPatient(),
        apiFetch<{ user: { fullName: string }; tenant: { name: string } }>('/api/auth/me'),
      ])

      const doctor = session.user.fullName?.trim() || session.tenant.name || 'Tu médico'

      return {
        fullName: patient?.fullName ?? 'Paciente',
        phone: patient?.phone ?? '',
        doctorLabel: doctor.startsWith('Dr') ? doctor : `Dr(a). ${doctor}`,
      }
    } catch {
      error.value = 'No pudimos cargar los datos del paciente.'
      return {
        fullName: 'Paciente',
        phone: '',
        doctorLabel: 'Tu médico',
      }
    }
  },
  { server: false, watch: [patientId] },
)

const patientName = computed(() => pageData.value?.fullName ?? 'Paciente')
const patientPhone = computed(() => pageData.value?.phone ?? '')
const doctorLabel = computed(() => pageData.value?.doctorLabel ?? 'Tu médico')

function resetRequest() {
  createdLink.value = ''
  error.value = ''
}

async function createUploadRequest(payload: { patientId: string; title: string; instructions: string }) {
  error.value = ''
  createdLink.value = ''
  creating.value = true

  try {
    const response = await apiFetch<UploadRequestResult>('/api/documents/upload-requests', {
      method: 'POST',
      body: payload,
    })
    createdLink.value = `/paciente/subir?token=${response.token}`
  } catch {
    error.value = 'No pudimos crear la solicitud de subida.'
  } finally {
    creating.value = false
  }
}
</script>
