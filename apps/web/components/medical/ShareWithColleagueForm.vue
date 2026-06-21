<template>
  <div class="share-with-colleague">
    <p class="share-form-intro">
      Envía acceso temporal de <strong>solo lectura</strong> a otro médico Medfile usando su
      <strong>Código Medfile</strong>. Tú sigues siendo el médico titular; puedes revocar el acceso
      cuando quieras.
    </p>

    <form class="share-form" @submit.prevent="submit">
      <fieldset class="share-fieldset">
        <legend>Motivo clínico</legend>
        <div class="share-preset-grid">
          <label
            v-for="option in presetOptions"
            :key="option.id"
            class="share-preset"
            :class="{ 'share-preset--active': preset === option.id }"
          >
            <input v-model="preset" type="radio" name="share-preset" :value="option.id" />
            <strong>{{ option.label }}</strong>
            <span>{{ option.detail }}</span>
          </label>
        </div>
      </fieldset>

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

      <fieldset class="share-fieldset">
        <legend>Qué verá tu colega</legend>

        <label class="share-check">
          <input v-model="scope.includeSummary" type="checkbox" />
          <span>Resumen clínico (alergias, antecedentes, medicación)</span>
        </label>

        <label class="share-check">
          <input v-model="includeEncounters" type="checkbox" />
          <span>Consultas recientes</span>
        </label>

        <label v-if="includeEncounters" class="form-field">
          <span class="form-field-label">Cantidad de consultas</span>
          <select v-model.number="scope.encounterLimit" class="form-field-input">
            <option :value="3">Últimas 3</option>
            <option :value="5">Últimas 5</option>
            <option :value="10">Últimas 10</option>
          </select>
        </label>

        <label class="share-check">
          <input v-model="scope.includeDocuments" type="checkbox" />
          <span>Documentos e imágenes del paciente</span>
        </label>

        <label class="share-check share-check--caution">
          <input v-model="scope.includeContact" type="checkbox" />
          <span>Teléfono, correo y documento de identidad (solo si el paciente lo autorizó)</span>
        </label>
      </fieldset>

      <label class="form-field">
        <span class="form-field-label">Duración del acceso</span>
        <select v-model.number="form.durationDays" class="form-field-input">
          <option :value="7">7 días — segunda opinión</option>
          <option :value="15">15 días — interconsulta</option>
          <option :value="30">30 días — seguimiento compartido</option>
        </select>
      </label>

      <FormField
        v-model="form.message"
        label="Mensaje para tu colega (opcional)"
        placeholder="Ej. Interconsulta por labs recientes"
      />

      <div class="share-preview-box" aria-live="polite">
        <p class="share-preview-box__title">Vista previa del paquete</p>
        <ul>
          <li v-for="line in packagePreview" :key="line">{{ line }}</li>
        </ul>
      </div>

      <label class="share-consent">
        <input v-model="consentChecked" type="checkbox" required />
        <span>
          El paciente autorizó compartir esta información con este colega (consentimiento
          registrado).
        </span>
      </label>

      <div v-if="error" class="form-error">{{ error }}</div>
      <div v-if="success" class="form-success">{{ success }}</div>

      <MfButton type="submit" block :disabled="loading || !consentChecked || !canSubmitScope">
        {{ loading ? 'Enviando…' : 'Enviar solicitud al colega' }}
      </MfButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ClinicalSharePermission, TenantPublicProfile } from '@medfile/types'
import { normalizeMedfileCode } from '@medfile/types/medfile-code'

type SharePreset = 'interconsulta' | 'referencia' | 'custom'

const props = defineProps<{
  patientId: string
  patientName?: string
}>()

const emit = defineEmits<{
  shared: []
}>()

const { apiFetch } = useMedfileApi()

const presetOptions = [
  {
    id: 'interconsulta' as const,
    label: 'Interconsulta',
    detail: 'Resumen + 3 consultas + documentos. Sin datos de contacto.',
  },
  {
    id: 'referencia' as const,
    label: 'Referencia',
    detail: 'Resumen + 10 consultas + documentos. Sin contacto.',
  },
  {
    id: 'custom' as const,
    label: 'Personalizado',
    detail: 'Tú eliges qué bloques incluir abajo.',
  },
]

const preset = ref<SharePreset>('interconsulta')

const form = reactive({
  targetMedfileCode: '',
  durationDays: 15,
  message: '',
})

const scope = reactive({
  includeSummary: true,
  includeDocuments: true,
  includeContact: false,
  encounterLimit: 3,
})

const includeEncounters = ref(true)

const consentChecked = ref(false)
const colleaguePreview = ref<(TenantPublicProfile & { isSelf?: boolean }) | null>(null)
const lookupError = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

watch(preset, (value) => {
  if (value === 'interconsulta') {
    scope.includeSummary = true
    scope.includeDocuments = true
    scope.includeContact = false
    scope.encounterLimit = 3
    includeEncounters.value = true
    form.durationDays = 15
    return
  }

  if (value === 'referencia') {
    scope.includeSummary = true
    scope.includeDocuments = true
    scope.includeContact = false
    scope.encounterLimit = 10
    includeEncounters.value = true
    form.durationDays = 30
  }
})

const canSubmitScope = computed(
  () =>
    scope.includeSummary ||
    includeEncounters.value ||
    scope.includeDocuments ||
    scope.includeContact,
)

const packagePreview = computed(() => {
  const lines: string[] = []
  const name = props.patientName?.trim() || 'Paciente'

  lines.push(`Paciente: ${name}`)
  if (scope.includeSummary) lines.push('Resumen clínico y antecedentes')
  if (includeEncounters.value) lines.push(`Últimas ${scope.encounterLimit} consultas`)
  if (scope.includeDocuments) lines.push('Documentos e imágenes compartidos')
  if (scope.includeContact) lines.push('Datos de contacto e identidad')
  if (!scope.includeContact) lines.push('Sin teléfono, correo ni domicilio')
  lines.push(`Acceso solo lectura · ${form.durationDays} días`)
  return lines
})

function buildPermissions(): ClinicalSharePermission[] {
  const permissions: ClinicalSharePermission[] = []
  if (scope.includeSummary) permissions.push('view_summary')
  if (includeEncounters.value) permissions.push('view_encounters')
  if (scope.includeDocuments) permissions.push('view_documents')
  if (scope.includeContact) permissions.push('view_contact')
  return permissions
}

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

    const permissions = buildPermissions()
    if (!permissions.length) {
      error.value = 'Selecciona al menos un bloque clínico para compartir.'
      return
    }

    await apiFetch('/api/clinical-shares', {
      method: 'POST',
      body: {
        patientId: props.patientId,
        targetMedfileCode: form.targetMedfileCode,
        intention: 'view_only',
        permissions,
        scope: {
          includeSummary: scope.includeSummary,
          encounterLimit: includeEncounters.value ? scope.encounterLimit : 0,
          documentIds: [],
        },
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

.share-fieldset {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  border: 0;
}

.share-fieldset legend {
  margin-bottom: 2px;
  color: var(--mf-slate-700);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.share-preset-grid {
  display: grid;
  gap: 8px;
}

.share-preset {
  display: grid;
  gap: 2px;
  padding: 12px 14px;
  border: 1px solid var(--mf-slate-200);
  border-radius: 14px;
  background: rgb(248 250 252 / 0.88);
  cursor: pointer;
}

.share-preset input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.share-preset strong {
  color: var(--mf-navy-900);
  font-size: 14px;
}

.share-preset span {
  color: var(--mf-slate-600);
  font-size: 13px;
  line-height: 1.4;
}

.share-preset--active {
  border-color: rgb(0 169 206 / 0.45);
  background: rgb(240 253 255 / 0.9);
  box-shadow: 0 0 0 1px rgb(0 169 206 / 0.18);
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

.share-check {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.45;
  color: var(--mf-slate-700);
}

.share-check--caution {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgb(255 251 235 / 0.72);
  border: 1px solid rgb(245 158 11 / 0.22);
}

.share-preview-box {
  padding: 12px 14px;
  border: 1px dashed var(--mf-slate-200);
  border-radius: 14px;
  background: rgb(248 250 252 / 0.72);
}

.share-preview-box__title {
  margin: 0 0 8px;
  color: var(--mf-slate-600);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.share-preview-box ul {
  display: grid;
  gap: 4px;
  margin: 0;
  padding-left: 18px;
  color: var(--mf-slate-700);
  font-size: 13px;
  line-height: 1.45;
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
