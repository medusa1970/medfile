<template>
  <div class="upload-request-flow">
    <ol v-if="!createdLink" class="upload-request-steps" aria-label="Pasos">
      <li class="upload-request-steps__item upload-request-steps__item--active">
        <span class="upload-request-steps__num">1</span>
        <span>Configura la solicitud</span>
      </li>
      <li class="upload-request-steps__item">
        <span class="upload-request-steps__num">2</span>
        <span>Comparte el enlace</span>
      </li>
    </ol>

    <form
      v-if="!createdLink"
      class="upload-request-form"
      :class="{ 'upload-request-form--compact': compact }"
      @submit.prevent="submit"
    >
      <div v-if="patientId && patientName" class="upload-request-patient-card">
        <MedIcon name="user" size="sm" />
        <div>
          <span class="upload-request-patient-card__label">Paciente</span>
          <strong>{{ patientName }}</strong>
          <span v-if="resolvedPhone" class="upload-request-patient-card__phone">{{ resolvedPhone }}</span>
        </div>
      </div>

      <label v-else class="form-field form-field--compact">
        <span>Paciente</span>
        <select v-model="form.patientId" required>
          <option value="">Seleccionar paciente</option>
          <option v-for="patient in patients" :key="patient.id" :value="patient.id">
            {{ patient.fullName }}
          </option>
        </select>
      </label>

      <FormField
        v-model="form.title"
        compact
        label="Qué debe enviar"
        placeholder="Ej. Exámenes de laboratorio"
        required
      />
      <FormField
        v-model="form.instructions"
        compact
        label="Instrucciones para el paciente"
        placeholder="Ej. Fotos claras o PDF del laboratorio."
        textarea
        :rows="3"
      />

      <p class="upload-request-hint">
        El paciente podrá <strong>tomar fotos con la cámara</strong> o elegir imágenes y PDF desde su móvil.
      </p>

      <div v-if="error" class="form-error">{{ error }}</div>

      <MfButton type="submit" :block="!compact" :disabled="loading">
        {{ loading ? 'Generando enlace…' : 'Generar enlace seguro' }}
      </MfButton>
    </form>

    <section v-else class="upload-request-success" aria-live="polite">
      <ol class="upload-request-steps" aria-label="Pasos">
        <li class="upload-request-steps__item upload-request-steps__item--done">
          <span class="upload-request-steps__num">1</span>
          <span>Solicitud creada</span>
        </li>
        <li class="upload-request-steps__item upload-request-steps__item--active">
          <span class="upload-request-steps__num">2</span>
          <span>Comparte el enlace</span>
        </li>
      </ol>

      <div class="upload-request-success__card">
        <StatusBadge tone="success">Enlace listo</StatusBadge>
        <h3 class="upload-request-success__title">{{ form.title }}</h3>
        <p class="upload-request-success__lead">
          Envía esta URL a <strong>{{ resolvedPatientName || 'tu paciente' }}</strong>.
          En WhatsApp aparecerá como enlace clicable.
        </p>

        <label class="upload-request-url-field">
          <span class="upload-request-url-field__label">Enlace para el paciente</span>
          <div class="upload-request-url-field__row">
            <input
              ref="urlInputRef"
              class="upload-request-url-field__input"
              type="text"
              readonly
              :value="fullUploadUrl"
              aria-label="Enlace para el paciente"
              @focus="selectUrl"
              @click="selectUrlFromClick"
            />
            <MfButton type="button" variant="secondary" :disabled="!fullUploadUrl" @click="copyLink">
              {{ copied ? 'Copiado' : 'Copiar' }}
            </MfButton>
          </div>
          <p v-if="copyError" class="form-error upload-request-copy-error">{{ copyError }}</p>
        </label>

        <div class="upload-request-success__actions">
          <MfButton type="button" block class="whatsapp-share-btn" @click="shareViaWhatsApp">
            Enviar por WhatsApp
          </MfButton>
          <MfButton
            type="button"
            variant="secondary"
            block
            :href="fullUploadUrl || undefined"
            target="_blank"
            rel="noopener noreferrer"
            :disabled="!fullUploadUrl"
          >
            Probar enlace
          </MfButton>
          <MfButton type="button" variant="ghost" block @click="resetFlow">
            Crear otro enlace
          </MfButton>
        </div>

        <p class="form-help">Incluido en Plan Gratis. El enlace vence en 7 días.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { buildAbsoluteUploadUrl } from '~/utils/upload-request-link'
import { copyTextToClipboard } from '~/utils/copy-to-clipboard'
import { buildUploadRequestWhatsAppMessage, openWhatsAppShare } from '~/utils/whatsapp'

interface PatientOption {
  id: string
  fullName: string
  phone?: string
}

const props = withDefaults(
  defineProps<{
    patientId?: string
    patientName?: string
    patientPhone?: string
    doctorLabel?: string
    patients?: PatientOption[]
    compact?: boolean
    loading?: boolean
    error?: string
    createdLink?: string
  }>(),
  {
    patientId: '',
    patientName: '',
    patientPhone: '',
    doctorLabel: 'Tu médico',
    patients: () => [],
    compact: false,
    loading: false,
    error: '',
    createdLink: '',
  },
)

const emit = defineEmits<{
  submit: [payload: { patientId: string; title: string; instructions: string }]
  reset: []
}>()

const form = reactive({
  patientId: props.patientId,
  title: 'Enviar exámenes',
  instructions: 'Sube fotos claras o un PDF del laboratorio. Puedes tomar la foto con tu cámara.',
})

const copied = ref(false)
const copyError = ref('')
const urlInputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.patientId,
  (value) => {
    if (value) form.patientId = value
  },
)

const fullUploadUrl = computed(() => {
  if (!props.createdLink) return ''

  if (import.meta.client) {
    return buildAbsoluteUploadUrl(props.createdLink, window.location.origin)
  }

  return buildAbsoluteUploadUrl(props.createdLink)
})

const resolvedPhone = computed(() => {
  if (props.patientPhone) return props.patientPhone
  if (!form.patientId) return ''
  return props.patients.find((patient) => patient.id === form.patientId)?.phone ?? ''
})

const resolvedPatientName = computed(() => {
  if (props.patientName) return props.patientName
  if (!form.patientId) return ''
  return props.patients.find((patient) => patient.id === form.patientId)?.fullName ?? ''
})

function submit() {
  const targetPatientId = props.patientId || form.patientId
  if (!targetPatientId) return

  emit('submit', {
    patientId: targetPatientId,
    title: form.title.trim(),
    instructions: form.instructions.trim(),
  })
}

function resetFlow() {
  copied.value = false
  copyError.value = ''
  emit('reset')
}

function selectUrl(event: FocusEvent) {
  const input = event.target as HTMLInputElement
  input.select()
}

function selectUrlFromClick(event: MouseEvent) {
  const input = event.target as HTMLInputElement
  input.select()
}

async function copyLink() {
  copyError.value = ''

  if (!fullUploadUrl.value || !import.meta.client) {
    copyError.value = 'No hay enlace para copiar.'
    return
  }

  const ok = await copyTextToClipboard(fullUploadUrl.value, urlInputRef.value ?? undefined)

  if (ok) {
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
    return
  }

  copyError.value = 'No pudimos copiar automáticamente. Mantén pulsado el enlace de arriba y elige Copiar.'
  urlInputRef.value?.focus()
  urlInputRef.value?.select()
}

function shareViaWhatsApp() {
  if (!fullUploadUrl.value || !import.meta.client) return

  copyError.value = ''

  const message = buildUploadRequestWhatsAppMessage({
    patientName: resolvedPatientName.value,
    doctorLabel: props.doctorLabel,
    uploadUrl: fullUploadUrl.value,
    title: form.title.trim().toLowerCase(),
  })

  openWhatsAppShare(message, resolvedPhone.value)
}
</script>

<style scoped>
.upload-request-flow {
  display: grid;
  gap: 16px;
}

.upload-request-steps {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.upload-request-steps__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--mf-slate-100);
  border-radius: 12px;
  background: rgb(248 250 252 / 0.8);
  color: var(--mf-slate-500);
  font-size: 12px;
  font-weight: 700;
}

.upload-request-steps__item--active {
  border-color: rgb(0 169 206 / 0.28);
  background: rgb(0 169 206 / 0.08);
  color: var(--mf-navy-900);
}

.upload-request-steps__item--done {
  border-color: rgb(34 197 94 / 0.25);
  background: rgb(240 253 244 / 0.9);
  color: var(--mf-navy-900);
}

.upload-request-steps__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: white;
  color: inherit;
  font-size: 11px;
  font-weight: 800;
}

.upload-request-patient-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--mf-slate-100);
  border-radius: 14px;
  background: rgb(248 250 252 / 0.92);
  color: var(--mf-teal-600);
}

.upload-request-patient-card strong {
  display: block;
  color: var(--mf-navy-900);
  font-size: 15px;
}

.upload-request-patient-card__label {
  display: block;
  color: var(--mf-slate-500);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.upload-request-patient-card__phone {
  display: block;
  margin-top: 2px;
  color: var(--mf-slate-500);
  font-size: 13px;
  font-weight: 600;
}

.upload-request-hint {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgb(0 31 92 / 0.04);
  color: var(--mf-slate-600);
  font-size: 13px;
  line-height: 1.45;
}

.upload-request-success__card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgb(34 197 94 / 0.22);
  border-radius: 16px;
  background: rgb(240 253 244 / 0.55);
}

.upload-request-success__title {
  margin: 0;
  color: var(--mf-navy-900);
  font-size: 18px;
  font-weight: 800;
}

.upload-request-success__lead {
  margin: 0;
  color: var(--mf-slate-600);
  font-size: 14px;
  line-height: 1.5;
}

.upload-request-url-field {
  display: grid;
  gap: 6px;
}

.upload-request-url-field__label {
  color: var(--mf-slate-500);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.upload-request-url-field__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: stretch;
}

.upload-request-copy-error {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .upload-request-url-field__row {
    grid-template-columns: 1fr;
  }
}

.upload-request-url-field__input {
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: var(--mf-border);
  border-radius: 12px;
  background: white;
  color: var(--mf-navy-900);
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 12px;
}

.upload-request-success__actions {
  display: grid;
  gap: 8px;
}

.whatsapp-share-btn {
  background: #25d366;
  box-shadow: 0 8px 20px rgb(37 211 102 / 0.28);
}

.whatsapp-share-btn:hover {
  background: #1ebe57;
}
</style>
