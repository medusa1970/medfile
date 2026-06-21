<template>
  <AuthShell
    eyebrow="Nueva contraseña"
    title="Define una contraseña nueva."
    description="El enlace es de un solo uso y vence en 60 minutos."
  >
    <h2>Restablecer contraseña</h2>
    <p class="auth-card-lead">Elige una contraseña segura para tu cuenta Medfile.</p>

    <form class="auth-form" @submit.prevent="submit">
      <FormField
        v-model="email"
        label="Correo profesional"
        type="email"
        icon="mail"
        autocomplete="email"
        required
      />
      <div class="auth-form-row">
        <FormField
          v-model="password"
          label="Nueva contraseña"
          type="password"
          icon="lock"
          toggle-password
          autocomplete="new-password"
          required
        />
        <FormField
          v-model="passwordConfirm"
          label="Repetir contraseña"
          type="password"
          icon="lock"
          toggle-password
          autocomplete="new-password"
          required
        />
      </div>

      <p class="form-help">Mínimo 8 caracteres.</p>
      <div v-if="error" class="form-error">{{ error }}</div>
      <div v-if="success" class="form-success">{{ success }}</div>

      <MfButton type="submit" block :disabled="loading">
        {{ loading ? 'Guardando…' : 'Guardar contraseña' }}
      </MfButton>
    </form>

    <div class="auth-switch">
      <NuxtLink to="/login">Ir a iniciar sesión</NuxtLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, guestOnly: true })

import {
  clearPasswordResetPreview,
  readPasswordResetPreview,
  validatePasswordPair,
} from '~/utils/auth-form'

const apiBaseUrl = usePublicApiBaseUrl()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const success = ref('')

const email = ref(String(route.query.email || ''))
const token = ref(String(route.query.token || ''))
const password = ref('')
const passwordConfirm = ref('')

onMounted(() => {
  const preview = readPasswordResetPreview()
  if (!preview) return

  if (!email.value.trim()) {
    email.value = preview.email
  }
  if (!token.value.trim()) {
    token.value = preview.token
  }
})

async function submit() {
  error.value = ''
  success.value = ''

  const validationError = validatePasswordPair(password.value, passwordConfirm.value)
  if (validationError) {
    error.value = validationError
    return
  }

  if (!token.value.trim()) {
    error.value = 'El enlace no es valido. Solicita uno nuevo.'
    return
  }

  loading.value = true

  try {
    await $fetch(`${apiBaseUrl}/api/auth/reset-password`, {
      method: 'POST',
      body: {
        email: email.value.trim(),
        token: token.value.trim(),
        password: password.value,
      },
    })

    clearPasswordResetPreview()
    success.value = 'Contraseña actualizada. Redirigiendo al login…'
    await router.push('/login')
  } catch (err) {
    const apiMessage =
      typeof err === 'object' &&
      err &&
      'data' in err &&
      typeof (err as { data?: { message?: unknown } }).data?.message === 'string'
        ? (err as { data: { message: string } }).data.message
        : ''

    error.value =
      apiMessage ||
      'No pudimos restablecer la contraseña. Solicita un enlace nuevo.'
  } finally {
    loading.value = false
  }
}
</script>
