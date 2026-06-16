<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="document-viewer"
      role="dialog"
      aria-modal="true"
      :aria-label="document?.name || 'Visor de documento'"
      @click.self="emit('close')"
    >
      <div class="document-viewer__panel">
        <header class="document-viewer__header">
          <div class="document-viewer__title-wrap">
            <EyebrowPill>Documento clinico</EyebrowPill>
            <h2 class="document-viewer__title">{{ document?.name || 'Archivo' }}</h2>
          </div>

          <div class="document-viewer__actions">
            <MfButton
              v-if="access"
              type="button"
              variant="secondary"
              @click="emit('download')"
            >
              Descargar
            </MfButton>
            <MfButton
              v-if="access"
              type="button"
              variant="secondary"
              @click="openInNewTab"
            >
              Nueva pestaña
            </MfButton>
            <button type="button" class="document-viewer__close" aria-label="Cerrar" @click="emit('close')">
              ×
            </button>
          </div>
        </header>

        <div class="document-viewer__body">
          <p v-if="loading" class="document-viewer__status">Cargando archivo…</p>
          <p v-else-if="error" class="form-error document-viewer__status">{{ error }}</p>

          <img
            v-else-if="access && isImageMimeType(access.mimeType)"
            :src="access.viewUrl"
            :alt="document?.name || 'Imagen medica'"
            class="document-viewer__image"
          />

          <iframe
            v-else-if="access && isPdfMimeType(access.mimeType)"
            :src="access.viewUrl"
            :title="document?.name || 'PDF medico'"
            class="document-viewer__frame"
          ></iframe>

          <div v-else-if="access" class="document-viewer__fallback">
            <p>Este tipo de archivo no se puede previsualizar aqui.</p>
            <MfButton type="button" @click="emit('download')">Descargar archivo</MfButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { isImageMimeType, isPdfMimeType } from '~/utils/document-access'
import type { DocumentAccessResponse } from '~/utils/document-access'
import type { MedicalDocumentItem } from '~/utils/medical-documents'

const props = defineProps<{
  open: boolean
  loading: boolean
  error: string
  document: MedicalDocumentItem | null
  access: Extract<DocumentAccessResponse, { available: true }> | null
}>()

const emit = defineEmits<{
  close: []
  download: []
}>()

function openInNewTab() {
  if (!props.access?.viewUrl || !import.meta.client) return
  window.open(props.access.viewUrl, '_blank', 'noopener,noreferrer')
}
</script>
