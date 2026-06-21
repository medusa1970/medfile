import { adminLoginRoute } from '~/utils/admin-routes'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const token = localStorage.getItem('medfile_access_token') ?? ''
  if (!token) return navigateTo(adminLoginRoute())

  const config = useRuntimeConfig()
  const { resolvePublicApiUrl } = await import('~/utils/public-api-url')
  const apiBaseUrl = resolvePublicApiUrl(config.public.apiUrl as string)

  try {
    const me = await $fetch<{ user: { isPlatformAdmin?: boolean } }>(`${apiBaseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!me.user.isPlatformAdmin) {
      return navigateTo(adminLoginRoute())
    }
  } catch {
    localStorage.removeItem('medfile_access_token')
    return navigateTo(adminLoginRoute({ expired: '1' }))
  }
})
