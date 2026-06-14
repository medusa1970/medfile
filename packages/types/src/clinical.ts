export interface YesNoNote {
  value?: boolean
  notes?: string
}

export interface PatientAddress {
  department?: string
  province?: string
  district?: string
  locality?: string
  streetAddress?: string
}

export interface GynecologicalBackground {
  menarche?: string
  sexualActivityStart?: string
  contraception?: string
  lastMenstrualPeriod?: string
  cycleDuration?: string
}

export interface ObstetricBackground {
  pregnancies?: number
  births?: number
  abortions?: number
  cesareans?: number
  ectopic?: number
  gestationalAge?: string
}

export interface PatientMedicalBackground {
  familyDiabetes?: YesNoNote
  familyHypertension?: YesNoNote
  familyOtherNotes?: string
  habitAlcohol?: YesNoNote
  habitTobacco?: YesNoNote
  habitDrugs?: YesNoNote
  habitMedications?: YesNoNote
  chronicDiabetes?: YesNoNote
  chronicHypertension?: YesNoNote
  chronicTuberculosis?: YesNoNote
  chronicAsthma?: YesNoNote
  chronicAllergies?: YesNoNote
  chronicSurgeries?: YesNoNote
  chronicOtherNotes?: string
  gynecological?: GynecologicalBackground
  obstetric?: ObstetricBackground
}

export interface VitalSigns {
  bloodPressure?: string
  heartRate?: number
  respiratoryRate?: number
  temperature?: number
  oxygenSaturation?: number
  weightKg?: number
  heightCm?: number
}

export type CareType = 'private' | 'epidemiological' | 'soat' | 'other'
export type PatientDestination =
  | 'home'
  | 'referred'
  | 'death'
  | 'external_followup'
  | 'absconded'
  | 'observation'
  | 'interconsultation'
