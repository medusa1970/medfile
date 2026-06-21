<template>
  <div>
    <PanelCard title="Resumen de plataforma" padded class="patient-panel-compact">
      <p v-if="pending" class="panel-empty panel-empty--compact">Cargando…</p>
      <StatStrip v-else-if="stats.length" :items="stats" aria-label="Metricas admin" />
      <p v-if="error" class="form-error">{{ error }}</p>
    </PanelCard>

    <PanelCard title="Accesos rápidos" padded class="patient-panel-compact">
      <div class="admin-quick-links">
        <MfButton to="/admin/clientes">Ver clientes (médicos)</MfButton>
        <MfButton variant="secondary" to="/admin/configuracion">Pagos y QR Banco Económico</MfButton>
      </div>
    </PanelCard>
  </div>
</template>

<script setup lang="ts">
import type { StatStripItem } from '~/components/ui/StatStrip.vue'

definePageMeta({ layout: 'admin', middleware: ['admin'], ssr: false })

const { apiFetch } = useMedfileApi()
const error = ref('')
const overview = ref<{ tenants: number; users: number; subscriptions: number; paidTenants: number } | null>(
  null,
)

const { pending } = await useAsyncData('admin-overview', async () => {
  try {
    overview.value = await apiFetch('/api/admin/overview')
  } catch {
    error.value = 'No tienes acceso de administrador o el API no respondió.'
  }
})

const stats = computed<StatStripItem[]>(() => {
  if (!overview.value) return []

  return [
    { label: 'Consultorios', value: String(overview.value.tenants) },
    { label: 'Usuarios', value: String(overview.value.users) },
    { label: 'Suscripciones', value: String(overview.value.subscriptions) },
    { label: 'Planes de pago', value: String(overview.value.paidTenants), badge: 'activos' },
  ]
})
</script>

<style scoped>
.admin-quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
