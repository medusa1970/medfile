/**
 * En desarrollo, si el paciente abre el enlace desde el móvil (IP LAN)
 * pero NUXT_PUBLIC_API_URL apunta a localhost, reescribe el host al de la página.
 */
export function resolvePublicApiUrl(configuredUrl: string) {
  if (!import.meta.client) return configuredUrl

  try {
    const configured = new URL(configuredUrl)
    const isLocalApiHost =
      configured.hostname === 'localhost' ||
      configured.hostname === '127.0.0.1' ||
      configured.hostname === '0.0.0.0'

    if (!isLocalApiHost) return configuredUrl

    const pageHost = window.location.hostname
    if (pageHost === 'localhost' || pageHost === '127.0.0.1') return configuredUrl

    configured.hostname = pageHost
    return configured.toString().replace(/\/$/, '')
  } catch {
    return configuredUrl
  }
}
