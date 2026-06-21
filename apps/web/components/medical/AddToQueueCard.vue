<template>
  <PanelCard title="Agregar a cola clínica" padded class="patient-panel-compact">
    <form class="auth-form account-form" @submit.prevent="submit">
      <label class="form-field">
        <span class="form-field__label">Clínica</span>
        <select v-model="clinicSiteId" class="form-field__input" required>
          <option value="" disabled>Selecciona clínica</option>
          <option v-for="site in clinicSites" :key="site.id" :value="site.id">
            {{ site.label || site.name }}
          </option>
        </select>
      </label>
      <FormField v-model="notes" label="Notas (opcional)" multiline />
      <p v-if="error" class="form-error">{{ error }}</p>
      <p v-if="success" class="form-success">{{ success }}</p>
      <MfButton type="submit" :disabled="loading || !clinicSites.length">
        {{ loading ? 'Agregando…' : 'Agregar a cola de hoy' }}
      </MfButton>
      <p v-if="!clinicSites.length" class="panel-hint panel-hint--compact">
        Crea clínicas en <NuxtLink to="/cuenta/equipo">Mi equipo</NuxtLink>.
      </p>
    </form>
  </PanelCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  patientId: string
}>()

const emit = defineEmits<{
  added: []
}>()

const { apiFetch } = useMedfileApi()
const clinicSites = ref<Array<{ id: string; name: string; label?: string }>>([])
const clinicSiteId = ref('')
const notes = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

onMounted(async () => {
  try {
    const sites = await apiFetch<Array<{ _id?: string; id?: string; name: string; label?: string }>>(
      '/api/clinical-capture/clinic-sites',
    )
    clinicSites.value = sites.map((site) => ({
      id: site.id ?? site._id ?? '',
      name: site.name,
      label: site.label,
    }))
    if (clinicSites.value[0]) {
      clinicSiteId.value = clinicSites.value[0].id
    }
  } catch {
    clinicSites.value = []
  }
})

async function submit() {
  if (!clinicSiteId.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await apiFetch('/api/clinical-capture/queue', {
      method: 'POST',
      body: {
        patientId: props.patientId,
        clinicSiteId: clinicSiteId.value,
        notes: notes.value.trim() || undefined,
      },
    })
    success.value = 'Paciente agregado a la cola de hoy.'
    notes.value = ''
    emit('added')
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function getErrorMessage(err: unknown) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    const message = data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'No se pudo agregar a la cola.'
}
</script>
