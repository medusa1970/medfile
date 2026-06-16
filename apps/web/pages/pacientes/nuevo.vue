<template>
  <DoctorShell>
    <div class="dashboard-page">
      <header class="dashboard-topbar">
        <div class="dashboard-topbar__main">
          <EyebrowPill>Nuevo paciente</EyebrowPill>
          <h1 class="dashboard-topbar__title">Registrar paciente</h1>
          <p class="dashboard-topbar__lead">Filiación inicial; el perfil clínico se completa después.</p>
        </div>
        <MfButton variant="secondary" to="/pacientes">Volver al listado</MfButton>
      </header>

      <PanelCard title="Datos del paciente" padded class="dashboard-panel">
        <form class="auth-form patient-form patient-form--inset" @submit.prevent="submit">
          <div class="form-section">
            <h3>Filiación</h3>
            <div class="form-grid-2">
              <FormField
                v-model="form.fullName"
                inset-label
                icon="user"
                label="Nombre completo"
                autocomplete="name"
                required
              />
              <FormField
                v-model="form.documentId"
                inset-label
                optional
                icon="file"
                label="Documento / CI"
              />
              <FormSelectField
                v-model="form.sex"
                inset-label
                optional
                icon="users"
                label="Sexo"
                placeholder-option="Seleccionar"
                :options="sexOptions"
              />
              <FormField
                v-model="form.birthDate"
                inset-label
                optional
                icon="calendar"
                label="Fecha de nacimiento"
                type="date"
              />
              <FormField
                v-model="form.guardianName"
                inset-label
                optional
                icon="user"
                label="Padre o tutor"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Domicilio</h3>
            <div class="form-grid-2">
              <FormField
                v-model="form.address.department"
                inset-label
                optional
                icon="clinic"
                label="Departamento"
              />
              <FormField
                v-model="form.address.province"
                inset-label
                optional
                icon="clinic"
                label="Provincia"
              />
              <FormField
                v-model="form.address.district"
                inset-label
                optional
                icon="clinic"
                label="Distrito"
              />
              <FormField
                v-model="form.address.locality"
                inset-label
                optional
                icon="home"
                label="Localidad"
              />
              <FormField
                v-model="form.address.streetAddress"
                inset-label
                optional
                icon="home"
                label="Dirección"
                class="form-wide"
              />
              <FormField
                v-model="form.phone"
                inset-label
                optional
                icon="mobile"
                label="Teléfono"
                type="tel"
                autocomplete="tel"
              />
              <FormField
                v-model="form.email"
                inset-label
                optional
                icon="mail"
                label="Correo"
                type="email"
                autocomplete="email"
              />
            </div>
          </div>

          <div class="form-section">
            <h3>Contacto y seguro</h3>
            <div class="form-grid-2">
              <FormSelectField
                v-model="form.status"
                inset-label
                icon="alert"
                label="Estado inicial"
                :options="statusOptions"
              />
              <FormField
                v-model="form.emergencyContactName"
                inset-label
                optional
                icon="user"
                label="Contacto de emergencia"
              />
              <FormField
                v-model="form.emergencyContactPhone"
                inset-label
                optional
                icon="mobile"
                label="Teléfono emergencia"
                type="tel"
              />
              <FormField
                v-model="form.insuranceName"
                inset-label
                optional
                icon="shield"
                label="Seguro médico"
              />
              <FormField
                v-model="form.policyNumber"
                inset-label
                optional
                icon="file"
                label="No. póliza"
              />
            </div>
          </div>

          <div v-if="error" class="form-error form-wide">{{ error }}</div>
          <div v-if="saved" class="form-success form-wide">Paciente registrado correctamente.</div>

          <div class="form-actions form-wide">
            <MfButton variant="secondary" to="/pacientes">Cancelar</MfButton>
            <MfButton type="submit">{{ loading ? 'Guardando…' : 'Guardar paciente' }}</MfButton>
          </div>
        </form>
      </PanelCard>
    </div>
  </DoctorShell>
</template>

<script setup lang="ts">
const sexOptions = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Otro' },
]

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'critical', label: 'Crítico' },
]

const { apiFetch } = useMedfileApi()
const router = useRouter()
const loading = ref(false)
const saved = ref(false)
const error = ref('')

const form = reactive({
  fullName: '',
  documentId: '',
  sex: '',
  birthDate: '',
  guardianName: '',
  address: {
    department: '',
    province: '',
    district: '',
    locality: '',
    streetAddress: '',
  },
  phone: '',
  email: '',
  status: 'active',
  emergencyContactName: '',
  emergencyContactPhone: '',
  insuranceName: '',
  policyNumber: '',
})

async function submit() {
  error.value = ''
  saved.value = false
  loading.value = true

  try {
    const created = await apiFetch<{ id?: string; _id?: string }>('/api/patients', {
      method: 'POST',
      body: sanitizeBody(form),
    })

    const patientId = resolveApiId(created)
    saved.value = true
    await router.push(patientId ? `/pacientes/${patientId}` : '/pacientes')
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function sanitizeBody(input: typeof form) {
  const body: Record<string, unknown> = {
    fullName: input.fullName,
    documentId: input.documentId || undefined,
    sex: input.sex || undefined,
    birthDate: input.birthDate || undefined,
    guardianName: input.guardianName || undefined,
    phone: input.phone || undefined,
    email: input.email || undefined,
    status: input.status,
    emergencyContactName: input.emergencyContactName || undefined,
    emergencyContactPhone: input.emergencyContactPhone || undefined,
    insuranceName: input.insuranceName || undefined,
    policyNumber: input.policyNumber || undefined,
  }

  const address = Object.fromEntries(
    Object.entries(input.address).filter(([, value]) => value !== ''),
  )

  if (Object.keys(address).length > 0) {
    body.address = address
  }

  return body
}

function getErrorMessage(err: unknown) {
  if (typeof err === 'object' && err && 'data' in err) {
    const data = (err as { data?: { message?: string | string[] } }).data
    if (Array.isArray(data?.message)) return data.message.join(', ')
    if (data?.message) return data.message
  }

  return 'No pudimos registrar al paciente. Verifica los datos e intenta nuevamente.'
}
</script>

<style scoped>
.dashboard-panel :deep(.panel-body) {
  padding-top: 4px;
}

.form-wide {
  grid-column: 1 / -1;
}
</style>
