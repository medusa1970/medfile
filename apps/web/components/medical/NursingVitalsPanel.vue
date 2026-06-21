<template>
  <PanelCard
    title="Signos vitales de enfermería"
    :badge="captures.length ? `${captures.length}` : undefined"
    padded
    class="patient-panel-compact"
  >
    <p v-if="pending" class="panel-empty panel-empty--compact">Cargando…</p>
    <p v-else-if="error" class="form-error">{{ error }}</p>
    <p v-else-if="!captures.length" class="panel-empty panel-empty--compact">
      Sin capturas de enfermería registradas hoy.
    </p>
    <ul v-else class="nursing-list">
      <li v-for="capture in captures" :key="capture.id" class="nursing-item">
        <div class="nursing-item__meta">
          <StatusBadge>{{ formatDateTime(capture.occurredAt) }}</StatusBadge>
          <StatusBadge v-if="capture.triageLevel" :tone="triageTone(capture.triageLevel)">
            Triage {{ triageLabel(capture.triageLevel) }}
          </StatusBadge>
        </div>
        <p v-if="capture.vitalSigns" class="nursing-item__vitals">{{ formatVitals(capture.vitalSigns) }}</p>
        <p v-if="capture.nursingNote"><strong>Nota:</strong> {{ capture.nursingNote }}</p>
      </li>
    </ul>
  </PanelCard>
</template>

<script setup lang="ts">
interface VitalSigns {
  bloodPressure?: string
  heartRate?: number
  respiratoryRate?: number
  temperature?: number
  oxygenSaturation?: number
  weightKg?: number
  heightCm?: number
}

interface NursingCaptureItem {
  id: string
  _id?: string
  occurredAt: string
  vitalSigns?: VitalSigns
  nursingNote?: string
  triageLevel?: 'low' | 'medium' | 'high'
}

const props = defineProps<{
  patientId: string
  enabled?: boolean
}>()

const { apiFetch } = useMedfileApi()
const captures = ref<NursingCaptureItem[]>([])
const pending = ref(false)
const error = ref('')

async function loadCaptures() {
  if (!props.enabled || !props.patientId) {
    captures.value = []
    return
  }

  pending.value = true
  error.value = ''

  try {
    const data = await apiFetch<NursingCaptureItem[]>(
      `/api/clinical-capture/nursing/patient/${props.patientId}`,
    )
    captures.value = data.map((item) => ({
      ...item,
      id: item.id ?? item._id ?? item.occurredAt,
    }))
  } catch (err) {
    captures.value = []
    error.value = getErrorMessage(err)
  } finally {
    pending.value = false
  }
}

watch(
  () => [props.patientId, props.enabled],
  () => {
    void loadCaptures()
  },
  { immediate: true },
)

function formatDateTime(value?: string) {
  if (!value) return 'Sin fecha'
  return new Date(value).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatVitals(vitals: VitalSigns) {
  const parts: string[] = []
  if (vitals.bloodPressure) parts.push(`PA ${vitals.bloodPressure}`)
  if (vitals.heartRate != null) parts.push(`FC ${vitals.heartRate}`)
  if (vitals.respiratoryRate != null) parts.push(`FR ${vitals.respiratoryRate}`)
  if (vitals.temperature != null) parts.push(`Temp ${vitals.temperature}°C`)
  if (vitals.oxygenSaturation != null) parts.push(`SpO₂ ${vitals.oxygenSaturation}%`)
  if (vitals.weightKg != null) parts.push(`Peso ${vitals.weightKg} kg`)
  return parts.join(' · ') || 'Sin signos registrados'
}

function triageLabel(level: string) {
  if (level === 'low') return 'bajo'
  if (level === 'medium') return 'medio'
  if (level === 'high') return 'alto'
  return level
}

function triageTone(level: string): '' | 'warning' | 'danger' | 'success' {
  if (level === 'high') return 'danger'
  if (level === 'medium') return 'warning'
  return 'success'
}

function getErrorMessage(err: unknown) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    const message = data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'No se pudieron cargar los signos vitales.'
}

defineExpose({ refresh: loadCaptures })
</script>

<style scoped>
.nursing-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.nursing-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--mf-neutral-200);
}

.nursing-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.nursing-item__vitals {
  margin: 0 0 6px;
  font-size: 14px;
}
</style>
