export function resolvePostAuthRoute(user: {
  emailVerified?: boolean
  onboardingCompleted?: boolean
}) {
  if (user.emailVerified === false) {
    return '/verificar-correo'
  }

  if (!user.onboardingCompleted) {
    return '/onboarding'
  }

  return '/dashboard'
}
