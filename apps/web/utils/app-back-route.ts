/** Rutas raíz del módulo médico: sin botón atrás en la barra móvil (salvo `returnTo` en query). */
export const APP_TOP_LEVEL_PATHS = new Set([
  '/dashboard',
  '/pacientes',
  '/documentos',
  '/compartidos',
  '/suscripcion',
  '/cuenta',
])

export function canShowAppBack(path: string, returnTo?: string) {
  if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) return true
  return !APP_TOP_LEVEL_PATHS.has(path)
}

function sanitizeReturnTo(value: unknown) {
  if (typeof value !== 'string') return ''
  if (!value.startsWith('/') || value.startsWith('//')) return ''
  return value
}

export function readReturnToQuery(query: Record<string, unknown>) {
  return sanitizeReturnTo(query.returnTo)
}

export function resolveAppBackRoute(path: string, returnTo?: string) {
  if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) return returnTo
  if (
    /\/pacientes\/[^/]+\/(editar|compartir|antecedentes|filiacion|nueva-atencion|solicitar-subida)$/.test(
      path,
    )
  ) {
    return path.replace(/\/(editar|compartir|antecedentes|filiacion|nueva-atencion|solicitar-subida)$/, '')
  }

  if (path === '/pacientes/nuevo') return '/pacientes'

  if (path.startsWith('/pacientes/')) return '/pacientes'
  if (path.startsWith('/compartidos/')) return '/compartidos'
  return '/dashboard'
}
