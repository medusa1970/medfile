<template>
  <div class="dashboard-page">
    <header class="app-header">
      <div>
        <EyebrowPill>Cuenta</EyebrowPill>
        <h1>Mi perfil</h1>
        <p>Datos de tu cuenta profesional y seguridad de acceso.</p>
      </div>
    </header>

    <section class="dashboard-grid">
      <PanelCard title="Datos personales" padded>
        <form class="auth-form account-form" @submit.prevent="saveProfile">
          <div class="auth-form-row">
            <FormField
              v-model="profile.fullName"
              label="Nombre completo"
              icon="user"
              autocomplete="name"
              required
            />
            <FormField
              v-model="profile.phone"
              label="WhatsApp / teléfono"
              type="tel"
              icon="mobile"
              inputmode="tel"
              autocomplete="tel"
              required
            />
          </div>
          <FormField
            v-model="profile.email"
            label="Correo profesional"
            type="email"
            icon="mail"
            autocomplete="email"
            disabled
          />

          <MedfileCodeCard v-if="medfileCode" :code="medfileCode" class="account-code-card" />

      <MfButton
        v-if="showTeamLink"
        variant="secondary"
        block
        to="/cuenta/equipo"
        class="account-team-link"
      >
        Gestionar equipo
      </MfButton>

      <div v-if="profileError" class="form-error">{{ profileError }}</div>
          <div v-if="profileSuccess" class="form-success">{{ profileSuccess }}</div>

          <MfButton type="submit" :disabled="profileLoading">
            {{ profileLoading ? 'Guardando…' : 'Guardar cambios' }}
          </MfButton>
        </form>
      </PanelCard>

      <PanelCard title="Seguridad" padded>
        <form class="auth-form account-form" @submit.prevent="changePassword">
          <div class="auth-form-row">
            <FormField
              v-model="security.currentPassword"
              label="Contraseña actual"
              type="password"
              icon="lock"
              toggle-password
              autocomplete="current-password"
              required
            />
            <FormField
              v-model="security.newPassword"
              label="Nueva contraseña"
              type="password"
              icon="lock"
              toggle-password
              autocomplete="new-password"
              required
            />
          </div>
          <FormField
            v-model="security.confirmPassword"
            label="Repetir nueva contraseña"
            type="password"
            icon="lock"
            toggle-password
            autocomplete="new-password"
            required
          />

          <p class="form-help">Mínimo 8 caracteres. Cierra sesión en otros dispositivos si cambias la contraseña.</p>

          <div v-if="securityError" class="form-error">{{ securityError }}</div>
          <div v-if="securitySuccess" class="form-success">{{ securitySuccess }}</div>

          <MfButton type="submit" variant="secondary" :disabled="securityLoading">
            {{ securityLoading ? 'Actualizando…' : 'Cambiar contraseña' }}
          </MfButton>
        </form>
      </PanelCard>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'doctor', ssr: false })

import { normalizeRegisterPhone, validatePasswordPair } from '~/utils/auth-form'

interface MeResponse {
  user: {
    fullName: string
    email: string
    phone?: string | null
    role?: string
  }
  tenant: {
    medfileCode?: string
    profile?: Record<string, unknown> | null
  }
  subscription?: {
    plan: { capabilities: { assistantUsers: boolean } }
  }
}

const showTeamLink = ref(false)

const { apiFetch } = useMedfileApi()

const medfileCode = ref('')
const profileLoading = ref(false)
const securityLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const securityError = ref('')
const securitySuccess = ref('')

const profile = reactive({
  fullName: '',
  email: '',
  phone: '',
})

const security = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

onMounted(async () => {
  try {
    const me = await apiFetch<MeResponse>('/api/auth/me')
    profile.fullName = me.user.fullName
    profile.email = me.user.email
    profile.phone = me.user.phone ?? ''
    medfileCode.value = me.tenant.medfileCode ?? ''
    showTeamLink.value =
      (me.user.role === 'owner' || me.user.role === 'doctor') &&
      Boolean(me.subscription?.plan.capabilities.assistantUsers)
  } catch {
    profileError.value = 'No pudimos cargar tu perfil.'
  }
})

async function saveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  profileLoading.value = true

  try {
    await apiFetch('/api/auth/profile', {
      method: 'PATCH',
      body: {
        fullName: profile.fullName.trim(),
        phone: normalizeRegisterPhone(profile.phone),
      },
    })

    profileSuccess.value = 'Perfil actualizado.'
  } catch (err) {
    profileError.value = readErrorMessage(err, 'No pudimos guardar tu perfil.')
  } finally {
    profileLoading.value = false
  }
}

async function changePassword() {
  securityError.value = ''
  securitySuccess.value = ''

  const validationError = validatePasswordPair(security.newPassword, security.confirmPassword)
  if (validationError) {
    securityError.value = validationError
    return
  }

  securityLoading.value = true

  try {
    await apiFetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      },
    })

    security.currentPassword = ''
    security.newPassword = ''
    security.confirmPassword = ''
    securitySuccess.value = 'Contraseña actualizada correctamente.'
  } catch (err) {
    securityError.value = readErrorMessage(err, 'No pudimos cambiar la contraseña.')
  } finally {
    securityLoading.value = false
  }
}

function readErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (typeof data?.message === 'string') return data.message
  }

  return fallback
}
</script>

<style scoped>
.account-form {
  max-width: none;
}

.account-code-card {
  margin-top: 4px;
}
</style>
