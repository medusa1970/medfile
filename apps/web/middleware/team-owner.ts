export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const token = localStorage.getItem('medfile_access_token') ?? ''
  if (!token) return navigateTo('/login')

  const config = useRuntimeConfig()
  const { resolvePublicApiUrl } = await import('~/utils/public-api-url')
  const apiBaseUrl = resolvePublicApiUrl(config.public.apiUrl as string)

  try {
    const me = await $fetch<{ user: { role: string } }>(`${apiBaseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (me.user.role !== 'owner' && me.user.role !== 'doctor') {
      return navigateTo('/dashboard')
    }
  } catch {
    return navigateTo('/login?expired=1')
  }
})
