<template>
  <form class="emergency-form" @submit.prevent="emit('submit')">
    <div class="emergency-form-grid">
      <section class="emergency-panel emergency-panel--atencion">
        <h3>Atencion</h3>
        <div class="form-grid-atencion">
          <label class="form-field form-field--compact">
            <span>Tipo</span>
            <select v-model="form.careType">
              <option value="">Seleccionar</option>
              <option value="private">Particular</option>
              <option value="epidemiological">Epidemiologico</option>
              <option value="soat">SOAT</option>
              <option value="other">Otros</option>
            </select>
          </label>
          <FormField v-model="form.careTypeOther" compact label="Detalle tipo" />
          <FormField v-model="form.serviceName" compact label="Servicio" />
          <FormField v-model="form.occurredAt" compact label="Fecha y hora" type="datetime-local" />
        </div>
        <div class="form-grid-2 emergency-inline-row">
          <label class="form-field form-field--compact checkbox-field">
            <span>Llegada auxiliada</span>
            <label class="inline-check"><input v-model="form.assistedArrival" type="checkbox" /> Si</label>
          </label>
          <FormField
            v-model="form.assistedBy"
            compact
            label="Auxiliado por"
            placeholder="Bomberos, familiar..."
          />
        </div>
      </section>

      <section class="emergency-panel emergency-panel--anamnesis">
        <h3>Anamnesis</h3>
        <div class="emergency-stack">
          <FormField v-model="form.reason" compact label="Motivo de consulta *" textarea :rows="2" required />
          <FormField v-model="form.presentIllness" compact label="Enfermedad actual" textarea :rows="2" />
        </div>
      </section>

      <section class="emergency-panel emergency-panel--wide">
        <h3>Signos vitales</h3>
        <div class="vitals-grid">
          <FormField v-model="form.vitalSigns.bloodPressure" compact label="PA" placeholder="120/80" />
          <FormField v-model="form.vitalSigns.heartRate" compact label="FC" type="number" placeholder="lpm" />
          <FormField v-model="form.vitalSigns.respiratoryRate" compact label="FR" type="number" placeholder="rpm" />
          <FormField v-model="form.vitalSigns.temperature" compact label="T" type="number" placeholder="C" />
          <FormField v-model="form.vitalSigns.oxygenSaturation" compact label="Sat O2" type="number" placeholder="%" />
          <FormField v-model="form.vitalSigns.weightKg" compact label="Peso" type="number" placeholder="kg" />
          <FormField v-model="form.vitalSigns.heightCm" compact label="Talla" type="number" placeholder="cm" />
        </div>
        <FormField v-model="form.physicalExamNotes" compact label="Examen fisico" textarea :rows="2" />
      </section>

      <section class="emergency-panel emergency-panel--half">
        <h3>Diagnostico</h3>
        <div class="emergency-stack">
          <FormField v-model="form.diagnosis" compact label="Impresion diagnostica" textarea :rows="2" />
          <FormField v-model="form.auxiliaryExams" compact label="Examenes auxiliares" textarea :rows="2" />
          <FormField v-model="form.treatmentPlan" compact label="Tratamiento" textarea :rows="2" />
        </div>
      </section>

      <section class="emergency-panel emergency-panel--half">
        <h3>Destino y notas</h3>
        <div class="emergency-stack">
          <label class="form-field form-field--compact">
            <span>Destino del paciente</span>
            <select v-model="form.patientDestination">
              <option value="">Seleccionar</option>
              <option value="home">Domicilio</option>
              <option value="referred">Referido</option>
              <option value="observation">Observacion</option>
              <option value="interconsultation">Interconsulta</option>
              <option value="external_followup">Consulta externa</option>
              <option value="absconded">Fuga</option>
              <option value="death">Defuncion</option>
            </select>
          </label>
          <FormField v-model="form.referralFacility" compact label="Referido a" />
          <FormField v-model="form.responsiblePhysicianName" compact label="Medico responsable" />
          <FormField v-model="form.companionName" compact label="Acompanante" />
          <FormField v-model="form.notes" compact label="Notas adicionales" textarea :rows="2" />
        </div>
      </section>

      <section class="emergency-panel emergency-panel--wide">
        <h3>Observacion y alta</h3>
        <div class="form-grid-4">
          <FormField v-model="form.observationAdmissionAt" compact label="Ingreso observacion" type="datetime-local" />
          <FormField v-model="form.observationRoom" compact label="Sala" placeholder="Emergencia" />
          <FormField v-model="form.dischargedAt" compact label="Fecha egreso" type="datetime-local" />
          <FormField v-model="form.responsibleFamilyDocumentId" compact label="CI familiar" />
        </div>
        <div class="form-grid-2">
          <FormField v-model="form.responsibleFamilyName" compact label="Familiar responsable" />
          <FormField v-model="form.dischargeDiagnosis" compact label="Diagnostico de alta" />
        </div>
        <div class="form-grid-2">
          <FormField v-model="form.evolutionNotes" compact label="Evolucion" textarea :rows="2" />
          <FormField v-model="form.notesToFamily" compact label="Indicaciones al familiar" textarea :rows="2" />
        </div>
      </section>
    </div>

    <footer class="emergency-form-footer">
      <p v-if="error" class="form-error">{{ error }}</p>
      <MfButton type="submit">{{ loading ? 'Guardando...' : 'Guardar atencion de emergencia' }}</MfButton>
    </footer>
  </form>
</template>

<script setup lang="ts">
import type { CareType, PatientDestination } from '@medfile/types'

export interface EmergencyEncounterFormValue {
  template: 'emergency'
  occurredAt: string
  careType: CareType | ''
  careTypeOther: string
  serviceName: string
  assistedArrival: boolean
  assistedBy: string
  reason: string
  presentIllness: string
  diagnosis: string
  treatmentPlan: string
  notes: string
  physicalExamNotes: string
  auxiliaryExams: string
  companionName: string
  patientDestination: PatientDestination | ''
  referralFacility: string
  responsiblePhysicianName: string
  observationAdmissionAt: string
  observationRoom: string
  evolutionNotes: string
  dischargeDiagnosis: string
  dischargedAt: string
  notesToFamily: string
  responsibleFamilyName: string
  responsibleFamilyDocumentId: string
  vitalSigns: {
    bloodPressure?: string
    heartRate?: string | number
    respiratoryRate?: string | number
    temperature?: string | number
    oxygenSaturation?: string | number
    weightKg?: string | number
    heightCm?: string | number
  }
}

defineProps<{
  modelValue: EmergencyEncounterFormValue
  loading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  submit: []
}>()

const form = defineModel<EmergencyEncounterFormValue>({ required: true })
</script>
