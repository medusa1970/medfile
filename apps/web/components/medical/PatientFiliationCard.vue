<template>
  <PanelCard padded class="patient-filiation-card patient-panel-compact">
    <template #header>
      <div class="patient-profile-heading">
        <EyebrowPill>Historia clínica</EyebrowPill>
        <h1 class="patient-profile-name">{{ patientName }}</h1>
      </div>
    </template>

    <StatStrip v-if="stats.length" :items="stats" aria-label="Indicadores del paciente" />

    <PatientClinicalAlerts :background="medicalBackground" />

    <div v-if="missingCount > 0" class="patient-data-hint">
      <span>Faltan {{ missingCount }} dato(s) de filiación.</span>
      <MfButton variant="secondary" class="patient-hint-action" :to="editRoute">
        Completar ahora
      </MfButton>
    </div>

    <KeyValueGrid :fields="summaryFields" />

    <div class="patient-filiation-footer">
      <MfButton variant="secondary" :to="filiacionRoute">Ver filiación completa</MfButton>
      <MfButton variant="secondary" :to="editRoute">Editar datos</MfButton>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import type { PatientMedicalBackground } from '@medfile/types'
import type { StatStripItem } from '~/components/ui/StatStrip.vue'
import type { KeyValueField } from '~/components/ui/KeyValueGrid.vue'

defineProps<{
  patientName: string
  stats: StatStripItem[]
  summaryFields: KeyValueField[]
  missingCount: number
  filiacionRoute: string
  editRoute: string
  medicalBackground?: PatientMedicalBackground | null
}>()
</script>
