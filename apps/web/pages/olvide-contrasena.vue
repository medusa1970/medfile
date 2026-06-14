<template>
  <AuthShell
    eyebrow="Recuperar acceso"
    title="Restablece tu contraseña."
    description="Te enviaremos un enlace seguro al correo con el que registraste tu consulta."
  >
    <h2>¿Olvidaste tu contraseña?</h2>
    <p class="auth-card-lead">Ingresa tu correo profesional y te indicaremos los siguientes pasos.</p>

    <form class="auth-form" @submit.prevent="submit">
      <FormField
        v-model="email"
        label="Correo profesional"
        type="email"
        icon="mail"
        autocomplete="email"
        required
      />

      <p v-if="devHint" class="auth-dev-hint">
        Modo desarrollo: usa este enlace
        <NuxtLink :to="resetLink">restablecer contraseña</NuxtLink>
      </p>

      <div v-if="error" class="form-error">{{ error }}</div>
      <div v-if="success" class="form-success">{{ success }}</div>

      <MfButton type="submit" block :disabled="loading">
        {{ loading ? 'Enviando…' : 'Enviar instrucciones' }}
      </MfButton>
    </form>

    <div class="auth-switch">
      <NuxtLink to="/login">Volver a iniciar sesión</NuxtLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, guestOnly: true })

import { storePasswordResetPreview } from '~/utils/auth-form'

interface ForgotPasswordResponse {
  sent: boolean
  reset?: {
    email: string
    token: string
  }
}

const config = useRuntimeConfig()
const loading = ref(false)
const error = ref('')
const success = ref('')
const email = ref('')
const devHint = ref('')
const devToken = ref('')

const resetLink = computed(() => ({
  path: '/restablecer-contrasena',
  query: {
    email: email.value.trim(),
    token: devToken.value,
  },
}))

async function submit() {
  error.value = ''
  success.value = ''
  devHint.value = ''
  loading.value = true

  try {
    const response = await $fetch<ForgotPasswordResponse>(
      `${config.public.apiUrl}/api/auth/forgot-password`,
      {
        method: 'POST',
        body: { email: email.value.trim() },
      },
    )

    if (response.reset?.token) {
      devToken.value = response.reset.token
      storePasswordResetPreview(response.reset.email, response.reset.token)
      devHint.value = 'disponible'
    }

    success.value =
      'Si existe una cuenta con ese correo, recibirás instrucciones para restablecer tu contraseña.'
  } catch {
    error.value = 'No pudimos procesar la solicitud. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>
