export function getApiErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (data?.message) return data.message
  }

  return fallback
}
