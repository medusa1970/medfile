import { ADMIN_LOGIN_PATH } from '~/utils/admin-routes'
import { resolvePostAuthRoute } from '~/utils/auth-routing'
import { resolvePublicApiUrl } from '~/utils/public-api-url'

const SESSION_PREFIXES = ['/verificar-correo', '/onboarding']
const APP_PREFIXES = ['/dashboard', '/pacientes', '/documentos', '/compartidos', '/suscripcion', '/cuenta', '/cola-clinica']
const GUEST_PATHS = new Set(['/login', '/registro', '/olvide-contrasena', '/restablecer-contrasena', '/equipo/aceptar'])

function matchesPrefix(path: string, prefixes: string[]) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  if (to.path === ADMIN_LOGIN_PATH) {
    const token = localStorage.getItem('medfile_access_token') ?? ''
    if (token) {
      const config = useRuntimeConfig()
      const apiBaseUrl = resolvePublicApiUrl(config.public.apiUrl as string)
      try {
        const me = await $fetch<{ user: { isPlatformAdmin?: boolean } }>(`${apiBaseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (me.user.isPlatformAdmin) {
          return navigateTo('/admin')
        }
      } catch {
        localStorage.removeItem('medfile_access_token')
      }
    }
    return
  }

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
    const apiBaseUrl = resolvePublicApiUrl(config.public.apiUrl as string)
    try {
      const me = await $fetch<{
        user: { emailVerified: boolean; onboardingCompleted: boolean; email: string }
      }>(`${apiBaseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return navigateTo(resolvePostAuthRoute(me.user))
    } catch {
      localStorage.removeItem('medfile_access_token')
    }
  }

  if (needsSession && !token) {
    if (to.path === '/verificar-correo') {
      return
    }

    return navigateTo('/login')
  }

  if (to.path === '/verificar-correo') {
    return
  }

  if (!token || (!needsVerified && !needsOnboarding)) return

  const config = useRuntimeConfig()
  const apiBaseUrl = resolvePublicApiUrl(config.public.apiUrl as string)

  try {
    const me = await $fetch<{
      user: {
        email: string
        emailVerified: boolean
        onboardingCompleted: boolean
        role?: string
      }
    }>(`${apiBaseUrl}/api/auth/me`, {
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

    const role = (me.user as { role?: string }).role ?? 'owner'

    const blockedForAssistant =
      role === 'assistant' &&
      (to.path.startsWith('/suscripcion') ||
        to.path.startsWith('/compartidos') ||
        to.path.startsWith('/cuenta/equipo') ||
        to.path.startsWith('/admin'))

    const blockedForClinicalCapture =
      role === 'clinical_capture' &&
      (to.path.startsWith('/suscripcion') ||
        to.path.startsWith('/compartidos') ||
        to.path.startsWith('/cuenta/equipo') ||
        to.path.startsWith('/admin') ||
        to.path.startsWith('/documentos') ||
        to.path.includes('/nueva-atencion') ||
        to.path.includes('/antecedentes') ||
        to.path.includes('/compartir') ||
        to.path.includes('/solicitar-subida'))

    if (blockedForAssistant || blockedForClinicalCapture) {
      return navigateTo(role === 'clinical_capture' ? '/cola-clinica' : '/dashboard')
    }
  } catch {
    localStorage.removeItem('medfile_access_token')
    if (needsSession) {
      return navigateTo('/login?expired=1')
    }
  }
})
