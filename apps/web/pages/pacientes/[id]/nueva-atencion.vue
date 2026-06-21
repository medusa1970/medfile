<template>
  <div class="dashboard-page patient-subpage">
      <header class="dashboard-topbar">
        <div class="dashboard-topbar__main">
          <EyebrowPill>Atención clínica</EyebrowPill>
          <h1 class="dashboard-topbar__title">Nueva atención</h1>
          <p class="dashboard-topbar__lead">{{ patientName }} — registro de consulta o emergencia.</p>
        </div>
      </header>

      <PanelCard title="Formulario de atención" padded>
        <EmergencyEncounterForm
          v-model="encounterForm"
          :loading="saving"
          :error="error"
          @submit="createEncounter"
        />
      </PanelCard>
    </div>
</template>

<script setup lang="ts">
import type { EmergencyEncounterFormValue } from '~/components/medical/EmergencyEncounterForm.vue'
import type { PatientDestination, VitalSigns } from '@medfile/types'

definePageMeta({ layout: 'doctor', ssr: false })

const router = useRouter()
const { apiFetch } = useMedfileApi()
const { patientId, refreshPatientCaches } = usePatientPage()

const patientName = ref('Paciente')
const saving = ref(false)
const error = ref('')
const encounterForm = ref<EmergencyEncounterFormValue>(createEmptyEmergencyForm())

onMounted(async () => {
  if (!patientId.value) {
    await navigateTo('/pacientes')
    return
  }

  try {
    const patient = await apiFetch<{ fullName: string }>(`/api/patients/${patientId.value}`)
    patientName.value = patient.fullName
  } catch {
    patientName.value = 'Paciente'
  }
})

async function createEncounter() {
  error.value = ''
  const reason = encounterForm.value.reason.trim()
  if (reason.length < 2) {
    error.value = 'El motivo de consulta es obligatorio (mínimo 2 caracteres).'
    return
  }

  saving.value = true
  try {
    await apiFetch('/api/encounters', {
      method: 'POST',
      body: {
        patientId: patientId.value,
        ...serializeEncounterForm(encounterForm.value),
      },
    })
    await refreshPatientCaches()
    await router.push(`/pacientes/${patientId.value}`)
  } catch (err) {
    error.value = getApiErrorMessage(
      err,
      'No pudimos guardar la atención. Verifica que el API esté disponible.',
    )
  } finally {
    saving.value = false
  }
}

function createEmptyEmergencyForm(): EmergencyEncounterFormValue {
  return {
    template: 'emergency',
    occurredAt: toLocalDateTimeInput(new Date()),
    careType: '',
    careTypeOther: '',
    serviceName: '',
    assistedArrival: false,
    assistedBy: '',
    reason: '',
    presentIllness: '',
    diagnosis: '',
    treatmentPlan: '',
    notes: '',
    physicalExamNotes: '',
    auxiliaryExams: '',
    companionName: '',
    patientDestination: '',
    referralFacility: '',
    responsiblePhysicianName: '',
    observationAdmissionAt: '',
    observationRoom: '',
    evolutionNotes: '',
    dischargeDiagnosis: '',
    dischargedAt: '',
    notesToFamily: '',
    responsibleFamilyName: '',
    responsibleFamilyDocumentId: '',
    vitalSigns: {},
  }
}

function serializeEncounterForm(form: EmergencyEncounterFormValue) {
  const vitalSigns = buildVitalSigns(form.vitalSigns)
  return {
    template: form.template,
    occurredAt: form.occurredAt ? new Date(form.occurredAt).toISOString() : undefined,
    careType: form.careType || undefined,
    careTypeOther: form.careTypeOther.trim() || undefined,
    serviceName: form.serviceName.trim() || undefined,
    assistedArrival: form.assistedArrival,
    assistedBy: form.assistedBy.trim() || undefined,
    reason: form.reason.trim(),
    presentIllness: form.presentIllness.trim() || undefined,
    diagnosis: form.diagnosis.trim() || undefined,
    treatmentPlan: form.treatmentPlan.trim() || undefined,
    notes: form.notes.trim() || undefined,
    physicalExamNotes: form.physicalExamNotes.trim() || undefined,
    auxiliaryExams: form.auxiliaryExams.trim() || undefined,
    companionName: form.companionName.trim() || undefined,
    patientDestination: (form.patientDestination || undefined) as PatientDestination | undefined,
    referralFacility: form.referralFacility.trim() || undefined,
    responsiblePhysicianName: form.responsiblePhysicianName.trim() || undefined,
    observationAdmissionAt: form.observationAdmissionAt
      ? new Date(form.observationAdmissionAt).toISOString()
      : undefined,
    observationRoom: form.observationRoom.trim() || undefined,
    evolutionNotes: form.evolutionNotes.trim() || undefined,
    dischargeDiagnosis: form.dischargeDiagnosis.trim() || undefined,
    dischargedAt: form.dischargedAt ? new Date(form.dischargedAt).toISOString() : undefined,
    notesToFamily: form.notesToFamily.trim() || undefined,
    responsibleFamilyName: form.responsibleFamilyName.trim() || undefined,
    responsibleFamilyDocumentId: form.responsibleFamilyDocumentId.trim() || undefined,
    ...(vitalSigns ? { vitalSigns } : {}),
  }
}

function buildVitalSigns(vitals: EmergencyEncounterFormValue['vitalSigns']) {
  const result = {
    bloodPressure: vitals.bloodPressure?.trim() || undefined,
    heartRate: toNumber(vitals.heartRate),
    respiratoryRate: toNumber(vitals.respiratoryRate),
    temperature: toNumber(vitals.temperature),
    oxygenSaturation: toNumber(vitals.oxygenSaturation),
    weightKg: toNumber(vitals.weightKg),
    heightCm: toNumber(vitals.heightCm),
  }
  return Object.values(result).some((value) => value !== undefined) ? result : undefined
}

function toNumber(value: string | number | undefined) {
  if (value === '' || value == null) return undefined
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}

function toLocalDateTimeInput(value: Date) {
  const offset = value.getTimezoneOffset()
  const local = new Date(value.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}
</script>
