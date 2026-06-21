<template>
  <div class="dashboard-page">
    <header class="dashboard-topbar">
      <div class="dashboard-topbar__main">
        <EyebrowPill>Captura clínica</EyebrowPill>
        <h1 class="dashboard-topbar__title">Cola del día</h1>
        <p class="dashboard-topbar__lead">
          Pacientes en espera de signos vitales antes de la consulta.
        </p>
      </div>
    </header>

    <p v-if="planError" class="form-error">{{ planError }}</p>

    <PanelCard v-else title="Filtros" padded class="patient-panel-compact">
      <div class="auth-form-row">
        <label class="form-field">
          <span class="form-field__label">Clínica</span>
          <select v-model="selectedClinicId" class="form-field__input">
            <option value="">Todas mis clínicas</option>
            <option v-for="site in clinicSites" :key="site.id" :value="site.id">
              {{ site.label || site.name }}
            </option>
          </select>
        </label>
        <MfButton variant="secondary" :disabled="queuePending" @click="refreshQueue">
          Actualizar
        </MfButton>
      </div>
    </PanelCard>

    <PanelCard title="Pacientes en cola" padded class="patient-panel-compact">
      <p v-if="queuePending" class="panel-empty panel-empty--compact">Cargando cola…</p>
      <p v-else-if="!(queue ?? []).length" class="panel-empty panel-empty--compact">
        No hay pacientes en cola hoy.
      </p>
      <ul v-else class="queue-list">
        <li v-for="entry in queue ?? []" :key="entry.id" class="queue-item">
          <div class="queue-item__main">
            <strong>
              <NuxtLink :to="`/pacientes/${entry.patientId}`">{{ entry.patientName }}</NuxtLink>
            </strong>
            <span class="queue-item__meta">
              {{ statusLabel(entry.status) }}
              <template v-if="entry.activeAlerts?.length">
                · {{ entry.activeAlerts.join(', ') }}
              </template>
            </span>
          </div>
          <MfButton variant="secondary" @click="openCapture(entry)">
            {{ entry.status === 'ready' ? 'Ver / actualizar' : 'Capturar vitales' }}
          </MfButton>
        </li>
      </ul>
    </PanelCard>

    <PanelCard
      v-if="captureEntry"
      :title="`Signos vitales — ${captureEntry.patientName}`"
      padded
      class="patient-panel-compact"
    >
      <form class="auth-form account-form" @submit.prevent="submitCapture">
        <div class="auth-form-row">
          <FormField v-model="captureForm.bloodPressure" label="Presión arterial" placeholder="120/80" />
          <FormField v-model="captureForm.heartRate" label="FC (lpm)" type="number" />
        </div>
        <div class="auth-form-row">
          <FormField v-model="captureForm.respiratoryRate" label="FR (rpm)" type="number" />
          <FormField v-model="captureForm.temperature" label="Temp (°C)" type="number" step="0.1" />
        </div>
        <div class="auth-form-row">
          <FormField v-model="captureForm.oxygenSaturation" label="SpO₂ (%)" type="number" />
          <FormField v-model="captureForm.weightKg" label="Peso (kg)" type="number" step="0.1" />
        </div>
        <FormField v-model="captureForm.nursingNote" label="Nota de enfermería" multiline />
        <label class="form-field">
          <span class="form-field__label">Triage</span>
          <select v-model="captureForm.triageLevel" class="form-field__input">
            <option value="">Sin clasificar</option>
            <option value="low">Bajo</option>
            <option value="medium">Medio</option>
            <option value="high">Alto</option>
          </select>
        </label>
        <p v-if="captureError" class="form-error">{{ captureError }}</p>
        <p v-if="captureSuccess" class="form-success">{{ captureSuccess }}</p>
        <div class="auth-form-row">
          <MfButton type="submit" :disabled="captureLoading">
            {{ captureLoading ? 'Guardando…' : 'Registrar vitales' }}
          </MfButton>
          <MfButton variant="ghost" type="button" @click="closeCapture">Cancelar</MfButton>
        </div>
      </form>
    </PanelCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'doctor', ssr: false })

interface ClinicSite {
  id: string
  name: string
  label?: string
}

interface QueueEntry {
  id: string
  patientId: string
  patientName: string
  clinicSiteId: string
  status: string
  activeAlerts?: string[]
}

const { apiFetch } = useMedfileApi()
const planError = ref('')
const selectedClinicId = ref('')
const captureEntry = ref<QueueEntry | null>(null)
const captureError = ref('')
const captureSuccess = ref('')
const captureLoading = ref(false)

const captureForm = reactive({
  bloodPressure: '',
  heartRate: '',
  respiratoryRate: '',
  temperature: '',
  oxygenSaturation: '',
  weightKg: '',
  nursingNote: '',
  triageLevel: '' as '' | 'low' | 'medium' | 'high',
})

const { data: clinicSites, error: sitesError } = await useAsyncData('clinic-sites', () =>
  apiFetch<Array<{ _id?: string; id?: string; name: string; label?: string }>>(
    '/api/clinical-capture/clinic-sites',
  ).then((sites) =>
    sites.map((site) => ({
      id: site.id ?? site._id ?? '',
      name: site.name,
      label: site.label,
    })),
  ),
)

const {
  data: queue,
  pending: queuePending,
  refresh: refreshQueue,
} = await useAsyncData(
  'clinical-queue',
  () => {
    const params = new URLSearchParams()
    if (selectedClinicId.value) params.set('clinicSiteId', selectedClinicId.value)
    const query = params.toString()
    return apiFetch<QueueEntry[]>(
      `/api/clinical-capture/queue${query ? `?${query}` : ''}`,
    )
  },
  { watch: [selectedClinicId] },
)

watch(sitesError, (error) => {
  if (error) {
    planError.value = getErrorMessage(error)
  }
})

function statusLabel(status: string) {
  if (status === 'ready') return 'Listo para consulta'
  if (status === 'waiting') return 'En espera'
  return status
}

function openCapture(entry: QueueEntry) {
  captureEntry.value = entry
  captureError.value = ''
  captureSuccess.value = ''
  Object.assign(captureForm, {
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    oxygenSaturation: '',
    weightKg: '',
    nursingNote: '',
    triageLevel: '',
  })
}

function closeCapture() {
  captureEntry.value = null
}

async function submitCapture() {
  if (!captureEntry.value) return

  captureLoading.value = true
  captureError.value = ''
  captureSuccess.value = ''

  const vitalSigns: Record<string, string | number> = {}
  if (captureForm.bloodPressure.trim()) vitalSigns.bloodPressure = captureForm.bloodPressure.trim()
  if (captureForm.heartRate) vitalSigns.heartRate = Number(captureForm.heartRate)
  if (captureForm.respiratoryRate) vitalSigns.respiratoryRate = Number(captureForm.respiratoryRate)
  if (captureForm.temperature) vitalSigns.temperature = Number(captureForm.temperature)
  if (captureForm.oxygenSaturation) vitalSigns.oxygenSaturation = Number(captureForm.oxygenSaturation)
  if (captureForm.weightKg) vitalSigns.weightKg = Number(captureForm.weightKg)

  try {
    await apiFetch('/api/clinical-capture/nursing', {
      method: 'POST',
      body: {
        patientId: captureEntry.value.patientId,
        clinicSiteId: captureEntry.value.clinicSiteId,
        vitalSigns: Object.keys(vitalSigns).length ? vitalSigns : undefined,
        nursingNote: captureForm.nursingNote.trim() || undefined,
        triageLevel: captureForm.triageLevel || undefined,
      },
    })
    captureSuccess.value = 'Signos vitales registrados. El médico verá el paciente como listo.'
    await refreshQueue()
    setTimeout(() => closeCapture(), 1200)
  } catch (error) {
    captureError.value = getErrorMessage(error)
  } finally {
    captureLoading.value = false
  }
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data
    const message = data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'No se pudo completar la acción.'
}
</script>

<style scoped>
.queue-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.queue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--mf-neutral-200);
}

.queue-item__meta {
  display: block;
  color: var(--mf-neutral-500);
  font-size: 13px;
}
</style>
