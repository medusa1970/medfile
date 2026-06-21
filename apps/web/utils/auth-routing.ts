export function resolvePostAuthRoute(user: {
  emailVerified?: boolean
  onboardingCompleted?: boolean
  role?: string
}) {
  if (user.emailVerified === false) {
    return '/verificar-correo'
  }

  if (!user.onboardingCompleted) {
    return '/onboarding'
  }

  if (user.role === 'clinical_capture') {
    return '/cola-clinica'
  }

  return '/dashboard'
}
