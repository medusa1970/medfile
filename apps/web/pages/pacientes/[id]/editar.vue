<template>
  <div class="dashboard-page">
      <header class="dashboard-topbar">
        <div class="dashboard-topbar__main">
          <EyebrowPill>Editar paciente</EyebrowPill>
          <h1 class="dashboard-topbar__title">{{ form.fullName || 'Filiación' }}</h1>
          <p class="dashboard-topbar__lead">
            Actualiza datos de contacto, domicilio y seguro. Antecedentes, consultas y compartir
            con colegas están en el perfil del paciente.
          </p>
        </div>
      </header>

      <PanelCard title="Datos del paciente" padded class="dashboard-panel">
        <p v-if="pageLoading" class="panel-empty">Cargando datos…</p>

        <form v-else class="auth-form patient-form patient-form--inset" @submit.prevent="submit">
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
                label="Estado"
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
          <div v-if="saved" class="form-success form-wide">Datos actualizados correctamente.</div>

          <div class="form-actions form-wide">
            <MfButton type="submit">{{ loading ? 'Guardando…' : 'Guardar cambios' }}</MfButton>
          </div>
        </form>
      </PanelCard>
    </div>
</template>

<script setup lang="ts">
import type { PatientAddress } from '@medfile/types'
import { buildPatientBody, getPatientFormErrorMessage } from '~/utils/patient-form-body'

definePageMeta({ layout: 'doctor', ssr: false })

interface PatientDetail {
  id?: string
  _id?: string
  fullName: string
  documentId?: string
  sex?: string
  birthDate?: string
  guardianName?: string
  address?: PatientAddress
  phone?: string
  email?: string
  status?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  insuranceName?: string
  policyNumber?: string
}

const sexOptions = [
  { value: 'female', label: 'Femenino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Otro' },
]

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'critical', label: 'Crítico' },
  { value: 'archived', label: 'Archivado' },
]

const router = useRouter()
const { apiFetch } = useMedfileApi()
const { patientId, routes, fetchPatient, ensurePatientId, refreshPatientCaches } = usePatientPage()
const pageLoading = ref(true)
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

onMounted(async () => {
  if (!(await ensurePatientId())) return

  try {
    const patient = await fetchPatient()
    if (patient) applyPatient(patient)
  } catch {
    error.value = 'No pudimos cargar los datos del paciente.'
  } finally {
    pageLoading.value = false
  }
})

function applyPatient(patient: PatientDetail) {
  form.fullName = patient.fullName ?? ''
  form.documentId = patient.documentId ?? ''
  form.sex = patient.sex ?? ''
  form.birthDate = patient.birthDate?.slice(0, 10) ?? ''
  form.guardianName = patient.guardianName ?? ''
  form.address.department = patient.address?.department ?? ''
  form.address.province = patient.address?.province ?? ''
  form.address.district = patient.address?.district ?? ''
  form.address.locality = patient.address?.locality ?? ''
  form.address.streetAddress = patient.address?.streetAddress ?? ''
  form.phone = patient.phone ?? ''
  form.email = patient.email ?? ''
  form.status = patient.status ?? 'active'
  form.emergencyContactName = patient.emergencyContactName ?? ''
  form.emergencyContactPhone = patient.emergencyContactPhone ?? ''
  form.insuranceName = patient.insuranceName ?? ''
  form.policyNumber = patient.policyNumber ?? ''
}

async function submit() {
  error.value = ''
  saved.value = false
  loading.value = true

  try {
    await apiFetch(`/api/patients/${patientId.value}`, {
      method: 'PATCH',
      body: buildPatientBody(form),
    })

    await refreshPatientCaches()
    saved.value = true
    await router.push(routes.value.profile)
  } catch (err) {
    error.value = getPatientFormErrorMessage(err, 'update')
  } finally {
    loading.value = false
  }
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
