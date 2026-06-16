<template>
  <div class="document-list">
    <p v-if="error" class="form-error patient-list-notice">{{ error }}</p>
    <p v-else-if="documents.length === 0" class="panel-empty">{{ emptyMessage }}</p>

    <article
      v-for="document in documents"
      :key="document.id"
      class="document-list-row"
    >
      <PatientRow
        :initials="getDocumentTypeInitials(document)"
        :name="document.name"
        :detail="getRowDetail(document)"
        :status="getDocumentStatusLabel(document.status)"
        :tone="getDocumentStatusTone(document.status)"
        :to="linkToPatient ? `/pacientes/${document.patientId}` : undefined"
      />

      <div class="document-list-actions">
        <MfButton
          type="button"
          :disabled="busyId === document.id"
          @click="viewDocument(document)"
        >
          {{ busyId === document.id && viewerOpen ? 'Abriendo…' : 'Ver pantalla completa' }}
        </MfButton>
        <MfButton
          type="button"
          variant="secondary"
          :disabled="busyId === document.id"
          @click="downloadFile(document)"
        >
          {{ busyId === document.id && !viewerOpen ? 'Preparando…' : 'Descargar' }}
        </MfButton>
      </div>
    </article>

    <p v-if="listError" class="form-error patient-list-notice">{{ listError }}</p>

    <DocumentViewerModal
      :open="viewerOpen"
      :loading="viewerLoading"
      :error="viewerError"
      :document="activeDocument"
      :access="activeAccess"
      @close="closeViewer"
      @download="downloadActive"
    />
  </div>
</template>

<script setup lang="ts">
import {
  getDocumentDetail,
  getDocumentStatusLabel,
  getDocumentStatusTone,
  getDocumentTypeInitials,
  formatDocumentDate,
  type MedicalDocumentItem,
} from '~/utils/medical-documents'

const props = withDefaults(
  defineProps<{
    documents: MedicalDocumentItem[]
    patientName?: string
    patientNames?: Record<string, string>
    error?: string
    emptyMessage?: string
    linkToPatient?: boolean
    showDate?: boolean
  }>(),
  {
    patientName: '',
    patientNames: () => ({}),
    error: '',
    emptyMessage: 'Aun no hay documentos para este paciente.',
    linkToPatient: false,
    showDate: true,
  },
)

const {
  viewerOpen,
  viewerLoading,
  viewerError,
  activeDocument,
  activeAccess,
  loadDocumentAccess,
  downloadDocument,
  closeViewer,
  triggerBrowserDownload,
} = useDocumentViewer()

const busyId = ref('')
const listError = ref('')

function getRowDetail(document: MedicalDocumentItem) {
  const patientLabel = props.patientName || props.patientNames[document.patientId]
  const base = getDocumentDetail(document, patientLabel)
  const date = props.showDate && document.createdAt ? formatDocumentDate(document.createdAt) : ''
  return [base, date].filter(Boolean).join(' · ')
}

async function viewDocument(document: MedicalDocumentItem) {
  listError.value = ''
  busyId.value = document.id
  await loadDocumentAccess(document)
  busyId.value = ''
}

async function downloadFile(document: MedicalDocumentItem) {
  listError.value = ''
  busyId.value = document.id
  await downloadDocument(document)
  if (viewerError.value) {
    listError.value = viewerError.value
    viewerError.value = ''
  }
  busyId.value = ''
}

function downloadActive() {
  if (!activeAccess.value) return
  triggerBrowserDownload(activeAccess.value.downloadUrl, activeAccess.value.fileName)
}
</script>

<style scoped>
.document-list-row {
  display: grid;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--mf-slate-100);
}

.document-list-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.document-list-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
