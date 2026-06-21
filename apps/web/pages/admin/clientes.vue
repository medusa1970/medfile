<template>
  <div>
    <header class="dashboard-topbar">
      <div class="dashboard-topbar__main">
        <EyebrowPill>Clientes</EyebrowPill>
        <h1 class="dashboard-topbar__title">Médicos registrados</h1>
        <p class="dashboard-topbar__lead">Tenants, titular, plan y estado de cuenta.</p>
      </div>
    </header>

    <PanelCard padded class="patient-panel-compact">
      <p v-if="pending" class="panel-empty panel-empty--compact">Cargando clientes…</p>
      <p v-else-if="error" class="form-error">{{ error }}</p>

      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Consultorio</th>
              <th>Titular</th>
              <th>Plan</th>
              <th>Estado</th>
              <th>Pago</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in clients" :key="client.id">
              <td>
                <strong>{{ client.name }}</strong>
                <span class="admin-table-sub">{{ client.medfileCode }}</span>
              </td>
              <td>
                <template v-if="client.owner">
                  {{ client.owner.fullName }}
                  <span class="admin-table-sub">{{ client.owner.email }}</span>
                  <StatusBadge v-if="!client.owner.emailVerified" tone="warning">Sin verificar</StatusBadge>
                  <StatusBadge v-if="client.owner.status !== 'active'" tone="danger">
                    {{ client.owner.status }}
                  </StatusBadge>
                </template>
                <span v-else class="admin-table-sub">Sin titular</span>
              </td>
              <td>{{ client.subscription?.planCode ?? '—' }}</td>
              <td>{{ client.subscription?.status ?? client.status }}</td>
              <td>{{ client.subscription?.paymentProvider ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </PanelCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'], ssr: false })

interface AdminClientRow {
  id: string
  name: string
  medfileCode: string
  status: string
  owner: {
    fullName: string
    email: string
    status: string
    emailVerified: boolean
  } | null
  subscription: {
    planCode: string
    status: string
    paymentProvider: string | null
  } | null
}

const { apiFetch } = useMedfileApi()
const error = ref('')

const { data: clients, pending } = await useAsyncData('admin-clients', async () => {
  try {
    return await apiFetch<AdminClientRow[]>('/api/admin/clients')
  } catch {
    error.value = 'No se pudo cargar la lista de clientes.'
    return [] as AdminClientRow[]
  }
})
</script>

<style scoped>
.admin-table-wrap {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.admin-table th,
.admin-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgb(226 232 240 / 0.9);
  text-align: left;
  vertical-align: top;
}

.admin-table th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--mf-slate-500);
}

.admin-table-sub {
  display: block;
  margin-top: 2px;
  color: var(--mf-slate-500);
  font-size: 12px;
}
</style>
