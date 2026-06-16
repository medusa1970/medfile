import {
  isDocumentAccessible,
  type DocumentAccessResponse,
} from '~/utils/document-access'
import type { MedicalDocumentItem } from '~/utils/medical-documents'

export function useDocumentViewer() {
  const { apiFetch } = useMedfileApi()

  const viewerOpen = ref(false)
  const viewerLoading = ref(false)
  const viewerError = ref('')
  const activeDocument = ref<MedicalDocumentItem | null>(null)
  const activeAccess = ref<Extract<DocumentAccessResponse, { available: true }> | null>(null)

  async function loadDocumentAccess(document: MedicalDocumentItem) {
    viewerError.value = ''
    viewerLoading.value = true
    activeDocument.value = document
    activeAccess.value = null
    viewerOpen.value = true

    try {
      const response = await apiFetch<DocumentAccessResponse>(
        `/api/documents/${document.id}/download-url`,
      )

      if (!isDocumentAccessible(response)) {
        viewerError.value =
          response.message ||
          'Este documento no tiene archivo almacenado. Configura S3/R2 y vuelve a subirlo.'
        return
      }

      activeAccess.value = response
    } catch {
      viewerError.value = 'No pudimos cargar el archivo. Intenta de nuevo.'
    } finally {
      viewerLoading.value = false
    }
  }

  async function downloadDocument(document: MedicalDocumentItem) {
    viewerError.value = ''

    try {
      const response = await apiFetch<DocumentAccessResponse>(
        `/api/documents/${document.id}/download-url`,
      )

      if (!isDocumentAccessible(response)) {
        viewerError.value =
          response.message ||
          'Este documento no tiene archivo almacenado. Configura S3/R2 y vuelve a subirlo.'
        return
      }

      triggerBrowserDownload(response.downloadUrl, response.fileName)
    } catch {
      viewerError.value = 'No pudimos descargar el archivo. Intenta de nuevo.'
    }
  }

  function closeViewer() {
    viewerOpen.value = false
    viewerLoading.value = false
    viewerError.value = ''
    activeDocument.value = null
    activeAccess.value = null
  }

  function triggerBrowserDownload(url: string, fileName: string) {
    if (!import.meta.client) return

    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.rel = 'noopener noreferrer'
    anchor.target = '_blank'
    window.document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  return {
    viewerOpen,
    viewerLoading,
    viewerError,
    activeDocument,
    activeAccess,
    loadDocumentAccess,
    downloadDocument,
    closeViewer,
    triggerBrowserDownload,
  }
}
