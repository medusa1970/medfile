/** Convierte la ruta relativa del enlace en URL absoluta (WhatsApp, copiar, SMS). */
export function buildAbsoluteUploadUrl(relativePath: string, origin?: string) {
  const path = relativePath.trim()
  if (!path) return ''

  if (/^https?:\/\//i.test(path)) return path

  const base =
    origin ??
    (import.meta.client ? window.location.origin : '')

  if (!base) return path.startsWith('/') ? path : `/${path}`

  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}
