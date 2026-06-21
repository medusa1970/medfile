<template>
  <AuthShell
    eyebrow="Medfile interno"
    title="Consola de administración."
    description="Acceso restringido al equipo Medfile. Usa tu cuenta autorizada para gestionar clientes y pagos."
    :trust-items="trustItems"
  >
    <h2>Acceso admin</h2>
    <p class="auth-card-lead">Solo correos incluidos en la allowlist del servidor pueden entrar.</p>

    <form class="auth-form" @submit.prevent="submit">
      <FormField
        v-model="form.email"
        label="Correo autorizado"
        type="email"
        icon="mail"
        autocomplete="username"
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

      <MfButton type="submit" block>{{ loading ? 'Verificando…' : 'Entrar al panel admin' }}</MfButton>
    </form>

    <div class="auth-switch">
      ¿Eres médico cliente?
      <NuxtLink to="/login">Ir al acceso médico</NuxtLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
import type { MedIconName } from '~/components/ui/MedIcon.vue'

definePageMeta({ ssr: false })

interface AdminLoginResponse {
  accessToken: string
  user: {
    email: string
    emailVerified: boolean
    onboardingCompleted?: boolean
  }
}

const trustItems: { icon: MedIconName; value: string; label: string }[] = [
  { icon: 'lock', value: 'Restringido', label: 'allowlist en servidor' },
  { icon: 'shield', value: 'JWT', label: 'misma sesión segura' },
  { icon: 'users', value: 'Plataforma', label: 'clientes y pagos' },
]

const apiBaseUrl = usePublicApiBaseUrl()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: String(route.query.email || ''),
  password: '',
})

if (route.query.expired === '1') {
  error.value = 'Tu sesión de admin expiró. Inicia sesión nuevamente.'
}

async function submit() {
  error.value = ''
  loading.value = true

  try {
    const response = await $fetch<AdminLoginResponse>(`${apiBaseUrl}/api/auth/admin/login`, {
      method: 'POST',
      body: form,
    })

    if (import.meta.client) {
      localStorage.setItem('medfile_access_token', response.accessToken)
    }

    await router.push('/admin')
  } catch (fetchError: unknown) {
    const status =
      typeof fetchError === 'object' && fetchError && 'status' in fetchError
        ? (fetchError as { status?: number }).status
        : undefined

    if (status === 403) {
      error.value = 'Este correo no tiene permiso de administrador de plataforma.'
    } else {
      error.value = 'Credenciales inválidas o cuenta no disponible.'
    }
  } finally {
    loading.value = false
  }
}
</script>
