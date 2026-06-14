import { resolvePostAuthRoute } from '~/utils/auth-routing'

const SESSION_PREFIXES = ['/verificar-correo', '/onboarding']
const APP_PREFIXES = ['/dashboard', '/pacientes', '/documentos', '/compartidos', '/suscripcion', '/cuenta']
const GUEST_PATHS = new Set(['/login', '/registro', '/olvide-contrasena', '/restablecer-contrasena'])

function matchesPrefix(path: string, prefixes: string[]) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const token = localStorage.getItem('medfile_access_token') ?? ''
  const needsSession =
    Boolean(to.meta.requiresSession) ||
    matchesPrefix(to.path, SESSION_PREFIXES) ||
    matchesPrefix(to.path, APP_PREFIXES)
  const needsVerified = Boolean(to.meta.requiresVerified) || matchesPrefix(to.path, APP_PREFIXES)
  const needsOnboarding = Boolean(to.meta.requiresOnboarding) || matchesPrefix(to.path, APP_PREFIXES)
  const guestOnly = Boolean(to.meta.guestOnly) || GUEST_PATHS.has(to.path)

  if (guestOnly && token) {
    const config = useRuntimeConfig()
    try {
      const me = await $fetch<{
        user: { emailVerified: boolean; onboardingCompleted: boolean; email: string }
      }>(`${config.public.apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return navigateTo(resolvePostAuthRoute(me.user))
    } catch {
      localStorage.removeItem('medfile_access_token')
    }
  }

  if (needsSession && !token) {
    if (to.path === '/verificar-correo' && typeof to.query.email === 'string' && to.query.email.trim()) {
      return
    }

    return navigateTo('/login')
  }

  if (!token || (!needsVerified && !needsOnboarding)) return

  const config = useRuntimeConfig()

  try {
    const me = await $fetch<{
      user: {
        email: string
        emailVerified: boolean
        onboardingCompleted: boolean
      }
    }>(`${config.public.apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (needsVerified && me.user.emailVerified === false && to.path !== '/verificar-correo') {
      return navigateTo({
        path: '/verificar-correo',
        query: { email: me.user.email },
      })
    }

    if (
      needsOnboarding &&
      me.user.emailVerified !== false &&
      !me.user.onboardingCompleted &&
      to.path !== '/onboarding'
    ) {
      return navigateTo('/onboarding')
    }

    if (to.path === '/verificar-correo' && me.user.emailVerified !== false) {
      return navigateTo(resolvePostAuthRoute(me.user))
    }

    if (to.path === '/onboarding' && me.user.onboardingCompleted) {
      return navigateTo('/dashboard')
    }
  } catch {
    localStorage.removeItem('medfile_access_token')
    if (needsSession) {
      return navigateTo('/login?expired=1')
    }
  }
})
