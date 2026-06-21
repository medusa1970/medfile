import type { PatientAddress } from '@medfile/types'
import type { KeyValueField } from '~/components/ui/KeyValueGrid.vue'

export interface PatientFiliationSource {
  documentId?: string
  sex?: 'male' | 'female' | 'other' | string
  birthDate?: string
  guardianName?: string
  address?: PatientAddress
  phone?: string
  email?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  insuranceName?: string
  policyNumber?: string
}

export function formatPatientAddress(address?: PatientAddress) {
  if (!address) return 'No registrado'

  return (
    [
      address.streetAddress,
      address.locality,
      address.district,
      address.province,
      address.department,
    ]
      .filter(Boolean)
      .join(', ') || 'No registrado'
  )
}

export function formatPatientSex(value?: PatientFiliationSource['sex']) {
  if (value === 'male') return 'Masculino'
  if (value === 'female') return 'Femenino'
  if (value === 'other') return 'Otro'
  return 'Sin registrar'
}

export function formatPatientBirthDate(value?: string) {
  if (!value) return 'Sin registrar'

  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function calculatePatientAge(birthDate?: string) {
  if (!birthDate) return 'N/D'

  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return String(age)
}

function displayField(value?: string) {
  return value?.trim() || 'Sin registrar'
}

function isMissingField(value?: string) {
  return !value?.trim()
}

export function countMissingFiliationFields(patient: PatientFiliationSource) {
  const addressDisplay = formatPatientAddress(patient.address)
  const fields = [
    patient.documentId,
    patient.sex,
    patient.birthDate,
    patient.guardianName,
    patient.phone,
    patient.email,
    patient.insuranceName,
    patient.emergencyContactName || patient.emergencyContactPhone,
    addressDisplay === 'No registrado' ? '' : 'ok',
  ]

  return fields.filter((value) => !value || value === '').length
}

export function buildKeyFiliationFields(patient: PatientFiliationSource): KeyValueField[] {
  return [
    {
      label: 'Documento',
      display: displayField(patient.documentId),
      missing: isMissingField(patient.documentId),
    },
    {
      label: 'Sexo',
      display: patient.sex ? formatPatientSex(patient.sex) : 'Sin registrar',
      missing: !patient.sex,
    },
    {
      label: 'Teléfono',
      display: displayField(patient.phone),
      missing: isMissingField(patient.phone),
    },
    {
      label: 'Seguro',
      display: displayField(patient.insuranceName),
      missing: isMissingField(patient.insuranceName),
    },
  ]
}

export function buildFullFiliationFields(patient: PatientFiliationSource): KeyValueField[] {
  const address = formatPatientAddress(patient.address)
  const emergency = [patient.emergencyContactName, patient.emergencyContactPhone]
    .filter(Boolean)
    .join(' · ')

  return [
    {
      label: 'Documento',
      display: displayField(patient.documentId),
      missing: isMissingField(patient.documentId),
    },
    {
      label: 'Sexo',
      display: patient.sex ? formatPatientSex(patient.sex) : 'Sin registrar',
      missing: !patient.sex,
    },
    {
      label: 'Nacimiento',
      display: formatPatientBirthDate(patient.birthDate),
      missing: isMissingField(patient.birthDate),
    },
    {
      label: 'Edad',
      display: calculatePatientAge(patient.birthDate),
      missing: isMissingField(patient.birthDate),
    },
    {
      label: 'Padre o tutor',
      display: displayField(patient.guardianName),
      missing: isMissingField(patient.guardianName),
    },
    {
      label: 'Teléfono',
      display: displayField(patient.phone),
      missing: isMissingField(patient.phone),
    },
    {
      label: 'Correo',
      display: displayField(patient.email),
      missing: isMissingField(patient.email),
    },
    {
      label: 'Seguro',
      display: displayField(patient.insuranceName),
      missing: isMissingField(patient.insuranceName),
    },
    {
      label: 'Póliza',
      display: displayField(patient.policyNumber),
      missing: isMissingField(patient.policyNumber),
    },
    {
      label: 'Emergencia',
      display: emergency || 'Sin registrar',
      missing: !emergency,
      span: 2,
    },
    {
      label: 'Domicilio',
      display: address,
      missing: address === 'No registrado',
      span: 2,
    },
  ]
}
