<template>
  <AuthShell
    eyebrow="Verificación de correo"
    title="Confirma que eres tú."
    description="Por seguridad clínica, validamos tu correo profesional antes de activar tu consultorio en Medfile."
  >
    <h2>Verifica tu correo</h2>
    <p class="auth-card-lead">
      Enviamos un código de 6 dígitos a
      <strong>{{ maskedEmail }}</strong>.
    </p>

    <form class="auth-form" @submit.prevent="submit">
      <FormField
        v-model="code"
        label="Código de verificación"
        icon="key"
        inputmode="numeric"
        autocomplete="one-time-code"
        placeholder="000000"
        :maxlength="6"
        digits-only
        required
      />

      <p v-if="devHint" class="auth-dev-hint">
        Modo desarrollo: tu código es <strong>{{ devHint }}</strong>
      </p>

      <div v-if="error" class="form-error">{{ error }}</div>
      <div v-if="success" class="form-success">{{ success }}</div>

      <MfButton type="submit" block :disabled="code.length !== 6 || loading">
        {{ loading ? 'Verificando…' : 'Confirmar correo' }}
      </MfButton>
    </form>

    <div class="auth-resend-row">
      <span>¿No llegó el código?</span>
      <button type="button" :disabled="resending" @click="resend">
        {{ resending ? 'Reenviando…' : 'Reenviar código' }}
      </button>
    </div>

    <div class="auth-switch">
      ¿Correo incorrecto?
      <NuxtLink to="/registro">Crear otra cuenta</NuxtLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, requiresSession: true })

import {
  clearVerificationPreview,
  maskEmail,
  readVerificationPreview,
  storeVerificationPreview,
} from '~/utils/auth-form'

interface VerificationResponse {
  verification?: {
    email: string
    devCode?: string
  }
}

const route = useRoute()
const router = useRouter()
const { apiFetch, hasSession } = useMedfileApi()

const code = ref('')
const loading = ref(false)
const resending = ref(false)
const error = ref('')
const success = ref('')
const email = ref(String(route.query.email || ''))
const devHint = ref('')
const pageReady = ref(false)

const maskedEmail = computed(() => maskEmail(email.value || 'tu correo'))

onMounted(async () => {
  const preview = readVerificationPreview()
  if (preview) {
    email.value = preview.email
    devHint.value = preview.devCode
    if (preview.devCode) {
      code.value = preview.devCode
    }
  }

  if (!hasSession()) {
    if (email.value) {
      pageReady.value = true
      return
    }

    await router.replace('/login')
    return
  }

  try {
    const me = await apiFetch<{ user: { email: string; emailVerified: boolean } }>('/api/auth/me')
    email.value = me.user.email
    if (me.user.emailVerified) {
      await router.replace('/onboarding')
      return
    }
  } catch {
    if (email.value) {
      pageReady.value = true
      return
    }

    await router.replace('/login?expired=1')
    return
  }

  pageReady.value = true

  if (code.value.length === 6) {
    await submit()
  }
})

watch(code, async (value) => {
  if (!pageReady.value || loading.value || value.length !== 6) return
  await submit()
})

async function submit() {
  error.value = ''
  success.value = ''

  if (code.value.trim().length !== 6) {
    error.value = 'Ingresa el código de 6 dígitos.'
    return
  }

  loading.value = true

  try {
    await apiFetch('/api/auth/verify-email', {
      method: 'POST',
      body: { code: code.value.trim() },
    })

    clearVerificationPreview()
    success.value = 'Correo verificado. Redirigiendo…'
    await router.push('/onboarding')
  } catch (err) {
    if (typeof err === 'object' && err && 'status' in err && (err as { status?: number }).status === 401) {
      error.value = 'Tu sesión expiró. Inicia sesión e ingresa el código de nuevo.'
      return
    }

    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function resend() {
  error.value = ''
  success.value = ''
  resending.value = true

  try {
    if (!email.value.trim()) {
      throw new Error('missing_email')
    }

    const config = useRuntimeConfig()
    const response = await $fetch<VerificationResponse>(
      `${config.public.apiUrl}/api/auth/resend-verification-public`,
      {
        method: 'POST',
        body: { email: email.value.trim() },
      },
    )

    if (response.verification?.email) {
      email.value = response.verification.email
    }

    if (response.verification?.devCode) {
      devHint.value = response.verification.devCode
      code.value = response.verification.devCode
      storeVerificationPreview(email.value, response.verification.devCode)
    }

    success.value = 'Te enviamos un código nuevo. Revisa tu bandeja y spam.'
  } catch {
    error.value = 'No pudimos reenviar el código. Inicia sesión e inténtalo de nuevo.'
  } finally {
    resending.value = false
  }
}

function getErrorMessage(err: unknown) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (typeof data?.message === 'string') return data.message
  }

  return 'No pudimos verificar el código.'
}
</script>
