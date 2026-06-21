export type PatientSection =
  | 'profile'
  | 'filiacion'
  | 'editar'
  | 'antecedentes'
  | 'nueva-atencion'
  | 'solicitar-subida'
  | 'compartir'

const SECTION_PATH: Record<Exclude<PatientSection, 'profile'>, string> = {
  filiacion: 'filiacion',
  editar: 'editar',
  antecedentes: 'antecedentes',
  'nueva-atencion': 'nueva-atencion',
  'solicitar-subida': 'solicitar-subida',
  compartir: 'compartir',
}

export function patientRoute(patientId: string, section: PatientSection = 'profile') {
  const id = patientId?.trim()
  if (!id) return '/pacientes'

  if (section === 'profile') return `/pacientes/${id}`

  return `/pacientes/${id}/${SECTION_PATH[section]}`
}
