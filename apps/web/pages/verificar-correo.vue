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
      ·
      <NuxtLink :to="{ path: '/login', query: email ? { email } : undefined }">Iniciar sesión</NuxtLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false })

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
const { apiFetch, clearSession } = useMedfileApi()

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

  if (!email.value && route.query.email) {
    email.value = String(route.query.email)
  }

  const config = useRuntimeConfig()
  const token = import.meta.client ? localStorage.getItem('medfile_access_token') : null

  if (token) {
    try {
      const me = await $fetch<{ user: { email: string; emailVerified: boolean } }>(
        `${config.public.apiUrl}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      email.value = me.user.email
      if (me.user.emailVerified) {
        await router.replace('/onboarding')
        return
      }
    } catch {
      clearSession()
    }
  }

  if (!email.value.trim()) {
    await router.replace('/login')
    return
  }

  pageReady.value = true

  if (code.value.length === 6 && token) {
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

  if (import.meta.client && !localStorage.getItem('medfile_access_token')) {
    error.value = 'Inicia sesión antes de confirmar el código.'
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

  const targetEmail = email.value.trim()
  console.info('[Medfile verify] reenvio solicitado para', targetEmail)

  try {
    if (!targetEmail) {
      throw new Error('missing_email')
    }

    const config = useRuntimeConfig()
    const url = `${config.public.apiUrl}/api/auth/resend-verification-public`
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => {
      console.warn('[Medfile verify] timeout esperando respuesta del API (20s)')
      controller.abort()
    }, 20_000)

    console.info('[Medfile verify] POST', url)

    let response: VerificationResponse
    try {
      response = await $fetch<VerificationResponse>(url, {
        method: 'POST',
        body: { email: targetEmail },
        signal: controller.signal,
      })
    } finally {
      window.clearTimeout(timeoutId)
    }

    console.info('[Medfile verify] respuesta API', response)

    if (response.verification?.email) {
      email.value = response.verification.email
    }

    if (response.verification?.devCode) {
      devHint.value = response.verification.devCode
      code.value = response.verification.devCode
      storeVerificationPreview(email.value, response.verification.devCode)
    }

    success.value = 'Te enviamos un código nuevo. Revisa tu bandeja y spam.'
  } catch (err) {
    console.error('[Medfile verify] error reenvio', err)

    if (err instanceof DOMException && err.name === 'AbortError') {
      error.value = 'El servidor tardó demasiado. Revisa Railway Logs (SMTP) e inténtalo otra vez.'
      return
    }

    error.value = 'No pudimos reenviar el código. Inicia sesión e inténtalo de nuevo.'
  } finally {
    resending.value = false
    console.info('[Medfile verify] reenvio finalizado')
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
