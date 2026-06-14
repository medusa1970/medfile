<template>
  <AuthShell
    eyebrow="Plan Gratis para médicos"
    title="Crea tu espacio privado en Medfile."
    description="Registra tu consulta sin tarjeta. Organiza pacientes, documentos e historias clínicas."
    :trust-items="registerTrustItems"
  >
    <h2>Crear cuenta</h2>
    <p class="auth-card-lead">Activa el Plan Gratis permanente para tu consultorio.</p>

    <form class="auth-form" @submit.prevent="submit">
      <div class="auth-form-row">
        <FormField
          v-model="form.givenNames"
          label="Nombre(s)"
          icon="user"
          autocomplete="given-name"
          required
        />
        <FormField
          v-model="form.familyNames"
          label="Apellido(s)"
          icon="user"
          autocomplete="family-name"
          required
        />
      </div>
      <div class="auth-form-row">
        <FormField
          v-model="form.email"
          label="Correo profesional"
          type="email"
          icon="mail"
          autocomplete="email"
          required
        />
        <FormField
          v-model="form.phone"
          label="WhatsApp / teléfono"
          type="tel"
          icon="mobile"
          inputmode="tel"
          autocomplete="tel"
          placeholder="+591 7XX XXX XXX"
          required
        />
      </div>
      <div class="auth-form-row auth-form-row--full">
        <FormField
          v-model="form.clinicName"
          label="Nombre de consulta"
          icon="clinic"
          autocomplete="organization"
          required
        />
      </div>
      <div class="auth-form-row">
        <FormField
          v-model="form.password"
          label="Contraseña"
          type="password"
          icon="lock"
          toggle-password
          autocomplete="new-password"
          required
        />
        <FormField
          v-model="form.passwordConfirm"
          label="Repetir contraseña"
          type="password"
          icon="lock"
          toggle-password
          autocomplete="new-password"
          required
        />
      </div>

      <p class="form-help">
        Mínimo 8 caracteres. Usaremos tu teléfono para enlaces WhatsApp con pacientes. Te enviaremos un
        código para verificar tu correo.
      </p>
      <div v-if="error" class="form-error">{{ error }}</div>

      <MfButton type="submit" block>{{ loading ? 'Creando cuenta…' : 'Crear cuenta gratis' }}</MfButton>
    </form>

    <div class="auth-switch">
      ¿Ya tienes cuenta?
      <NuxtLink to="/login">Inicia sesión</NuxtLink>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, guestOnly: true })

import {
  buildRegisterFullName,
  normalizeRegisterPhone,
  storeVerificationPreview,
  validateRegisterForm,
} from '~/utils/auth-form'

interface RegisterResponse {
  accessToken: string
  verification?: {
    email: string
    devCode?: string
  }
}

const config = useRuntimeConfig()
const router = useRouter()
const loading = ref(false)
const error = ref('')

const registerTrustItems = [
  { icon: 'gift' as const, value: 'Gratis', label: 'sin vencimiento' },
  { icon: 'users' as const, value: 'Colegas', label: 'compartes con permiso' },
  { icon: 'clinic' as const, value: 'Tu código', label: 'Medfile incluido' },
  { icon: 'lock' as const, value: 'Tus datos', label: 'nunca se borran' },
]

const form = reactive({
  givenNames: '',
  familyNames: '',
  email: '',
  phone: '',
  clinicName: '',
  password: '',
  passwordConfirm: '',
})

async function submit() {
  error.value = ''
  const validationError = validateRegisterForm(form)
  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true

  try {
    const response = await $fetch<RegisterResponse>(`${config.public.apiUrl}/api/auth/register`, {
      method: 'POST',
      body: {
        fullName: buildRegisterFullName(form.givenNames, form.familyNames),
        email: form.email.trim(),
        phone: normalizeRegisterPhone(form.phone),
        clinicName: form.clinicName.trim(),
        password: form.password,
      },
    })

    if (import.meta.client) {
      localStorage.setItem('medfile_access_token', response.accessToken)
      storeVerificationPreview(
        response.verification?.email ?? form.email.trim(),
        response.verification?.devCode,
      )
    }

    await router.push({
      path: '/verificar-correo',
      query: { email: response.verification?.email ?? form.email.trim() },
    })
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function getErrorMessage(err: unknown) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (data?.message) return data.message
  }

  return 'No pudimos crear la cuenta. Verifica los datos e intenta nuevamente.'
}
</script>
