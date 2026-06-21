/** Claves `useAsyncData` asociadas a un paciente; invalidar tras PATCH/POST clínico. */
export function patientDataKeys(patientId: string) {
  const id = patientId.trim()
  if (!id) return []

  return [
    `patient-${id}`,
    `patient-background-${id}`,
    `patient-filiation-${id}`,
    `encounters-${id}`,
    `documents-${id}`,
    `upload-request-page-${id}`,
  ]
}

export async function invalidatePatientCaches(patientId: string) {
  const keys = patientDataKeys(patientId)
  await Promise.all(keys.map((key) => refreshNuxtData(key)))
}
