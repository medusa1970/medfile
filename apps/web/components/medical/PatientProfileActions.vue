<template>
  <section class="patient-actions" aria-label="Acciones del paciente">
    <NuxtLink
      v-if="isClinicalCapture"
      to="/cola-clinica"
      class="patient-action patient-action--primary"
    >
      <span class="patient-action__icon" aria-hidden="true">
        <MedIcon name="clipboard" size="sm" />
      </span>
      <span class="patient-action__text">
        <strong>Cola clínica</strong>
        <small>Capturar signos vitales</small>
      </span>
    </NuxtLink>

    <NuxtLink
      v-else
      :to="patientRoute(patientId, 'nueva-atencion')"
      class="patient-action patient-action--primary"
    >
      <span class="patient-action__icon" aria-hidden="true">
        <MedIcon name="clipboard" size="sm" />
      </span>
      <span class="patient-action__text">
        <strong>Nueva atención</strong>
        <small>Registrar consulta o emergencia</small>
      </span>
    </NuxtLink>

    <div v-if="!isClinicalCapture" class="patient-actions-grid">
      <NuxtLink
        v-for="action in secondaryActions"
        :key="action.to"
        :to="action.to"
        class="patient-action"
        :class="{ 'patient-action--locked': action.locked }"
      >
        <span v-if="action.badge" class="patient-action__badge">{{ action.badge }}</span>
        <span class="patient-action__icon patient-action__icon--muted" aria-hidden="true">
          <MedIcon :name="action.icon" size="sm" />
        </span>
        <span class="patient-action__text">
          <strong>{{ action.label }}</strong>
          <small v-if="action.hint">{{ action.hint }}</small>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MedIconName } from '~/components/ui/MedIcon.vue'
import { patientRoute } from '~/utils/patient-routes'

const props = defineProps<{
  patientId: string
  canShareClinical?: boolean
  sessionRole?: string
}>()

const isClinicalCapture = computed(() => props.sessionRole === 'clinical_capture')
const canShare = computed(() => props.canShareClinical ?? false)

const secondaryActions = computed(() => {
  const id = props.patientId?.trim()
  if (!id) return []

  const actions: Array<{
    to: string
    label: string
    hint?: string
    icon: MedIconName
    badge?: string
    locked?: boolean
  }> = [
    {
      to: patientRoute(id, 'solicitar-subida'),
      label: 'Solicitar subida',
      hint: 'Enlace para el paciente',
      icon: 'upload',
    },
    {
      to: patientRoute(id, 'antecedentes'),
      label: 'Antecedentes',
      hint: 'Alergias e historia',
      icon: 'folder',
    },
    {
      to: patientRoute(id, 'compartir'),
      label: 'Compartir',
      hint: canShare.value ? 'Con colega Medfile' : 'Requiere plan Pro',
      icon: 'users',
      badge: canShare.value ? undefined : 'Pro',
      locked: !canShare.value,
    },
    {
      to: patientRoute(id, 'editar'),
      label: 'Editar filiación',
      hint: 'Contacto y seguro',
      icon: 'file',
    },
  ]

  return actions
})
</script>
