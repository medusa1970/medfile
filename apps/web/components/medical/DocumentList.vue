<template>
  <div class="document-list">
    <p v-if="error" class="form-error patient-list-notice">{{ error }}</p>
    <p v-else-if="documents.length === 0" class="panel-empty">{{ emptyMessage }}</p>

    <PatientRow
      v-for="document in documents"
      :key="document.id"
      :initials="getDocumentTypeInitials(document)"
      :name="document.name"
      :detail="getRowDetail(document)"
      :status="getDocumentStatusLabel(document.status)"
      :tone="getDocumentStatusTone(document.status)"
      :to="linkToPatient ? `/pacientes/${document.patientId}` : undefined"
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

function getRowDetail(document: MedicalDocumentItem) {
  const patientLabel = props.patientName || props.patientNames[document.patientId]
  const base = getDocumentDetail(document, patientLabel)
  const date = props.showDate && document.createdAt ? formatDocumentDate(document.createdAt) : ''
  return [base, date].filter(Boolean).join(' · ')
}
</script>
