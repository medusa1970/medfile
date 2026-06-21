<template>
  <div class="document-list" :class="{ 'document-list--compact': compact }">
    <p v-if="error" class="form-error patient-list-notice">{{ error }}</p>
    <p v-else-if="documents.length === 0" class="panel-empty panel-empty--compact">{{ emptyMessage }}</p>

    <article
      v-for="document in documents"
      :key="document.id"
      class="document-list-row"
    >
      <template v-if="compact">
        <div class="document-item">
          <div class="document-item__main">
            <span class="avatar document-item__avatar">{{ getDocumentTypeInitials(document) }}</span>
            <div class="document-item__body">
              <div class="document-item__title-row">
                <strong class="document-item__name">{{ document.name }}</strong>
                <StatusBadge :tone="getDocumentStatusTone(document.status)">
                  {{ getDocumentStatusLabel(document.status) }}
                </StatusBadge>
              </div>
              <span class="document-item__meta">{{ getRowDetail(document) }}</span>
            </div>
          </div>

          <div class="document-list-actions document-list-actions--inline">
            <MfButton
              type="button"
              variant="secondary"
              :disabled="busyId === document.id"
              @click="viewDocument(document)"
            >
              {{ busyId === document.id && viewerOpen ? 'Abriendo…' : 'Ver' }}
            </MfButton>
            <MfButton
              type="button"
              variant="secondary"
              :disabled="busyId === document.id"
              @click="downloadFile(document)"
            >
              {{ busyId === document.id && !viewerOpen ? '…' : 'Descargar' }}
            </MfButton>
          </div>
        </div>
      </template>

      <template v-else>
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
      </template>
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
    compact?: boolean
  }>(),
  {
    patientName: '',
    patientNames: () => ({}),
    error: '',
    emptyMessage: 'Aun no hay documentos para este paciente.',
    linkToPatient: false,
    showDate: true,
    compact: false,
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

.document-list--compact .document-list-row {
  padding-bottom: 10px;
}

.document-item {
  display: grid;
  gap: 10px;
}

.document-item__main {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  min-width: 0;
}

.document-item__avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 11px;
}

.document-item__body {
  flex: 1;
  min-width: 0;
}

.document-item__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.document-item__name {
  overflow: hidden;
  color: var(--mf-navy-900);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-item__meta {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: var(--mf-slate-500);
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-list-actions--inline {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.document-list-actions--inline :deep(.btn) {
  min-height: 40px;
  padding: 0 12px;
  font-size: 14px;
}
</style>
