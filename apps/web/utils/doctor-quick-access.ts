import type { PlanCapabilities, PlanCode } from '@medfile/types/plans'
import type { MedIconName } from '~/components/ui/MedIcon.vue'
import { subscriptionRoute } from '~/utils/subscription-route'

export type QuickAccessTone = 'teal' | 'blue' | 'orange' | 'purple' | 'navy'

export interface DoctorQuickAccessItem {
  id: string
  label: string
  hint: string
  to: string
  icon: MedIconName
  tone: QuickAccessTone
  badge?: string
  /** Tile visible pero lleva a suscripción con sugerencia de plan */
  locked?: boolean
  lockBadge?: string
  upgradePlanCode?: PlanCode
}

export interface DoctorQuickAccessOptions {
  pendingDocuments?: number
  role?: string
  capabilities?: PlanCapabilities
  usersUsed?: number
  usersLimit?: number
  returnTo?: string
}

function upgradeHref(planCode: PlanCode, returnTo = '/dashboard') {
  const base = subscriptionRoute(returnTo)
  const separator = base.includes('?') ? '&' : '?'
  return `${base}${separator}upgrade=${planCode}`
}

function canManageTeam(role: string) {
  return role === 'owner' || role === 'doctor'
}

function buildOwnerQuickAccess(options: DoctorQuickAccessOptions): DoctorQuickAccessItem[] {
  const pendingDocuments = options.pendingDocuments ?? 0
  const capabilities = options.capabilities
  const returnTo = options.returnTo ?? '/dashboard'
  const usersUsed = options.usersUsed ?? 1
  const usersLimit = options.usersLimit ?? 1
  const seatsFull = usersLimit > 0 && usersUsed >= usersLimit

  const hasAssistant = capabilities?.assistantUsers ?? false
  const hasClinicalCapture = capabilities?.clinicalCaptureUsers ?? false
  const hasClinicalShare = capabilities?.clinicalShare ?? false

  const items: DoctorQuickAccessItem[] = [
    {
      id: 'new-patient',
      label: 'Nuevo paciente',
      hint: 'Alta en consulta',
      to: '/pacientes/nuevo',
      icon: 'users',
      tone: 'teal',
    },
    {
      id: 'patients',
      label: 'Mis pacientes',
      hint: 'Buscar historias',
      to: '/pacientes',
      icon: 'folder',
      tone: 'blue',
    },
    {
      id: 'documents',
      label: 'Documentos',
      hint: 'Bandeja recibidos',
      to: '/documentos',
      icon: 'file',
      tone: 'orange',
      badge: pendingDocuments > 0 ? String(pendingDocuments) : undefined,
    },
    {
      id: 'upload-request',
      label: 'Pedir examen',
      hint: 'Enlace al paciente',
      to: '/documentos',
      icon: 'upload',
      tone: 'purple',
    },
    {
      id: 'invite-assistant',
      label: 'Invitar asistente',
      hint: hasAssistant
        ? seatsFull
          ? 'Cupo de usuarios completo'
          : 'Secretaria o recepción'
        : 'Incluido en plan Básico',
      to: hasAssistant ? '/cuenta/equipo' : upgradeHref('basic', returnTo),
      icon: 'clipboard',
      tone: 'teal',
      locked: !hasAssistant,
      lockBadge: 'Plan Básico',
      upgradePlanCode: 'basic',
      badge: hasAssistant && seatsFull ? 'Lleno' : undefined,
    },
    {
      id: 'invite-nurse',
      label: 'Enfermería delegada',
      hint: hasClinicalCapture
        ? seatsFull
          ? 'Cupo de usuarios completo'
          : 'Vitales y cola del día'
        : 'Incluido en plan Profesional',
      to: hasClinicalCapture ? '/cuenta/equipo' : upgradeHref('professional', returnTo),
      icon: 'alert',
      tone: 'orange',
      locked: !hasClinicalCapture,
      lockBadge: 'Plan Profesional',
      upgradePlanCode: 'professional',
      badge: hasClinicalCapture && seatsFull ? 'Lleno' : undefined,
    },
    {
      id: 'clinical-queue',
      label: 'Cola clínica',
      hint: hasClinicalCapture ? 'Pacientes del día' : 'Incluido en plan Profesional',
      to: hasClinicalCapture ? '/cola-clinica' : upgradeHref('professional', returnTo),
      icon: 'calendar',
      tone: 'blue',
      locked: !hasClinicalCapture,
      lockBadge: 'Plan Profesional',
      upgradePlanCode: 'professional',
    },
  ]

  items.push(
    {
      id: 'shared',
      label: 'Compartir historial',
      hint: hasClinicalShare ? 'Con colega Medfile' : 'Solo plan Profesional',
      to: hasClinicalShare ? '/compartidos' : upgradeHref('professional', returnTo),
      icon: 'shield',
      tone: 'navy',
      locked: !hasClinicalShare,
      lockBadge: 'Plan Profesional',
      upgradePlanCode: 'professional',
    },
    {
      id: 'team',
      label: 'Mi equipo',
      hint: hasAssistant ? 'Invitar o revocar' : 'Usuarios delegados',
      to: hasAssistant ? '/cuenta/equipo' : upgradeHref('basic', returnTo),
      icon: 'users',
      tone: 'navy',
      locked: !hasAssistant,
      lockBadge: 'Plan Básico',
      upgradePlanCode: 'basic',
    },
    {
      id: 'patient-demo',
      label: 'Demo enlace',
      hint: 'Vista del paciente',
      to: '/paciente/subir',
      icon: 'mobile',
      tone: 'teal',
    },
    {
      id: 'subscription',
      label: 'Mi plan',
      hint: 'Uso y límites',
      to: subscriptionRoute(returnTo),
      icon: 'gift',
      tone: 'blue',
    },
    {
      id: 'profile',
      label: 'Mi perfil',
      hint: 'Datos y contraseña',
      to: '/cuenta',
      icon: 'user',
      tone: 'navy',
    },
  )

  return items
}

function buildAssistantQuickAccess(options: DoctorQuickAccessOptions): DoctorQuickAccessItem[] {
  const pendingDocuments = options.pendingDocuments ?? 0

  return [
    {
      id: 'new-patient',
      label: 'Nuevo paciente',
      hint: 'Alta en consulta',
      to: '/pacientes/nuevo',
      icon: 'users',
      tone: 'teal',
    },
    {
      id: 'patients',
      label: 'Mis pacientes',
      hint: 'Buscar historias',
      to: '/pacientes',
      icon: 'folder',
      tone: 'blue',
    },
    {
      id: 'documents',
      label: 'Documentos',
      hint: 'Bandeja recibidos',
      to: '/documentos',
      icon: 'file',
      tone: 'orange',
      badge: pendingDocuments > 0 ? String(pendingDocuments) : undefined,
    },
    {
      id: 'upload-request',
      label: 'Pedir examen',
      hint: 'Enlace al paciente',
      to: '/documentos',
      icon: 'upload',
      tone: 'purple',
    },
    {
      id: 'patient-demo',
      label: 'Demo enlace',
      hint: 'Vista del paciente',
      to: '/paciente/subir',
      icon: 'mobile',
      tone: 'teal',
    },
    {
      id: 'profile',
      label: 'Mi perfil',
      hint: 'Datos y contraseña',
      to: '/cuenta',
      icon: 'user',
      tone: 'navy',
    },
  ]
}

export function buildDoctorQuickAccess(options: DoctorQuickAccessOptions = {}): DoctorQuickAccessItem[] {
  const role = options.role ?? 'owner'

  if (role === 'clinical_capture') {
    return [
      {
        id: 'clinical-queue',
        label: 'Cola clínica',
        hint: 'Capturar vitales',
        to: '/cola-clinica',
        icon: 'calendar',
        tone: 'blue',
      },
      {
        id: 'patients',
        label: 'Pacientes en cola',
        hint: 'Solo autorizados hoy',
        to: '/pacientes',
        icon: 'folder',
        tone: 'teal',
      },
      {
        id: 'profile',
        label: 'Mi perfil',
        hint: 'Datos de cuenta',
        to: '/cuenta',
        icon: 'user',
        tone: 'navy',
      },
    ]
  }

  if (role === 'assistant') {
    return buildAssistantQuickAccess(options)
  }

  if (!canManageTeam(role)) {
    return buildAssistantQuickAccess(options)
  }

  return buildOwnerQuickAccess(options)
}
