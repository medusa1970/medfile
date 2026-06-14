<template>
  <form class="upload-request-form" :class="{ 'upload-request-form--compact': compact }" @submit.prevent="submit">
    <p v-if="patientId && patientName" class="upload-request-patient">
      Paciente: <strong>{{ patientName }}</strong>
    </p>

    <label v-else class="form-field form-field--compact">
      <span>Paciente</span>
      <select v-model="form.patientId" required>
        <option value="">Seleccionar paciente</option>
        <option v-for="patient in patients" :key="patient.id" :value="patient.id">
          {{ patient.fullName }}
        </option>
      </select>
    </label>

    <FormField v-model="form.title" compact label="Titulo" placeholder="Enviar examenes" required />
    <FormField
      v-model="form.instructions"
      compact
      label="Instrucciones"
      placeholder="Sube fotos claras o PDF del laboratorio."
      textarea
      :rows="2"
    />

    <div v-if="error" class="form-error">{{ error }}</div>
    <div v-if="createdLink" class="form-success upload-link-result">
      <p>Enlace creado. Compartelo con tu paciente:</p>
      <NuxtLink :to="createdLink">{{ createdLink }}</NuxtLink>
      <MfButton type="button" variant="secondary" block class="whatsapp-share-btn" @click="shareViaWhatsApp">
        Enviar por WhatsApp
      </MfButton>
      <p class="form-help">Incluido en Plan Gratis — abre WhatsApp con el mensaje y enlace listos.</p>
    </div>

    <MfButton type="submit" :block="!compact">
      {{ loading ? 'Creando...' : 'Crear enlace seguro' }}
    </MfButton>
  </form>
</template>

<script setup lang="ts">
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
    doctorLabel: 'Tu medico',
    patients: () => [],
    compact: false,
    loading: false,
    error: '',
    createdLink: '',
  },
)

const emit = defineEmits<{
  submit: [payload: { patientId: string; title: string; instructions: string }]
}>()

const form = reactive({
  patientId: props.patientId,
  title: 'Enviar examenes',
  instructions: 'Sube fotos claras o PDF del laboratorio.',
})

watch(
  () => props.patientId,
  (value) => {
    if (value) form.patientId = value
  },
)

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

function shareViaWhatsApp() {
  if (!props.createdLink || !import.meta.client) return

  const origin = window.location.origin
  const fullUrl = props.createdLink.startsWith('http') ? props.createdLink : `${origin}${props.createdLink}`
  const message = buildUploadRequestWhatsAppMessage({
    patientName: resolvedPatientName.value,
    doctorLabel: props.doctorLabel,
    uploadUrl: fullUrl,
    title: form.title.trim().toLowerCase(),
  })

  openWhatsAppShare(message, resolvedPhone.value)
}
</script>

<style scoped>
.upload-link-result {
  display: grid;
  gap: 10px;
}

.upload-link-result p {
  margin: 0;
}

.whatsapp-share-btn {
  margin-top: 4px;
}
</style>
