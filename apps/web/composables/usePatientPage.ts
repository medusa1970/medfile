import type { PatientAddress, PatientMedicalBackground } from '@medfile/types'
import { invalidatePatientCaches } from '~/utils/patient-cache'
import { patientRoute } from '~/utils/patient-routes'

export type PatientStatus = 'active' | 'follow_up' | 'critical' | 'archived'

export interface PatientDetail {
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
  medicalBackground?: PatientMedicalBackground
}

export function usePatientPage() {
  const route = useRoute()
  const { apiFetch } = useMedfileApi()

  const patientId = computed(() => String(route.params.id ?? ''))
  const routes = computed(() => ({
    profile: patientRoute(patientId.value),
    filiacion: patientRoute(patientId.value, 'filiacion'),
    editar: patientRoute(patientId.value, 'editar'),
    antecedentes: patientRoute(patientId.value, 'antecedentes'),
    nuevaAtencion: patientRoute(patientId.value, 'nueva-atencion'),
    solicitarSubida: patientRoute(patientId.value, 'solicitar-subida'),
    compartir: patientRoute(patientId.value, 'compartir'),
  }))

  async function ensurePatientId() {
    if (!patientId.value || patientId.value === 'undefined') {
      await navigateTo('/pacientes')
      return false
    }

    return true
  }

  async function fetchPatient() {
    if (!(await ensurePatientId())) return null

    return apiFetch<PatientDetail>(`/api/patients/${patientId.value}`)
  }

  function normalizePatient(value: PatientDetail | null | undefined): PatientDetail | null {
    if (!value) return null

    return {
      ...value,
      id: value.id || value._id || patientId.value,
      medicalBackground: value.medicalBackground ?? {},
    }
  }

  async function refreshPatientCaches() {
    if (!patientId.value) return
    await invalidatePatientCaches(patientId.value)
  }

  return {
    patientId,
    routes,
    ensurePatientId,
    fetchPatient,
    normalizePatient,
    refreshPatientCaches,
  }
}
