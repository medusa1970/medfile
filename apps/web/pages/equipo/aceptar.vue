<template>
  <div class="auth-page">
    <div class="auth-card">
      <EyebrowPill>Equipo Medfile</EyebrowPill>
      <h1>Aceptar invitación</h1>
      <p v-if="pending" class="panel-hint">Cargando invitación…</p>
      <p v-else-if="loadError" class="form-error">{{ loadError }}</p>

      <template v-else-if="preview">
        <p class="auth-lead">
          <strong>{{ preview.clinicName }}</strong> te invita como
          <strong>{{ roleInviteLabel(preview.role) }}</strong>.
        </p>
        <p class="panel-hint">Correo: {{ preview.email }}</p>

        <form class="auth-form" @submit.prevent="acceptInvitation">
          <FormField v-model="form.fullName" label="Tu nombre completo" required />
          <FormField
            v-model="form.password"
            label="Crea tu contraseña"
            type="password"
            toggle-password
            required
          />
          <FormField
            v-model="form.confirmPassword"
            label="Repetir contraseña"
            type="password"
            toggle-password
            required
          />
          <p v-if="submitError" class="form-error">{{ submitError }}</p>
          <MfButton type="submit" block :disabled="submitting">
            {{ submitting ? 'Creando cuenta…' : 'Unirme al equipo' }}
          </MfButton>
        </form>
      </template>

      <p class="auth-footer-hint">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login">Iniciar sesión</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', guestOnly: true, ssr: false })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { resolvePublicApiUrl } = await import('~/utils/public-api-url')
const apiBaseUrl = resolvePublicApiUrl(config.public.apiUrl as string)

const token = computed(() => String(route.query.token ?? ''))
const loadError = ref('')
const submitError = ref('')
const submitting = ref(false)
const preview = ref<{
  email: string
  fullName: string
  clinicName: string
  role?: string
} | null>(null)

const form = reactive({
  fullName: '',
  password: '',
  confirmPassword: '',
})

const { pending } = await useAsyncData('team-invite-preview', async () => {
  if (!token.value) {
    loadError.value = 'Enlace de invitación inválido.'
    return null
  }

  try {
    const data = await $fetch<{
      email: string
      fullName: string
      clinicName: string
      role?: string
    }>(`${apiBaseUrl}/api/team/invitations/preview`, {
      query: { token: token.value },
    })
    preview.value = data
    form.fullName = data.fullName
    return data
  } catch {
    loadError.value = 'Invitación expirada o no válida.'
    return null
  }
})

function roleInviteLabel(role?: string) {
  if (role === 'clinical_capture') return 'captura clínica'
  return 'asistente administrativo'
}

async function acceptInvitation() {
  if (form.password !== form.confirmPassword) {
    submitError.value = 'Las contraseñas no coinciden.'
    return
  }

  submitting.value = true
  submitError.value = ''

  try {
    await $fetch(`${apiBaseUrl}/api/team/invitations/accept`, {
      method: 'POST',
      body: {
        token: token.value,
        fullName: form.fullName,
        password: form.password,
      },
    })
    await router.push('/login?joined=1')
  } catch (error) {
    submitError.value = getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data
    const message = data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'No se pudo aceptar la invitación.'
}
</script>
