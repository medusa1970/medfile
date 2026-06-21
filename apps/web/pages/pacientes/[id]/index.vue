<template>
  <div class="dashboard-page patient-profile-page">
    <section class="patient-profile-top" aria-label="Resumen del paciente">
      <PatientFiliationCard
        :patient-name="patient.fullName"
        :stats="profileStats"
        :summary-fields="keyFiliationFields"
        :missing-count="missingFiliationCount"
        :filiacion-route="routes.filiacion"
        :edit-route="routes.editar"
        :medical-background="patientMedicalBackground"
      />
    </section>

    <PatientProfileActions
      :patient-id="patientId"
      :can-share-clinical="canShareClinical"
      :session-role="sessionRole"
    />

    <AddToQueueCard
      v-if="canAddToQueue"
      :patient-id="patientId"
      @added="onQueueAdded"
    />

    <NursingVitalsPanel
      v-if="canViewNursing"
      ref="nursingPanelRef"
      :patient-id="patientId"
      :enabled="canViewNursing"
    />

    <section v-if="!isClinicalCapture" class="patient-section" aria-label="Timeline clínico">
      <PanelCard
        title="Timeline clínico"
        :badge="encounters.length ? `${encounters.length} eventos` : undefined"
        padded
        class="patient-panel-compact"
      >
        <div v-if="loadError" class="form-error patient-list-notice">
          No se pudo conectar al API. Mostrando historia clínica de ejemplo.
        </div>

        <p v-else-if="encounters.length === 0" class="panel-empty panel-empty--compact">
          Sin atenciones aún.
          <MfButton variant="ghost" class="patient-inline-action" :to="routes.nuevaAtencion">
            Registrar la primera
          </MfButton>
        </p>

        <div v-else class="timeline-list">
          <article v-for="encounter in encounters" :key="encounter.id" class="timeline-card timeline-card--compact">
            <div class="timeline-meta">
              <StatusBadge>{{ formatDateTime(encounter.occurredAt) }}</StatusBadge>
              <StatusBadge v-if="encounter.template === 'emergency'" tone="warning">Emergencia</StatusBadge>
              <StatusBadge v-if="encounter.patientDestination">
                {{ formatDestination(encounter.patientDestination) }}
              </StatusBadge>
            </div>
            <h3>{{ encounter.reason }}</h3>
            <p v-if="encounter.diagnosis"><strong>Dx:</strong> {{ encounter.diagnosis }}</p>
            <p v-if="encounter.presentIllness"><strong>EA:</strong> {{ encounter.presentIllness }}</p>
          </article>
        </div>
      </PanelCard>
    </section>

    <section v-if="!isClinicalCapture" class="patient-section" aria-label="Documentos médicos">
      <PanelCard title="Documentos médicos" padded class="patient-panel-compact patient-documents-panel">
        <div class="panel-toolbar">
          <span class="panel-toolbar__meta">
            {{ documents.length }} {{ documents.length === 1 ? 'archivo' : 'archivos' }}
            <template v-if="pendingDocuments > 0">
              · <strong class="panel-toolbar__emphasis">{{ pendingDocuments }} por revisar</strong>
            </template>
          </span>
          <MfButton variant="ghost" class="panel-toolbar__link-btn" :to="routes.solicitarSubida">
            Solicitar subida
          </MfButton>
        </div>

        <DocumentList
          compact
          :documents="documents"
          :error="documentsLoadError"
          empty-message="Sin documentos. Crea un enlace para que el paciente suba exámenes."
        />
      </PanelCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { PatientDestination } from '@medfile/types'
import { normalizePlanCode, subscriptionPlans } from '@medfile/types/plans'
import type { StatStripItem } from '~/components/ui/StatStrip.vue'
import { normalizeDocument, type MedicalDocumentItem } from '~/utils/medical-documents'
import {
  buildKeyFiliationFields,
  calculatePatientAge,
  countMissingFiliationFields,
} from '~/utils/patient-filiation'
import type { PatientDetail, PatientStatus } from '~/composables/usePatientPage'

definePageMeta({
  layout: 'doctor',
  ssr: false,
})

type BadgeTone = '' | 'warning' | 'danger' | 'success'

interface EncounterItem {
  id: string
  _id?: string
  template?: 'general' | 'emergency'
  occurredAt: string
  reason: string
  presentIllness?: string
  diagnosis?: string
  patientDestination?: PatientDestination
}

const { patientId, routes, fetchPatient, normalizePatient } = usePatientPage()
const { apiFetch } = useMedfileApi()
const loadError = ref(false)
const documentsLoadError = ref('')
const planCode = ref('free')
const sessionRole = ref('owner')
const canViewNursing = ref(false)
const nursingPanelRef = ref<{ refresh: () => Promise<void> } | null>(null)

const isClinicalCapture = computed(() => sessionRole.value === 'clinical_capture')

const canAddToQueue = computed(() => {
  if (isClinicalCapture.value) return false
  const plan = subscriptionPlans.find((item) => item.code === planCode.value)
  return plan?.capabilities.clinicalCaptureUsers ?? false
})

const fallbackPatient: PatientDetail = {
  id: patientId.value,
  fullName: 'Paciente demo',
  documentId: 'P-Demo',
  birthDate: '1962-11-30',
  phone: '+591 70000000',
  status: 'active',
  medicalBackground: {},
}

const { data: patientData } = await useAsyncData(
  () => `patient-${patientId.value}`,
  async () => {
    try {
      return await fetchPatient()
    } catch {
      loadError.value = true
      return fallbackPatient
    }
  },
  { server: false, watch: [patientId] },
)

const { data: encounterData } = await useAsyncData(
  () => `encounters-${patientId.value}`,
  async () => {
    if (!patientId.value) return [] as EncounterItem[]

    try {
      return await apiFetch<EncounterItem[]>('/api/encounters', {
        query: { patientId: patientId.value },
      })
    } catch {
      loadError.value = true
      return [] as EncounterItem[]
    }
  },
  { server: false, watch: [patientId] },
)

const { data: documentData } = await useAsyncData(
  () => `documents-${patientId.value}`,
  async () => {
    if (!patientId.value) return [] as MedicalDocumentItem[]

    try {
      return await apiFetch<MedicalDocumentItem[]>('/api/documents', {
        query: { patientId: patientId.value },
      })
    } catch {
      documentsLoadError.value = 'No se pudieron cargar los documentos del paciente.'
      return [] as MedicalDocumentItem[]
    }
  },
  { server: false, watch: [patientId] },
)

onMounted(async () => {
  try {
    const me = await apiFetch<{
      user: { role?: string }
      subscription?: { planCode: string; plan?: { capabilities: { clinicalCaptureUsers: boolean } } }
    }>('/api/auth/me')
    sessionRole.value = me.user.role ?? 'owner'
    planCode.value = normalizePlanCode(me.subscription?.planCode ?? 'free')
    canViewNursing.value = me.subscription?.plan?.capabilities.clinicalCaptureUsers ?? false
  } catch {
    planCode.value = 'free'
  }
})

function onQueueAdded() {
  void nursingPanelRef.value?.refresh()
}

const patient = computed(() => normalizePatient(patientData.value as PatientDetail | null) ?? fallbackPatient)
const patientMedicalBackground = computed(() => patient.value.medicalBackground ?? {})
const encounters = computed(() =>
  (encounterData.value ?? []).map((item) => ({
    ...item,
    id: item.id || item._id || `${item.occurredAt}-${item.reason}`,
  })),
)
const documents = computed(() => (documentData.value ?? []).map(normalizeDocument))
const pendingDocuments = computed(
  () => documents.value.filter((doc) => doc.status === 'pending_review' || doc.status === 'received').length,
)
const statusNote = computed(() => (patient.value.status === 'critical' ? 'prioridad' : 'actual'))
const patientAge = computed(() => calculatePatientAge(patient.value.birthDate))

const canShareClinical = computed(() => {
  const plan = subscriptionPlans.find((item) => item.code === planCode.value)
  return plan?.capabilities.clinicalShare ?? false
})

const keyFiliationFields = computed(() => buildKeyFiliationFields(patient.value))
const missingFiliationCount = computed(() => countMissingFiliationFields(patient.value))

const profileStats = computed<StatStripItem[]>(() => [
  {
    label: 'Estado',
    value: getStatusLabel(patient.value.status),
    badge: statusNote.value,
    badgeTone: getStatusTone(patient.value.status),
  },
  {
    label: 'Edad',
    value: patientAge.value,
  },
  {
    label: 'Consultas',
    value: String(encounters.value.length),
  },
  {
    label: 'Documentos',
    value: String(documents.value.length),
    badge: pendingDocuments.value > 0 ? `${pendingDocuments.value} revisar` : undefined,
    badgeTone: pendingDocuments.value > 0 ? 'warning' : '',
  },
])

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

function formatDestination(value: PatientDestination) {
  const labels: Record<PatientDestination, string> = {
    home: 'Domicilio',
    referred: 'Referido',
    death: 'Defunción',
    external_followup: 'Consulta ext.',
    absconded: 'Fuga',
    observation: 'Observación',
    interconsultation: 'Interconsulta',
  }
  return labels[value]
}

function getStatusLabel(status: PatientStatus) {
  const labels: Record<PatientStatus, string> = {
    active: 'Activo',
    follow_up: 'Seguimiento',
    critical: 'Crítico',
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

<style scoped>
.patient-inline-action {
  display: inline-flex;
  min-height: 36px;
  padding: 0 8px;
  color: var(--mf-teal-600);
  font-size: 13px;
  font-weight: 700;
}

.panel-toolbar__link-btn {
  min-height: 36px;
  padding: 0 8px;
  color: var(--mf-teal-600);
  font-size: 13px;
  font-weight: 700;
}
</style>
