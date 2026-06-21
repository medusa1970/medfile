export interface PatientFormValues {
  fullName: string
  documentId: string
  sex: string
  birthDate: string
  guardianName: string
  address: {
    department: string
    province: string
    district: string
    locality: string
    streetAddress: string
  }
  phone: string
  email: string
  status: string
  emergencyContactName: string
  emergencyContactPhone: string
  insuranceName: string
  policyNumber: string
}

export function buildPatientBody(input: PatientFormValues) {
  const body: Record<string, unknown> = {
    fullName: input.fullName,
    documentId: input.documentId || undefined,
    sex: input.sex || undefined,
    birthDate: input.birthDate || undefined,
    guardianName: input.guardianName || undefined,
    phone: input.phone || undefined,
    email: input.email || undefined,
    status: input.status,
    emergencyContactName: input.emergencyContactName || undefined,
    emergencyContactPhone: input.emergencyContactPhone || undefined,
    insuranceName: input.insuranceName || undefined,
    policyNumber: input.policyNumber || undefined,
  }

  const address = Object.fromEntries(
    Object.entries(input.address).filter(([, value]) => value !== ''),
  )

  if (Object.keys(address).length > 0) {
    body.address = address
  }

  return body
}

export function getPatientFormErrorMessage(err: unknown, action: 'create' | 'update') {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (data?.message) return data.message
  }

  return action === 'update'
    ? 'No pudimos actualizar al paciente. Verifica los datos e intenta nuevamente.'
    : 'No pudimos registrar al paciente. Verifica los datos e intenta nuevamente.'
}
