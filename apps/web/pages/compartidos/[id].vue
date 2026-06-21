<template>
  <div class="dashboard-page">
    <header class="app-header">
      <div>
        <EyebrowPill>Lectura compartida</EyebrowPill>
        <h1>{{ view?.patient.fullName ?? 'Historial compartido' }}</h1>
        <p v-if="view?.share">
          De {{ view.share.sourceTenantName }} · vence {{ formatDate(view.share.expiresAt) }}
        </p>
      </div>
    </header>

    <div v-if="loadError" class="form-error">{{ loadError }}</div>

    <template v-else-if="view">
      <StatusBadge tone="warning">Solo lectura — médico titular: {{ view.share.sourceTenantName }}</StatusBadge>

      <section class="dashboard-grid" style="margin-top: 16px">
        <PanelCard title="Resumen clínico" padded>
          <pre v-if="view.patient.medicalBackground" class="shared-json">{{
            formatBackground(view.patient.medicalBackground)
          }}</pre>
          <p v-else>Sin antecedentes registrados en el paquete compartido.</p>
        </PanelCard>

        <PanelCard title="Consultas compartidas" padded>
          <ul v-if="view.encounters.length" class="shared-list">
            <li v-for="enc in view.encounters" :key="enc.id">
              <strong>{{ formatDate(enc.occurredAt) }}</strong> — {{ enc.reason }}
              <span v-if="enc.diagnosis"> · {{ enc.diagnosis }}</span>
            </li>
          </ul>
          <p v-else>No hay consultas en este paquete.</p>
        </PanelCard>

        <PanelCard title="Documentos" padded>
          <ul v-if="view.documents.length" class="shared-list">
            <li v-for="doc in view.documents" :key="doc.id">
              {{ doc.name }} <small>({{ doc.type }})</small>
            </li>
          </ul>
          <p v-else>No hay documentos en este paquete.</p>
        </PanelCard>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SharedPatientView } from '@medfile/types'

definePageMeta({ layout: 'doctor', ssr: false })

const route = useRoute()
const { apiFetch } = useMedfileApi()
const view = ref<SharedPatientView | null>(null)
const loadError = ref('')

onMounted(async () => {
  try {
    view.value = await apiFetch<SharedPatientView>(
      `/api/clinical-shares/${route.params.id}/view`,
    )
  } catch {
    loadError.value = 'No pudimos cargar este historial compartido.'
  }
})

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatBackground(data: Record<string, unknown>) {
  return JSON.stringify(data, null, 2)
}
</script>

<style scoped>
.shared-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.6;
}

.shared-json {
  margin: 0;
  white-space: pre-wrap;
  font-size: 13px;
  font-family: inherit;
}
</style>
