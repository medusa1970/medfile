<template>
  <main class="page-shell">
    <section v-if="isRealPatientLink" class="patient-upload-page">
      <header class="patient-upload-page__header">
        <BrandLogo compact />
        <StatusBadge>Enlace seguro</StatusBadge>
      </header>

      <div v-if="loadingRequest" class="patient-upload-page__body">
        <p class="panel-empty">Cargando solicitud…</p>
      </div>

      <div v-else-if="requestError" class="patient-upload-page__body">
        <div class="patient-upload-alert patient-upload-alert--error">
          <strong>Enlace no válido</strong>
          <p>{{ requestError }}</p>
        </div>
      </div>

      <div v-else-if="uploadRequest.status === 'completed'" class="patient-upload-page__body">
        <div class="patient-upload-alert patient-upload-alert--success">
          <strong>Documento enviado</strong>
          <p>Gracias. Tu médico ya recibió el archivo y lo revisará pronto.</p>
        </div>
      </div>

      <div v-else-if="uploadRequest.status !== 'open' || isExpired" class="patient-upload-page__body">
        <div class="patient-upload-alert patient-upload-alert--error">
          <strong>Enlace no disponible</strong>
          <p>
            {{
              isExpired
                ? 'Este enlace expiró. Pide a tu médico que genere uno nuevo.'
                : 'Esta solicitud ya no acepta archivos.'
            }}
          </p>
        </div>
      </div>

      <div v-else-if="successMessage" class="patient-upload-page__body">
        <div class="patient-upload-alert patient-upload-alert--success">
          <strong>¡Listo!</strong>
          <p>{{ successMessage }}</p>
        </div>
      </div>

      <div v-else class="patient-upload-page__body">
        <h1 class="patient-upload-page__title">{{ uploadRequest.title }}</h1>
        <p class="patient-upload-page__copy">
          {{ uploadRequest.instructions || 'Toma una foto con tu cámara o elige un archivo de tu galería.' }}
        </p>

        <div class="patient-upload-picker">
          <label class="patient-upload-picker__option" for="file-upload-camera">
            <span class="patient-upload-picker__icon" aria-hidden="true">
              <MedIcon name="mobile" size="sm" />
            </span>
            <span class="patient-upload-picker__text">
              <strong>Tomar foto</strong>
              <small>Abre la cámara del móvil</small>
            </span>
          </label>
          <input
            id="file-upload-camera"
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            @change="handleFileChange"
          />

          <label class="patient-upload-picker__option" for="file-upload-gallery">
            <span class="patient-upload-picker__icon patient-upload-picker__icon--muted" aria-hidden="true">
              <MedIcon name="folder" size="sm" />
            </span>
            <span class="patient-upload-picker__text">
              <strong>Elegir archivo</strong>
              <small>Fotos (JPG, PNG, HEIC) o PDF</small>
            </span>
          </label>
          <input
            id="file-upload-gallery"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*,application/pdf,.pdf"
            hidden
            @change="handleFileChange"
          />
        </div>

        <figure v-if="previewUrl" class="patient-upload-preview">
          <img :src="previewUrl" alt="Vista previa del archivo seleccionado" />
        </figure>

        <p v-if="selectedFile" class="selected-file-name">
          {{ selectedFile.name }} · {{ formatFileSize(selectedFile.size) }}
        </p>

        <div v-if="errorMessage" class="form-error patient-upload-page__feedback">{{ errorMessage }}</div>

        <MfButton block class="patient-upload-page__submit" :disabled="!selectedFile || submitting" @click="completeUpload">
          {{ submitting ? 'Enviando…' : 'Enviar documento' }}
        </MfButton>

        <p v-if="expiresLabel" class="patient-upload-page__meta">{{ expiresLabel }}</p>
      </div>
    </section>

    <div v-else class="doctor-upload-demo">
      <MarketingNav />

      <section class="container hero hero-patient-upload">
        <div>
          <EyebrowPill>Función para tu consultorio</EyebrowPill>
          <h1>Tus pacientes te envían exámenes desde el móvil</h1>
          <p class="hero-copy">
            Tú generas un enlace seguro desde Medfile. Tu paciente lo abre, toma una foto o
            sube un PDF — y el documento llega directo a tu bandeja clínica. Sin apps extra
            para ellos, sin perseguir papeles.
          </p>

          <ol class="doctor-upload-steps">
            <li v-for="step in doctorSteps" :key="step.title">
              <span class="doctor-upload-step-icon" aria-hidden="true">
                <MedIcon :name="step.icon" size="sm" />
              </span>
              <div>
                <strong>{{ step.title }}</strong>
                <span>{{ step.detail }}</span>
              </div>
            </li>
          </ol>

          <div class="hero-actions">
            <MfButton to="/registro">Probar en mi consultorio</MfButton>
            <MfButton variant="secondary" to="/login">Ya tengo cuenta</MfButton>
          </div>

          <div class="trust-row trust-row--demo">
            <InfoCard
              v-for="item in doctorTrustItems"
              :key="item.value"
              :icon="item.icon"
              :value="item.value"
              :label="item.label"
            />
          </div>
        </div>

        <aside class="patient-preview-aside" aria-label="Vista previa de lo que ve el paciente">
          <p class="patient-preview-label">
            <MedIcon name="mobile" size="sm" />
            Así lo ve tu paciente
          </p>
          <div class="mobile-frame mobile-frame--demo">
            <div class="mobile-screen">
              <div class="mobile-screen-content">
                <StatusBadge>Solicitud de Dra. Rivas</StatusBadge>
                <h2 class="mobile-title">Subir exámenes</h2>
                <p class="mobile-copy">Foto o archivo PDF desde el teléfono.</p>
                <div class="patient-upload-picker patient-upload-picker--demo">
                  <div class="patient-upload-picker__option">
                    <strong>Tomar foto</strong>
                  </div>
                  <div class="patient-upload-picker__option">
                    <strong>Elegir archivo</strong>
                  </div>
                </div>
                <MfButton block class="mobile-action mobile-action--demo" disabled>
                  Enviar documento
                </MfButton>
              </div>
            </div>
          </div>
          <p class="patient-preview-note">
            Vista de ejemplo. El enlace real lo creas tú desde Pacientes o Documentos.
          </p>
        </aside>
      </section>

      <MarketingFooter />
    </div>
  </main>
</template>

<script setup lang="ts">
import type { MedIconName } from '~/components/ui/MedIcon.vue'
import { resolvePublicApiUrl } from '~/utils/public-api-url'

interface UploadRequest {
  token: string
  title: string
  instructions?: string
  status: 'open' | 'completed' | 'expired' | 'cancelled'
  expiresAt?: string
}

interface UploadUrlResponse {
  mode: 'mock' | 'presigned'
  method: 'PUT'
  uploadUrl: string
  storageKey: string
  headers: Record<string, string>
  expiresInSeconds: number
}

const route = useRoute()
const config = useRuntimeConfig()
const token = computed(() => String(route.query.token || ''))
const isRealPatientLink = computed(() => token.value.length > 0 && token.value !== 'demo-token')

const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const requestError = ref('')
const loadingRequest = ref(false)

const doctorSteps: { icon: MedIconName; title: string; detail: string }[] = [
  {
    icon: 'clipboard',
    title: 'Generas el enlace',
    detail: 'Desde el perfil del paciente o la bandeja de documentos.',
  },
  {
    icon: 'mobile',
    title: 'El paciente sube',
    detail: 'Abre el enlace, toma foto o adjunta PDF. Sin registrarse.',
  },
  {
    icon: 'folder',
    title: 'Tú revisas en Medfile',
    detail: 'El examen aparece en tu bandeja, listo para clasificar.',
  },
]

const doctorTrustItems: { icon: MedIconName; value: string; label: string }[] = [
  { icon: 'lock', value: 'Enlace privado', label: 'solo para ese paciente' },
  { icon: 'clock', value: 'Con vencimiento', label: 'tú controlas el tiempo' },
  { icon: 'shield', value: 'A tu consultorio', label: 'no a un chat genérico' },
]

const uploadRequest = ref<UploadRequest>({
  token: '',
  title: 'Subir documento',
  instructions: '',
  status: 'open',
})

const apiBaseUrl = computed(() => resolvePublicApiUrl(config.public.apiUrl as string))

const isExpired = computed(() => {
  if (!uploadRequest.value.expiresAt) return false
  return new Date() > new Date(uploadRequest.value.expiresAt)
})

const expiresLabel = computed(() => {
  if (!uploadRequest.value.expiresAt) return ''
  return `Válido hasta ${new Date(uploadRequest.value.expiresAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`
})

useHead({
  title: isRealPatientLink.value
    ? 'Subir documento | Medfile'
    : 'Exámenes por enlace | Medfile para médicos',
})

onMounted(() => {
  if (isRealPatientLink.value) loadUploadRequest()
})

watch(token, () => {
  if (isRealPatientLink.value) loadUploadRequest()
})

onBeforeUnmount(() => {
  revokePreview()
})

async function loadUploadRequest() {
  loadingRequest.value = true
  requestError.value = ''
  successMessage.value = ''
  clearSelectedFile()

  try {
    uploadRequest.value = await $fetch<UploadRequest>(
      `${apiBaseUrl.value}/api/documents/upload-requests/${token.value}`,
    )
  } catch {
    requestError.value = 'No encontramos esta solicitud. Verifica que el enlace esté completo.'
    uploadRequest.value = {
      token: token.value,
      title: 'Subir documento',
      status: 'expired',
    }
  } finally {
    loadingRequest.value = false
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  setSelectedFile(file)
  input.value = ''
}

function setSelectedFile(file: File | null) {
  revokePreview()
  selectedFile.value = file
  errorMessage.value = ''

  if (file?.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file)
  }
}

function clearSelectedFile() {
  setSelectedFile(null)
}

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getApiErrorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object') {
    if ('data' in err) {
      const data = (err as { data?: { message?: string | string[] } }).data
      if (Array.isArray(data?.message)) return data.message.join(', ')
      if (typeof data?.message === 'string') return data.message
    }
    if ('statusMessage' in err && typeof (err as { statusMessage?: string }).statusMessage === 'string') {
      return (err as { statusMessage: string }).statusMessage
    }
  }
  return fallback
}

async function completeUpload() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!selectedFile.value) {
    errorMessage.value = 'Selecciona una foto o archivo antes de enviar.'
    return
  }

  submitting.value = true

  try {
    let storageKey = `demo/${selectedFile.value.name}`

    const uploadUrl = await $fetch<UploadUrlResponse>(
      `${apiBaseUrl.value}/api/documents/upload-requests/${token.value}/upload-url`,
      {
        method: 'POST',
        body: {
          fileName: selectedFile.value.name,
          mimeType: selectedFile.value.type || 'application/octet-stream',
        },
      },
    )

    storageKey = uploadUrl.storageKey

    if (uploadUrl.mode === 'presigned') {
      const uploadResponse = await fetch(uploadUrl.uploadUrl, {
        method: uploadUrl.method,
        body: selectedFile.value,
        headers: uploadUrl.headers,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Storage upload failed (${uploadResponse.status})`)
      }
    }

    await $fetch(`${apiBaseUrl.value}/api/documents/upload-requests/${token.value}/complete`, {
      method: 'POST',
      body: {
        fileName: selectedFile.value.name,
        mimeType: selectedFile.value.type || 'application/octet-stream',
        fileSizeBytes: selectedFile.value.size,
        storageKey,
        documentType: 'Examen',
        notes:
          uploadUrl.mode === 'mock'
            ? 'Subida registrada en modo mock (sin binario en storage).'
            : 'Subida directa a storage completada.',
      },
    })

    clearSelectedFile()
    successMessage.value = 'Documento enviado. Tu médico lo revisará pronto.'
    uploadRequest.value = { ...uploadRequest.value, status: 'completed' }
  } catch (err) {
    console.error('[Medfile upload]', err)
    errorMessage.value = getApiErrorMessage(
      err,
      'No pudimos enviar el documento. Revisa tu conexión e intenta de nuevo.',
    )
  } finally {
    submitting.value = false
  }
}
</script>
