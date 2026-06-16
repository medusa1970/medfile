<template>
  <AuthShell
    eyebrow="Configuración inicial"
    title="Completa el perfil de tu consulta."
    description="Estos datos nos ayudan a preparar la experiencia clínica, las citas y los documentos que recibirás de tus pacientes."
  >
    <MedfileCodeCard v-if="medfileCode" :code="medfileCode" />

    <h2>Perfil profesional</h2>
    <p class="auth-card-lead">Puedes ajustar esto después en Mi perfil.</p>

    <form class="auth-form" @submit.prevent="submit">
      <div class="auth-form-row">
        <FormField
          v-model="form.professionalName"
          label="Nombre profesional"
          icon="user"
          autocomplete="name"
          required
        />
        <FormField
          v-model="form.specialty"
          label="Especialidad"
          placeholder="Ej: Medicina interna"
          icon="clipboard"
        />
      </div>
      <div class="auth-form-row">
        <FormField
          v-model="form.country"
          label="País"
          placeholder="Ej: Bolivia"
          icon="clinic"
        />
        <FormField
          v-model="form.phone"
          label="WhatsApp / teléfono"
          type="tel"
          icon="mobile"
          inputmode="tel"
          autocomplete="tel"
        />
      </div>
      <FormField
        v-model="form.notes"
        label="Notas internas de la consulta"
        placeholder="Horarios, tipo de pacientes, instrucciones para asistentes..."
        textarea
      />

      <div v-if="error" class="form-error">{{ error }}</div>
      <div v-if="saved" class="form-success">Perfil guardado. Redirigiendo…</div>

      <MfButton type="submit" block :disabled="loading">
        {{ loading ? 'Guardando…' : 'Continuar al dashboard' }}
      </MfButton>
    </form>
  </AuthShell>
</template>

<script setup lang="ts">
definePageMeta({ ssr: false, requiresSession: true, requiresVerified: true })

const router = useRouter()
const { apiFetch, getAccessToken } = useMedfileApi()
const loading = ref(false)
const saved = ref(false)
const error = ref('')
const medfileCode = ref('')

const form = reactive({
  professionalName: '',
  specialty: '',
  country: '',
  phone: '',
  notes: '',
})

onMounted(async () => {
  try {
    const me = await apiFetch<{
      user: { fullName: string; phone?: string | null; onboardingCompleted: boolean }
      tenant: { medfileCode?: string; profile?: Record<string, string> | null }
    }>('/api/auth/me')

    medfileCode.value = me.tenant.medfileCode ?? ''
    form.professionalName = me.tenant.profile?.professionalName ?? me.user.fullName
    form.specialty = me.tenant.profile?.specialty ?? ''
    form.country = me.tenant.profile?.country ?? ''
    form.phone = me.user.phone ?? ''
    form.notes = me.tenant.profile?.notes ?? ''

    if (me.user.onboardingCompleted) {
      await router.replace('/dashboard')
    }
  } catch {
    error.value = 'No pudimos cargar tu perfil inicial.'
  }
})

async function submit() {
  error.value = ''

  if (!getAccessToken()) {
    error.value = 'Tu sesión expiró. Inicia sesión e inténtalo de nuevo.'
    await router.push('/login?expired=1')
    return
  }

  loading.value = true

  try {
    await apiFetch('/api/auth/onboarding', {
      method: 'POST',
      body: {
        professionalName: form.professionalName.trim(),
        specialty: form.specialty.trim(),
        country: form.country.trim(),
        notes: form.notes.trim(),
      },
    })

    saved.value = true
    await router.push('/dashboard')
  } catch (err) {
    if (typeof err === 'object' && err && 'status' in err && (err as { status?: number }).status === 401) {
      error.value = 'Tu sesión expiró. Inicia sesión e inténtalo de nuevo.'
      await router.push('/login?expired=1')
      return
    }

    error.value = 'No pudimos guardar tu perfil. Intenta nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>
