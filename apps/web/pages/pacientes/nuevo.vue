<template>
  <DoctorShell>
    <header class="app-header">
      <div>
        <EyebrowPill>Nuevo archivo medico</EyebrowPill>
        <h1>Registrar paciente</h1>
        <p>Filiacion inicial del paciente. Los antecedentes y atenciones se completan en el perfil.</p>
      </div>
      <MfButton variant="secondary" to="/pacientes">Volver al listado</MfButton>
    </header>

    <PanelCard title="Datos del paciente" padded>
      <form class="auth-form patient-form" @submit.prevent="submit">
        <div class="form-section">
          <h3>Filiacion</h3>
          <div class="form-grid-2">
            <FormField v-model="form.fullName" label="Nombre completo" autocomplete="name" />
            <FormField v-model="form.documentId" label="Documento / CI" />
            <label class="form-field">
              <span>Sexo</span>
              <select v-model="form.sex">
                <option value="">Seleccionar</option>
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
                <option value="other">Otro</option>
              </select>
            </label>
            <FormField v-model="form.birthDate" label="Fecha de nacimiento" type="date" />
            <FormField v-model="form.guardianName" label="Padre o tutor" />
          </div>
        </div>

        <div class="form-section">
          <h3>Domicilio</h3>
          <div class="form-grid-2">
            <FormField v-model="form.address.department" label="Departamento" />
            <FormField v-model="form.address.province" label="Provincia" />
            <FormField v-model="form.address.district" label="Distrito" />
            <FormField v-model="form.address.locality" label="Localidad" />
            <FormField v-model="form.address.streetAddress" label="Direccion" />
            <FormField v-model="form.phone" label="Telefono" type="tel" autocomplete="tel" />
            <FormField v-model="form.email" label="Correo" type="email" autocomplete="email" />
          </div>
        </div>

        <div class="form-section">
          <h3>Contacto y seguro</h3>
          <div class="form-grid-2">
            <label class="form-field">
              <span>Estado inicial</span>
              <select v-model="form.status">
                <option value="active">Activo</option>
                <option value="follow_up">Seguimiento</option>
                <option value="critical">Critico</option>
              </select>
            </label>
            <FormField v-model="form.emergencyContactName" label="Contacto de emergencia" />
            <FormField v-model="form.emergencyContactPhone" label="Telefono emergencia" type="tel" />
            <FormField v-model="form.insuranceName" label="Seguro medico" />
            <FormField v-model="form.policyNumber" label="No. poliza" />
          </div>
        </div>

        <div v-if="error" class="form-error form-wide">{{ error }}</div>
        <div v-if="saved" class="form-success form-wide">Paciente registrado correctamente.</div>

        <div class="form-actions form-wide">
          <MfButton variant="secondary" to="/pacientes">Cancelar</MfButton>
          <MfButton type="submit">{{ loading ? 'Guardando...' : 'Guardar paciente' }}</MfButton>
        </div>
      </form>
    </PanelCard>
  </DoctorShell>
</template>

<script setup lang="ts">
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
