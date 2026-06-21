import type { PatientMedicalBackground } from '@medfile/types'

export interface ClinicalHighlight {
  label: string
  detail: string
  tone: 'warning' | 'danger' | ''
}

function yesNoNote(value?: { value?: boolean; notes?: string } | null) {
  if (value?.value !== true) return null
  return value.notes?.trim() || 'Sí'
}

/** Resumen clínico visible en el perfil (alergias, crónicos, medicación). */
export function getPatientClinicalHighlights(
  background?: PatientMedicalBackground | null,
): ClinicalHighlight[] {
  if (!background) return []

  const items: ClinicalHighlight[] = []

  const allergies = yesNoNote(background.chronicAllergies)
  if (allergies) {
    items.push({ label: 'Alergias', detail: allergies, tone: 'danger' })
  }

  const meds = yesNoNote(background.habitMedications)
  if (meds) {
    items.push({ label: 'Medicación', detail: meds, tone: 'warning' })
  }

  const chronicPairs: Array<[string, ReturnType<typeof yesNoNote>]> = [
    ['Diabetes', yesNoNote(background.chronicDiabetes)],
    ['Hipertensión', yesNoNote(background.chronicHypertension)],
    ['Asma', yesNoNote(background.chronicAsthma)],
    ['Tuberculosis', yesNoNote(background.chronicTuberculosis)],
  ]

  for (const [label, detail] of chronicPairs) {
    if (detail) items.push({ label, detail, tone: 'warning' })
  }

  return items
}

export function hasClinicalHighlights(background?: PatientMedicalBackground | null) {
  return getPatientClinicalHighlights(background).length > 0
}
