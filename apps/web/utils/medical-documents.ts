export type DocumentStatus = 'received' | 'pending_review' | 'classified' | 'linked' | 'archived'
export type DocumentBadgeTone = '' | 'warning' | 'danger' | 'success'

export interface MedicalDocumentItem {
  id: string
  _id?: string
  patientId: string
  name: string
  mimeType: string
  documentType?: string
  source: 'doctor' | 'assistant' | 'patient'
  status: DocumentStatus
  createdAt?: string
}

export interface UploadRequestResult {
  id?: string
  token: string
}

export function normalizeDocument(input: MedicalDocumentItem): MedicalDocumentItem {
  return {
    ...input,
    id: input.id || input._id || input.name,
  }
}

export function getDocumentTypeInitials(document: MedicalDocumentItem) {
  if (document.mimeType.includes('pdf')) return 'PDF'
  if (document.mimeType.includes('image')) return 'IMG'
  return 'DOC'
}

export function getDocumentDetail(document: MedicalDocumentItem, patientLabel?: string) {
  const type = document.documentType || 'Sin clasificar'
  const source = document.source === 'patient' ? 'Paciente' : 'Medico'
  const parts = [type, source]
  if (patientLabel) parts.push(patientLabel)
  return parts.join(' · ')
}

export function getDocumentStatusLabel(status: DocumentStatus) {
  const labels: Record<DocumentStatus, string> = {
    received: 'Recibido',
    pending_review: 'Revisar',
    classified: 'Clasificado',
    linked: 'Vinculado',
    archived: 'Archivado',
  }

  return labels[status]
}

export function getDocumentStatusTone(status: DocumentStatus): DocumentBadgeTone {
  if (status === 'pending_review' || status === 'received') return 'warning'
  if (status === 'classified' || status === 'linked') return 'success'
  return ''
}

export function formatDocumentDate(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
