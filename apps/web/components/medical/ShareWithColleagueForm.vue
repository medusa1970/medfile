<template>
  <PanelCard title="Compartir con colega Medfile" padded>
    <p class="share-form-intro">
      Envía acceso temporal de lectura a otro médico usando su <strong>Código Medfile</strong> (ej. MF-K7R4N2).
      Tú sigues siendo el médico titular del paciente.
    </p>

    <form class="share-form" @submit.prevent="submit">
      <FormField
        v-model="form.targetMedfileCode"
        label="Código Medfile del colega"
        placeholder="MF-XXXXXX"
        autocomplete="off"
        @blur="lookupColleague"
      />

      <div v-if="colleaguePreview" class="colleague-preview">
        <StatusBadge tone="success">Consultorio encontrado</StatusBadge>
        <strong>{{ colleaguePreview.name }}</strong>
        <span v-if="colleaguePreview.ownerName">Dr(a). {{ colleaguePreview.ownerName }}</span>
        <span class="colleague-preview-code">{{ colleaguePreview.medfileCode }}</span>
      </div>
      <p v-else-if="lookupError" class="form-error">{{ lookupError }}</p>

      <label class="form-field">
        <span class="form-field-label">Duración del acceso</span>
        <select v-model.number="form.durationDays" class="form-field-input">
          <option :value="7">7 días</option>
          <option :value="15">15 días</option>
          <option :value="30">30 días</option>
        </select>
      </label>

      <FormField
        v-model="form.message"
        label="Mensaje para tu colega (opcional)"
        placeholder="Ej. Interconsulta por labs recientes"
      />

      <label class="share-consent">
        <input v-model="consentChecked" type="checkbox" required />
        <span>El paciente autorizó compartir su historial con este colega.</span>
      </label>

      <div v-if="error" class="form-error">{{ error }}</div>
      <div v-if="success" class="form-success">{{ success }}</div>

      <MfButton type="submit" block :disabled="loading || !consentChecked">
        {{ loading ? 'Enviando...' : 'Solicitar acceso para colega' }}
      </MfButton>
    </form>
  </PanelCard>
</template>

<script setup lang="ts">
import type { TenantPublicProfile } from '@medfile/types'
import { normalizeMedfileCode } from '@medfile/types'

const props = defineProps<{
  patientId: string
}>()

const emit = defineEmits<{
  shared: []
}>()

const { apiFetch } = useMedfileApi()

const form = reactive({
  targetMedfileCode: '',
  durationDays: 15,
  message: '',
})

const consentChecked = ref(false)
const colleaguePreview = ref<(TenantPublicProfile & { isSelf?: boolean }) | null>(null)
const lookupError = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function lookupColleague() {
  lookupError.value = ''
  colleaguePreview.value = null

  const code = form.targetMedfileCode.trim()
  if (code.length < 5) return

  try {
    const normalized = normalizeMedfileCode(code)
    const result = await apiFetch<TenantPublicProfile & { isSelf?: boolean }>(
      `/api/tenants/lookup/${encodeURIComponent(normalized)}`,
    )

    if (result.isSelf) {
      lookupError.value = 'Este es tu propio código. Ingresa el de otro colega.'
      return
    }

    colleaguePreview.value = result
    form.targetMedfileCode = result.medfileCode
  } catch {
    lookupError.value = 'No encontramos un consultorio con ese código.'
  }
}

async function submit() {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    await lookupColleague()
    if (!colleaguePreview.value) {
      error.value = lookupError.value || 'Verifica el Código Medfile del colega.'
      return
    }

    await apiFetch('/api/clinical-shares', {
      method: 'POST',
      body: {
        patientId: props.patientId,
        targetMedfileCode: form.targetMedfileCode,
        intention: 'view_only',
        durationDays: form.durationDays,
        message: form.message || undefined,
        consent: {
          method: 'digital_checkbox',
        },
      },
    })

    success.value = 'Solicitud enviada. Tu colega debe aceptarla desde Compartidos.'
    form.message = ''
    emit('shared')
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function getErrorMessage(err: unknown) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (data?.message) return data.message
  }
  return 'No pudimos enviar la solicitud. Intenta de nuevo.'
}
</script>

<style scoped>
.share-form-intro {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--mf-slate-700);
}

.share-form {
  display: grid;
  gap: 14px;
}

.colleague-preview {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: var(--mf-radius-md);
  background: var(--mf-slate-50);
  font-size: 14px;
}

.colleague-preview-code {
  font-family: ui-monospace, monospace;
  font-weight: 700;
  color: var(--mf-teal-600);
}

.share-consent {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.45;
  color: var(--mf-slate-700);
}

.form-success {
  padding: 10px 12px;
  border-radius: var(--mf-radius-md);
  background: rgb(0 169 206 / 0.1);
  color: var(--mf-navy-900);
  font-size: 14px;
}
</style>
