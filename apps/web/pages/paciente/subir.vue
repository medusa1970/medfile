<template>
  <main class="page-shell">
    <!-- Enlace real: solo el paciente sube, sin marketing -->
    <section v-if="isRealPatientLink" class="patient-upload-only">
      <div class="patient-upload-header">
        <BrandLogo />
        <StatusBadge>Enlace seguro</StatusBadge>
      </div>

      <div class="mobile-frame mobile-frame--patient">
        <div class="mobile-screen">
          <div class="mobile-screen-content">
            <h1 class="mobile-title">{{ uploadRequest.title }}</h1>
            <p class="mobile-copy">
              {{ uploadRequest.instructions || 'Toma una foto o elige un archivo de tu galería.' }}
            </p>

            <UploadZone
              title="Tomar foto o elegir archivo"
              description="JPG, PNG, HEIC o PDF."
              as-label
              for-id="file-upload"
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*,.pdf"
                capture="environment"
                hidden
                @change="handleFileChange"
              />
            </UploadZone>

            <p v-if="selectedFile" class="selected-file-name">
              Archivo: {{ selectedFile.name }}
            </p>
            <div v-if="successMessage" class="form-success mobile-action">{{ successMessage }}</div>
            <div v-if="errorMessage" class="form-error mobile-action">{{ errorMessage }}</div>

            <MfButton block class="mobile-action" @click="completeUpload">
              {{ submitting ? 'Enviando…' : 'Enviar documento' }}
            </MfButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo / sin token: explica la función al médico -->
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
                <UploadZone
                  title="Tomar foto o elegir archivo"
                  description="JPG, PNG, HEIC o PDF."
                />
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

interface UploadRequest {
  token: string
  title: string
  instructions?: string
  status: 'open' | 'completed' | 'expired' | 'cancelled'
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

const fallbackRequest: UploadRequest = {
  token: 'demo-token',
  title: 'Subir exámenes',
  instructions: 'Puedes tomar una foto o seleccionar un archivo guardado.',
  status: 'open',
}

const { data } = await useAsyncData(`upload-request-${token.value || 'demo'}`, async () => {
  if (!isRealPatientLink.value) return fallbackRequest

  try {
    return await $fetch<UploadRequest>(
      `${config.public.apiUrl}/api/documents/upload-requests/${token.value}`,
    )
  } catch {
    return fallbackRequest
  }
})

const uploadRequest = computed(() => data.value ?? fallbackRequest)

useHead({
  title: isRealPatientLink.value
    ? 'Subir documento | Medfile'
    : 'Exámenes por enlace | Medfile para médicos',
})

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
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
      `${config.public.apiUrl}/api/documents/upload-requests/${token.value}/upload-url`,
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
      await $fetch(uploadUrl.uploadUrl, {
        method: uploadUrl.method,
        body: selectedFile.value,
        headers: uploadUrl.headers,
      })
    }

    await $fetch(`${config.public.apiUrl}/api/documents/upload-requests/${token.value}/complete`, {
      method: 'POST',
      body: {
        fileName: selectedFile.value.name,
        mimeType: selectedFile.value.type || 'application/octet-stream',
        storageKey,
        documentType: 'Examen',
        notes:
          uploadUrl.mode === 'mock'
            ? 'Subida registrada en modo mock.'
            : 'Subida directa a storage completada.',
      },
    })

    successMessage.value = 'Documento enviado. Tu médico lo revisará pronto.'
  } catch {
    errorMessage.value = 'No pudimos enviar el documento. Intenta nuevamente.'
  } finally {
    submitting.value = false
  }
}
</script>
