/** Ruta a suscripción; opcional `returnTo` para mostrar botón atrás en la barra móvil. */
export function subscriptionRoute(returnTo?: string): string {
  const base = '/suscripcion'
  if (!returnTo?.startsWith('/') || returnTo.startsWith('//')) {
    return base
  }

  const params = new URLSearchParams({ returnTo })
  return `${base}?${params.toString()}`
}
