<template>
  <div>
    <header class="dashboard-topbar">
      <div class="dashboard-topbar__main">
        <EyebrowPill>Pagos</EyebrowPill>
        <h1 class="dashboard-topbar__title">Configuración de cobro</h1>
        <p class="dashboard-topbar__lead">
          Mercado Pago, QR Banco Económico y moneda de precios (BOB). Las credenciales sensibles
          permanecen en variables de entorno del servidor.
        </p>
      </div>
    </header>

    <PanelCard title="Proveedores habilitados" padded class="patient-panel-compact">
      <p v-if="loading" class="panel-empty panel-empty--compact">Cargando…</p>

      <form v-else class="auth-form admin-settings-form" @submit.prevent="save">
        <FormSelectField
          v-model="form.defaultProvider"
          label="Proveedor por defecto"
          :options="providerOptions"
        />

        <label class="admin-checkbox">
          <input v-model="form.mercadopagoEnabled" type="checkbox" />
          Mercado Pago habilitado
        </label>

        <label class="admin-checkbox">
          <input v-model="form.economicoQrEnabled" type="checkbox" />
          QR Banco Económico habilitado
        </label>

        <FormField v-model="form.economicoMerchantLabel" label="Nombre comercio (QR)" />
        <FormField
          v-model="form.economicoInstructions"
          label="Instrucciones para el médico"
          textarea
        />

        <p class="panel-hint panel-hint--compact">
          Variables servidor: <code>MERCADOPAGO_ACCESS_TOKEN</code>,
          <code>BANCO_ECONOMICO_API_URL</code>, <code>BANCO_ECONOMICO_CLIENT_ID</code>,
          <code>BANCO_ECONOMICO_CLIENT_SECRET</code>, <code>MEDFILE_ADMIN_EMAILS</code>.
        </p>

        <div v-if="error" class="form-error">{{ error }}</div>
        <div v-if="saved" class="form-success">Configuración guardada.</div>

        <MfButton type="submit">{{ saving ? 'Guardando…' : 'Guardar cambios' }}</MfButton>
      </form>
    </PanelCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'], ssr: false })

const { apiFetch } = useMedfileApi()
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const form = reactive({
  defaultProvider: 'mock',
  mercadopagoEnabled: true,
  economicoQrEnabled: false,
  economicoMerchantLabel: 'Banco Economico',
  economicoInstructions: '',
})

const providerOptions = [
  { value: 'mock', label: 'Modo prueba (mock)' },
  { value: 'mercadopago', label: 'Mercado Pago' },
  { value: 'economico_qr', label: 'QR Banco Económico' },
]

onMounted(async () => {
  try {
    const settings = await apiFetch<typeof form>('/api/admin/settings/payments')
    Object.assign(form, settings)
  } catch {
    error.value = 'No se pudo cargar la configuración.'
  } finally {
    loading.value = false
  }
})

async function save() {
  error.value = ''
  saved.value = false
  saving.value = true

  try {
    const settings = await apiFetch<typeof form>('/api/admin/settings/payments', {
      method: 'PATCH',
      body: { ...form },
    })
    Object.assign(form, settings)
    saved.value = true
  } catch {
    error.value = 'No se pudo guardar la configuración.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-settings-form {
  display: grid;
  gap: 14px;
}

.admin-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--mf-slate-700);
}
</style>
