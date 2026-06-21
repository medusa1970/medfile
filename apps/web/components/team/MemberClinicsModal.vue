<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="document-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Asignar clínicas"
      @click.self="emit('close')"
    >
      <div class="document-viewer__panel member-clinics-modal">
        <header class="document-viewer__header">
          <div class="document-viewer__title-wrap">
            <EyebrowPill>Equipo</EyebrowPill>
            <h2 class="document-viewer__title">Clínicas de {{ memberName }}</h2>
          </div>
          <button type="button" class="document-viewer__close" aria-label="Cerrar" @click="emit('close')">
            ×
          </button>
        </header>

        <div class="document-viewer__body">
          <p v-if="!clinicSites.length" class="panel-hint">No hay clínicas registradas.</p>
          <ul v-else class="clinic-checklist">
            <li v-for="site in clinicSites" :key="site.id">
              <label class="clinic-checklist__item">
                <input v-model="selectedIds" type="checkbox" :value="site.id" />
                <span>{{ site.label || site.name }}</span>
              </label>
            </li>
          </ul>
          <p v-if="error" class="form-error">{{ error }}</p>
          <div class="member-clinics-modal__actions">
            <MfButton type="button" :disabled="saving" @click="save">
              {{ saving ? 'Guardando…' : 'Guardar' }}
            </MfButton>
            <MfButton type="button" variant="ghost" @click="emit('close')">Cancelar</MfButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface ClinicSite {
  id: string
  name: string
  label?: string
}

const props = defineProps<{
  open: boolean
  memberId: string
  memberName: string
  clinicSites: ClinicSite[]
  initialIds: string[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { apiFetch } = useMedfileApi()
const selectedIds = ref<string[]>([])
const saving = ref(false)
const error = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedIds.value = [...props.initialIds]
      error.value = ''
    }
  },
)

async function save() {
  if (!selectedIds.value.length) {
    error.value = 'Selecciona al menos una clínica.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    await apiFetch(`/api/team/members/${props.memberId}/clinic-contexts`, {
      method: 'PATCH',
      body: { clinicContextIds: selectedIds.value },
    })
    emit('saved')
    emit('close')
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    saving.value = false
  }
}

function getErrorMessage(err: unknown) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    const message = data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'No se pudo guardar.'
}
</script>

<style scoped>
.member-clinics-modal {
  max-width: 480px;
}

.clinic-checklist {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: grid;
  gap: 10px;
}

.clinic-checklist__item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.member-clinics-modal__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
