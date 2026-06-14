export interface RegisterFormValues {
  givenNames: string
  familyNames: string
  email: string
  phone: string
  clinicName: string
  password: string
  passwordConfirm: string
}

export function buildRegisterFullName(givenNames: string, familyNames: string) {
  return [givenNames.trim(), familyNames.trim()].filter(Boolean).join(' ')
}

export function normalizeRegisterPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}

export function validateRegisterForm(form: RegisterFormValues) {
  if (form.givenNames.trim().length < 2) {
    return 'Ingresa tu(s) nombre(s).'
  }

  if (form.familyNames.trim().length < 2) {
    return 'Ingresa tu(s) apellido(s).'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return 'Ingresa un correo profesional valido.'
  }

  const phoneDigits = form.phone.replace(/\D/g, '')
  if (phoneDigits.length < 8) {
    return 'Ingresa un telefono valido con codigo de pais.'
  }

  if (phoneDigits.length > 15) {
    return 'El telefono es demasiado largo.'
  }

  if (form.clinicName.trim().length < 2) {
    return 'Ingresa el nombre de tu consulta.'
  }

  if (form.password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (form.password !== form.passwordConfirm) {
    return 'Las contraseñas no coinciden.'
  }

  return ''
}

export function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email

  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 1))}@${domain}`
}

export function storeVerificationPreview(email: string, devCode?: string) {
  if (!import.meta.client || !devCode) return

  sessionStorage.setItem(
    'medfile_verification_preview',
    JSON.stringify({ email, devCode }),
  )
}

export function readVerificationPreview() {
  if (!import.meta.client) return null

  try {
    const raw = sessionStorage.getItem('medfile_verification_preview')
    return raw ? (JSON.parse(raw) as { email: string; devCode: string }) : null
  } catch {
    return null
  }
}

export function clearVerificationPreview() {
  if (!import.meta.client) return
  sessionStorage.removeItem('medfile_verification_preview')
}

export function validatePasswordPair(password: string, confirm: string) {
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (password !== confirm) {
    return 'Las contraseñas no coinciden.'
  }

  return ''
}

export function storePasswordResetPreview(email: string, token?: string) {
  if (!import.meta.client || !token) return

  sessionStorage.setItem(
    'medfile_password_reset_preview',
    JSON.stringify({ email, token }),
  )
}

export function readPasswordResetPreview() {
  if (!import.meta.client) return null

  try {
    const raw = sessionStorage.getItem('medfile_password_reset_preview')
    return raw ? (JSON.parse(raw) as { email: string; token: string }) : null
  } catch {
    return null
  }
}

export function clearPasswordResetPreview() {
  if (!import.meta.client) return
  sessionStorage.removeItem('medfile_password_reset_preview')
}
