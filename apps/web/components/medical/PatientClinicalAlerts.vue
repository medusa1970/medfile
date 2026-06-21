<template>
  <div v-if="highlights.length" class="patient-clinical-alerts" role="status">
    <p class="patient-clinical-alerts__title">Alertas clínicas</p>
    <ul class="patient-clinical-alerts__list">
      <li
        v-for="item in highlights"
        :key="item.label"
        class="patient-clinical-alert"
        :class="item.tone ? `patient-clinical-alert--${item.tone}` : undefined"
      >
        <strong>{{ item.label }}</strong>
        <span>{{ item.detail }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { PatientMedicalBackground } from '@medfile/types'
import { getPatientClinicalHighlights } from '~/utils/patient-clinical-highlights'

const props = defineProps<{
  background?: PatientMedicalBackground | null
}>()

const highlights = computed(() => getPatientClinicalHighlights(props.background))
</script>

<style scoped>
.patient-clinical-alerts {
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid rgb(245 158 11 / 0.28);
  border-radius: 14px;
  background: rgb(255 251 235 / 0.72);
}

.patient-clinical-alerts__title {
  margin: 0 0 8px;
  color: var(--mf-slate-700);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.patient-clinical-alerts__list {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.patient-clinical-alert {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 14px;
  line-height: 1.4;
}

.patient-clinical-alert strong {
  color: var(--mf-navy-900);
}

.patient-clinical-alert span {
  color: var(--mf-slate-700);
}

.patient-clinical-alert--danger {
  color: var(--mf-navy-900);
}

.patient-clinical-alert--danger strong {
  color: rgb(185 28 28);
}
</style>
