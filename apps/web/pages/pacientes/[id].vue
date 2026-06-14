<template>
  <DoctorShell>
    <div class="patient-profile-page">
      <header class="app-header patient-profile-header">
        <div>
          <EyebrowPill>Historia clinica</EyebrowPill>
          <h1>{{ patient.fullName }}</h1>
          <p>{{ patientSubtitle }}</p>
        </div>
        <MfButton variant="secondary" to="/pacientes">Volver a pacientes</MfButton>
      </header>

      <div class="patient-profile-body">
        <section class="patient-profile-top" aria-label="Resumen y filiacion">
          <PanelCard title="Filiacion y contacto" padded>
            <div class="patient-summary-strip" aria-label="Resumen del paciente">
              <div class="patient-stat">
                <span>Estado</span>
                <strong>{{ getStatusLabel(patient.status) }}</strong>
                <StatusBadge :tone="getStatusTone(patient.status)">{{ statusNote }}</StatusBadge>
              </div>
              <div class="patient-stat">
                <span>Consultas</span>
                <strong>{{ encounters.length }}</strong>
              </div>
              <div class="patient-stat">
                <span>Edad</span>
                <strong>{{ patientAge }}</strong>
              </div>
              <div class="patient-stat">
                <span>Documentos</span>
                <strong>{{ documents.length }}</strong>
                <StatusBadge v-if="pendingDocuments > 0" tone="warning">{{ pendingDocuments }} revisar</StatusBadge>
              </div>
            </div>

            <div class="patient-data-grid">
              <div class="patient-data-item">
                <span class="patient-data-label">Documento</span>
                <span class="patient-data-value">{{ patient.documentId || 'No registrado' }}</span>
              </div>
              <div class="patient-data-item">
                <span class="patient-data-label">Sexo</span>
                <span class="patient-data-value">{{ formatSex(patient.sex) }}</span>
              </div>
              <div class="patient-data-item">
                <span class="patient-data-label">Nacimiento</span>
                <span class="patient-data-value">{{ formatDate(patient.birthDate) }}</span>
              </div>
              <div class="patient-data-item">
                <span class="patient-data-label">Tutor / padre</span>
                <span class="patient-data-value">{{ patient.guardianName || 'No registrado' }}</span>
              </div>
              <div class="patient-data-item">
                <span class="patient-data-label">Telefono</span>
                <span class="patient-data-value">{{ patient.phone || 'No registrado' }}</span>
              </div>
              <div class="patient-data-item">
                <span class="patient-data-label">Seguro</span>
                <span class="patient-data-value">{{ patient.insuranceName || 'No registrado' }}</span>
              </div>
              <div class="patient-data-item">
                <span class="patient-data-label">Emergencia</span>
                <span class="patient-data-value">{{ patient.emergencyContactName || 'No registrado' }}</span>
              </div>
              <div class="patient-data-item patient-data-item--wide">
                <span class="patient-data-label">Domicilio</span>
                <span class="patient-data-value">{{ formatAddress(patient.address) }}</span>
              </div>
            </div>
          </PanelCard>
        </section>

        <section class="patient-background-section" aria-label="Antecedentes medicos">
          <PanelCard title="Antecedentes medicos" padded>
            <PatientBackgroundForm
              :model-value="patientMedicalBackground"
              compact
              :loading="savingBackground"
              :saved="backgroundSaved"
              :error="backgroundError"
              @submit="saveBackground"
            />
          </PanelCard>
        </section>

        <section class="patient-share-section" aria-label="Compartir historial">
          <ShareWithColleagueForm :patient-id="patientId" />
        </section>

        <section class="patient-documents-section" aria-label="Documentos medicos">
          <PanelCard title="Documentos medicos" :badge="`${documents.length} archivos`">
            <div class="patient-documents-grid">
              <div class="patient-documents-panel">
                <h3 class="patient-documents-subtitle">Archivos del paciente</h3>
                <DocumentList
                  :documents="documents"
                  :error="documentsLoadError"
                  empty-message="Aun no hay documentos para este paciente."
                />
              </div>

              <div class="patient-documents-panel">
                <h3 class="patient-documents-subtitle">Solicitar subida</h3>
                <UploadRequestForm
                  :patient-id="patientId"
                  :patient-name="patient.fullName"
                  :patient-phone="patient.phone"
                  compact
                  :loading="creatingRequest"
                  :error="requestError"
                  :created-link="createdLink"
                  @submit="createUploadRequest"
                />
              </div>
            </div>
          </PanelCard>
        </section>

        <section class="section compact-section">
          <PanelCard title="Nueva atencion de emergencia" padded>
            <EmergencyEncounterForm
              v-model="encounterForm"
              :loading="savingEncounter"
              :error="encounterError"
              @submit="createEncounter"
            />
          </PanelCard>
        </section>

        <section class="section compact-section">
          <PanelCard title="Timeline clinico" :badge="`${encounters.length} eventos`">
            <div v-if="loadError" class="form-error patient-list-notice">
              No se pudo conectar al API. Mostrando historia clinica de ejemplo.
            </div>

            <p v-else-if="encounters.length === 0" class="panel-empty">
              Aun no hay atenciones registradas para este paciente.
            </p>

            <article v-for="encounter in encounters" :key="encounter.id" class="timeline-card">
              <div>
                <div class="timeline-meta">
                  <StatusBadge>{{ formatDateTime(encounter.occurredAt) }}</StatusBadge>
                  <StatusBadge v-if="encounter.template === 'emergency'" tone="warning">Emergencia</StatusBadge>
                  <StatusBadge v-if="encounter.patientDestination">
                    {{ formatDestination(encounter.patientDestination) }}
                  </StatusBadge>
                </div>
                <h3>{{ encounter.reason }}</h3>
                <p v-if="encounter.presentIllness"><strong>Enfermedad actual:</strong> {{ encounter.presentIllness }}</p>
                <p v-if="encounter.diagnosis"><strong>Diagnostico:</strong> {{ encounter.diagnosis }}</p>
                <p v-if="encounter.treatmentPlan"><strong>Tratamiento:</strong> {{ encounter.treatmentPlan }}</p>
                <p v-if="encounter.auxiliaryExams"><strong>Examenes:</strong> {{ encounter.auxiliaryExams }}</p>
                <p v-if="encounter.vitalSigns"><strong>Signos vitales:</strong> {{ formatVitals(encounter.vitalSigns) }}</p>
                <p v-if="encounter.evolutionNotes"><strong>Evolucion:</strong> {{ encounter.evolutionNotes }}</p>
              </div>
            </article>
          </PanelCard>
        </section>
      </div>
    </div>
  </DoctorShell>
</template>

<script setup lang="ts">
import type {
  PatientAddress,
  PatientDestination,
  PatientMedicalBackground,
  VitalSigns,
} from '@medfile/types'
import type { EmergencyEncounterFormValue } from '~/components/medical/EmergencyEncounterForm.vue'
import {
  normalizeDocument,
  type MedicalDocumentItem,
  type UploadRequestResult,
} from '~/utils/medical-documents'

type PatientStatus = 'active' | 'follow_up' | 'critical' | 'archived'
type BadgeTone = '' | 'warning' | 'danger' | 'success'

interface PatientDetail {
  id: string
  _id?: string
  fullName: string
  documentId?: string
  sex?: 'male' | 'female' | 'other'
  birthDate?: string
  guardianName?: string
  address?: PatientAddress
  phone?: string
  email?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  insuranceName?: string
  policyNumber?: string
  status: PatientStatus
  activeAlerts?: string[]
  medicalBackground?: PatientMedicalBackground
}

interface EncounterItem {
  id: string
  _id?: string
  template?: 'general' | 'emergency'
  occurredAt: string
  reason: string
  presentIllness?: string
  diagnosis?: string
  treatmentPlan?: string
  notes?: string
  auxiliaryExams?: string
  evolutionNotes?: string
  patientDestination?: PatientDestination
  vitalSigns?: VitalSigns
}

const route = useRoute()
const { apiFetch } = useMedfileApi()
const patientId = computed(() => String(route.params.id ?? ''))
const loadError = ref(false)
const documentsLoadError = ref('')
const encounterError = ref('')
const backgroundError = ref('')
const requestError = ref('')
const creatingRequest = ref(false)
const createdLink = ref('')
const savingEncounter = ref(false)
const savingBackground = ref(false)
const backgroundSaved = ref(false)

const EMPTY_MEDICAL_BACKGROUND: PatientMedicalBackground = {}

const encounterForm = ref<EmergencyEncounterFormValue>(createEmptyEmergencyForm())

const fallbackPatient: PatientDetail = {
  id: patientId.value,
  fullName: 'Paciente demo',
  documentId: 'P-Demo',
  birthDate: '1962-11-30',
  phone: '+1 (809) 555-0301',
  status: 'active',
  medicalBackground: {},
}

const { data: patientData, refresh: refreshPatient } = await useAsyncData(
  `patient-${patientId.value}`,
  async () => {
    if (!patientId.value || patientId.value === 'undefined') {
      await navigateTo('/pacientes')
      return null
    }

    try {
      return await apiFetch<PatientDetail>(`/api/patients/${patientId.value}`)
    } catch {
      loadError.value = true
      return fallbackPatient
    }
  },
  { server: false },
)

const { data: encounterData, refresh: refreshEncounters } = await useAsyncData(
  `encounters-${patientId.value}`,
  async () => {
    if (!patientId.value || patientId.value === 'undefined') {
      return [] as EncounterItem[]
    }

    try {
      return await apiFetch<EncounterItem[]>('/api/encounters', {
        query: { patientId: patientId.value },
      })
    } catch {
      loadError.value = true
      return [] as EncounterItem[]
    }
  },
  { server: false },
)

const { data: documentData, refresh: refreshDocuments } = await useAsyncData(
  `documents-${patientId.value}`,
  async () => {
    if (!patientId.value || patientId.value === 'undefined') {
      return [] as MedicalDocumentItem[]
    }

    try {
      return await apiFetch<MedicalDocumentItem[]>('/api/documents', {
        query: { patientId: patientId.value },
      })
    } catch {
      documentsLoadError.value = 'No se pudieron cargar los documentos del paciente.'
      return [] as MedicalDocumentItem[]
    }
  },
  { server: false },
)

const patient = computed(() => {
  const value = patientData.value
  if (!value) return fallbackPatient
  return normalizePatient(value)
})

const patientMedicalBackground = computed(
  () => patient.value.medicalBackground ?? EMPTY_MEDICAL_BACKGROUND,
)
const encounters = computed(() => (encounterData.value ?? []).map(normalizeEncounter))
const documents = computed(() => (documentData.value ?? []).map(normalizeDocument))
const pendingDocuments = computed(
  () => documents.value.filter((doc) => doc.status === 'pending_review' || doc.status === 'received').length,
)
const statusNote = computed(() => (patient.value.status === 'critical' ? 'prioridad' : 'actual'))
const patientAge = computed(() => calculateAge(patient.value.birthDate))
const patientSubtitle = computed(() => {
  const parts = [patient.value.phone, patient.value.email, formatAddress(patient.value.address)]
    .filter((part) => part && part !== 'No registrado')
  return parts.join(' · ') || 'Sin contacto registrado'
})

async function createUploadRequest(payload: { patientId: string; title: string; instructions: string }) {
  requestError.value = ''
  createdLink.value = ''
  creatingRequest.value = true

  try {
    const response = await apiFetch<UploadRequestResult>('/api/documents/upload-requests', {
      method: 'POST',
      body: payload,
    })

    createdLink.value = `/paciente/subir?token=${response.token}`
    await refreshDocuments()
  } catch {
    requestError.value = 'No pudimos crear la solicitud de subida.'
  } finally {
    creatingRequest.value = false
  }
}

async function saveBackground(medicalBackground: PatientMedicalBackground) {
  backgroundError.value = ''
  backgroundSaved.value = false
  savingBackground.value = true

  try {
    await apiFetch(`/api/patients/${patientId.value}`, {
      method: 'PATCH',
      body: { medicalBackground },
    })
    backgroundSaved.value = true
    await refreshPatient()
  } catch {
    backgroundError.value = 'No pudimos guardar los antecedentes.'
  } finally {
    savingBackground.value = false
  }
}

async function createEncounter() {
  encounterError.value = ''

  const reason = encounterForm.value.reason.trim()
  if (reason.length < 2) {
    encounterError.value = 'El motivo de consulta es obligatorio (minimo 2 caracteres).'
    return
  }

  savingEncounter.value = true

  try {
    await apiFetch('/api/encounters', {
      method: 'POST',
      body: {
        patientId: patientId.value,
        ...serializeEncounterForm(encounterForm.value),
      },
    })

    encounterForm.value = createEmptyEmergencyForm()
    await refreshEncounters()
  } catch (err) {
    encounterError.value = getApiErrorMessage(
      err,
      'No pudimos guardar la atencion. Verifica que el API y MongoDB esten disponibles.',
    )
  } finally {
    savingEncounter.value = false
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
    patientDestination: form.patientDestination || undefined,
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

function normalizePatient(input: PatientDetail): PatientDetail {
  return {
    ...input,
    id: input.id || input._id || patientId.value,
    medicalBackground: input.medicalBackground ?? {},
  }
}

function normalizeEncounter(input: EncounterItem): EncounterItem {
  return {
    ...input,
    id: input.id || input._id || `${input.occurredAt}-${input.reason}`,
  }
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

function formatDate(value?: string) {
  if (!value) return 'No registrado'
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(value?: string) {
  if (!value) return 'Sin fecha'
  return new Date(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatSex(value?: PatientDetail['sex']) {
  if (value === 'male') return 'Masculino'
  if (value === 'female') return 'Femenino'
  if (value === 'other') return 'Otro'
  return 'No registrado'
}

function formatAddress(address?: PatientAddress) {
  if (!address) return 'No registrado'
  return [
    address.streetAddress,
    address.locality,
    address.district,
    address.province,
    address.department,
  ]
    .filter(Boolean)
    .join(', ') || 'No registrado'
}

function formatDestination(value: PatientDestination) {
  const labels: Record<PatientDestination, string> = {
    home: 'Domicilio',
    referred: 'Referido',
    death: 'Defuncion',
    external_followup: 'Consulta ext.',
    absconded: 'Fuga',
    observation: 'Observacion',
    interconsultation: 'Interconsulta',
  }
  return labels[value]
}

function formatVitals(vitals: VitalSigns) {
  return [
    vitals.bloodPressure ? `PA ${vitals.bloodPressure}` : '',
    vitals.heartRate ? `FC ${vitals.heartRate}` : '',
    vitals.respiratoryRate ? `FR ${vitals.respiratoryRate}` : '',
    vitals.temperature ? `T ${vitals.temperature}C` : '',
    vitals.oxygenSaturation ? `Sat ${vitals.oxygenSaturation}%` : '',
  ]
    .filter(Boolean)
    .join(' · ')
}

function calculateAge(birthDate?: string) {
  if (!birthDate) return 'N/D'
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return String(age)
}

function getStatusLabel(status: PatientStatus) {
  const labels: Record<PatientStatus, string> = {
    active: 'Activo',
    follow_up: 'Seguimiento',
    critical: 'Critico',
    archived: 'Archivado',
  }
  return labels[status]
}

function getStatusTone(status: PatientStatus): BadgeTone {
  if (status === 'critical') return 'danger'
  if (status === 'follow_up') return 'warning'
  return ''
}
</script>
