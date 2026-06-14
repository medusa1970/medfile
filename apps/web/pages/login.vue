<template>
  <AuthShell
    eyebrow="Acceso médico"
    title="Vuelve a tu consulta digital."
    description="Accede a tu dashboard, pacientes, documentos y estado de suscripción desde cualquier dispositivo."
  >
    <h2>Iniciar sesión</h2>
    <p class="auth-card-lead">Usa el correo profesional con el que registraste tu consulta.</p>

    <form class="auth-form" @submit.prevent="submit">
      <FormField
        v-model="form.email"
        label="Correo"
        type="email"
        icon="mail"
        autocomplete="email"
        required
      />
      <FormField
        v-model="form.password"
        label="Contraseña"
        type="password"
        icon="lock"
        toggle-password
        autocomplete="current-password"
        required
      />

      <p class="auth-forgot-row">
        <NuxtLink to="/olvide-contrasena">¿Olvidaste tu contraseña?</NuxtLink>
      </p>

      <div v-if="error" class="form-error">{{ error }}</div>

      <MfButton type="submit" block>{{ loading ? 'Entrando…' : 'Entrar a Medfile' }}</MfButton>
    </form>

    <div class="auth-switch">
      ¿Aún no tienes cuenta?
      <NuxtLink to="/registro">Crear cuenta gratis</NuxtLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, guestOnly: true })

import { resolvePostAuthRoute } from '~/utils/auth-routing'

interface LoginResponse {
  accessToken: string
  user: {
    email: string
    emailVerified: boolean
    onboardingCompleted?: boolean
  }
}

const config = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: String(route.query.email || ''),
  password: '',
})

if (route.query.expired === '1') {
  error.value = 'Tu sesión expiró. Inicia sesión nuevamente.'
}

async function submit() {
  error.value = ''
  loading.value = true

  try {
    const response = await $fetch<LoginResponse>(`${config.public.apiUrl}/api/auth/login`, {
      method: 'POST',
      body: form,
    })

    if (import.meta.client) {
      localStorage.setItem('medfile_access_token', response.accessToken)
    }

    const nextPath = resolvePostAuthRoute(response.user)
    await router.push(
      nextPath === '/verificar-correo'
        ? { path: nextPath, query: { email: response.user.email } }
        : nextPath,
    )
  } catch {
    error.value = 'Credenciales inválidas o cuenta no disponible.'
  } finally {
    loading.value = false
  }
}
</script>
