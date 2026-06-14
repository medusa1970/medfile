<template>
  <DoctorShell>
    <header class="app-header">
      <div>
        <EyebrowPill>Bandeja clinica</EyebrowPill>
        <h1>Documentos</h1>
        <p>Recibe, revisa y clasifica examenes, fotos y archivos enviados por pacientes.</p>
      </div>
      <MfButton variant="secondary" to="/paciente/subir">Vista demo del enlace</MfButton>
    </header>

    <section class="clinical-summary" aria-label="Resumen documentos">
      <MetricCard label="Pendientes" :value="String(documents.length)" note="revisar" tone="warning" />
      <MetricCard label="Pacientes" :value="String(patients.length)" note="activos" />
      <MetricCard label="Storage" value="0%" note="pendiente S3/R2" />
      <MetricCard label="Origen" value="Paciente" note="movil" />
    </section>

    <section class="dashboard-grid">
      <PanelCard title="Bandeja de documentos" :badge="`${documents.length} recibidos`">
        <div v-if="loadError" class="form-error patient-list-notice">
          No se pudo conectar al API. Mostrando documentos de ejemplo.
        </div>

        <DocumentList
          :documents="documents"
          :patient-names="patientNames"
          link-to-patient
          empty-message="No hay documentos pendientes de revision."
        />
      </PanelCard>

      <PanelCard title="Crear solicitud de subida" padded>
        <UploadRequestForm
          :patients="patients"
          :loading="creatingRequest"
          :error="requestError"
          :created-link="createdLink"
          @submit="createRequest"
        />
      </PanelCard>
    </section>
  </DoctorShell>
</template>

<script setup lang="ts">
import {
  normalizeDocument,
  type MedicalDocumentItem,
  type UploadRequestResult,
} from '~/utils/medical-documents'

interface PatientOption {
  id: string
  _id?: string
  fullName: string
  phone?: string
}

const { apiFetch } = useMedfileApi()
const loadError = ref(false)
const requestError = ref('')
const creatingRequest = ref(false)
const createdLink = ref('')

const fallbackDocuments: MedicalDocumentItem[] = [
  {
    id: 'doc-demo-1',
    patientId: 'demo-1',
    name: 'Hemograma completo.pdf',
    mimeType: 'application/pdf',
    documentType: 'Laboratorio',
    source: 'patient',
    status: 'pending_review',
    createdAt: '2025-01-15',
  },
  {
    id: 'doc-demo-2',
    patientId: 'demo-2',
    name: 'Foto sonografia.jpg',
    mimeType: 'image/jpeg',
    documentType: 'Imagen',
    source: 'patient',
    status: 'received',
    createdAt: '2025-01-16',
  },
]

const { data: patientsData } = await useAsyncData('documents-patients', async () => {
  try {
    return await apiFetch<PatientOption[]>('/api/patients')
  } catch {
    return [] as PatientOption[]
  }
}, { server: false })

const { data, refresh } = await useAsyncData('documents-inbox', async () => {
  try {
    return await apiFetch<MedicalDocumentItem[]>('/api/documents/inbox')
  } catch {
    loadError.value = true
    return fallbackDocuments
  }
}, { server: false })

const patients = computed(() =>
  (patientsData.value ?? []).map((patient) => ({
    id: patient.id || patient._id || '',
    fullName: patient.fullName,
    phone: patient.phone,
  })).filter((patient) => patient.id),
)

const patientNames = computed(() =>
  Object.fromEntries(patients.value.map((patient) => [patient.id, patient.fullName])),
)

const documents = computed(() => (data.value ?? fallbackDocuments).map(normalizeDocument))

async function createRequest(payload: { patientId: string; title: string; instructions: string }) {
  requestError.value = ''
  createdLink.value = ''
  creatingRequest.value = true

  try {
    const response = await apiFetch<UploadRequestResult>('/api/documents/upload-requests', {
      method: 'POST',
      body: payload,
    })

    createdLink.value = `/paciente/subir?token=${response.token}`
    await refresh()
  } catch {
    requestError.value = 'No pudimos crear la solicitud. Verifica que el API y MongoDB esten disponibles.'
  } finally {
    creatingRequest.value = false
  }
}
</script>
