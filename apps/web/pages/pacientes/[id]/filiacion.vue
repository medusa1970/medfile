<template>
  <div class="dashboard-page patient-subpage">
    <header class="dashboard-topbar">
      <div class="dashboard-topbar__main">
        <EyebrowPill>Filiación</EyebrowPill>
        <h1 class="dashboard-topbar__title">{{ patient?.fullName ?? 'Paciente' }}</h1>
        <p class="dashboard-topbar__lead">
          Datos demográficos, contacto, domicilio y cobertura médica.
        </p>
      </div>
    </header>

    <PanelCard title="Filiación completa" padded class="patient-panel-compact">
      <p v-if="pending" class="panel-empty panel-empty--compact">Cargando filiación…</p>
      <p v-else-if="loadError" class="form-error">{{ loadError }}</p>

      <template v-else-if="patient">
        <div v-if="missingCount > 0" class="patient-data-hint">
          <span>Faltan {{ missingCount }} dato(s) por registrar.</span>
          <MfButton variant="secondary" class="patient-hint-action" :to="routes.editar">
            Completar ahora
          </MfButton>
        </div>

        <KeyValueGrid :fields="fullFields" :columns="2" :mobile-columns="2" />

        <div class="patient-filiation-footer">
          <MfButton variant="secondary" :to="routes.editar">Editar filiación</MfButton>
        </div>
      </template>
    </PanelCard>
  </div>
</template>

<script setup lang="ts">
import {
  buildFullFiliationFields,
  countMissingFiliationFields,
} from '~/utils/patient-filiation'
import type { PatientDetail } from '~/composables/usePatientPage'

definePageMeta({ layout: 'doctor', ssr: false })

const { patientId, routes, fetchPatient, normalizePatient } = usePatientPage()
const loadError = ref('')

const { data: patientData, pending } = await useAsyncData(
  () => `patient-filiation-${patientId.value}`,
  async () => {
    try {
      return await fetchPatient()
    } catch {
      loadError.value = 'No pudimos cargar la filiación del paciente.'
      return null
    }
  },
  { server: false, watch: [patientId] },
)

const patient = computed(() => normalizePatient(patientData.value as PatientDetail | null))
const fullFields = computed(() => buildFullFiliationFields(patient.value ?? {}))
const missingCount = computed(() => countMissingFiliationFields(patient.value ?? {}))
</script>
