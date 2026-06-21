<template>
  <div class="dashboard-page">
    <header class="app-header">
      <div>
        <EyebrowPill>Colaboración</EyebrowPill>
        <h1>Historiales compartidos</h1>
        <p>Solicitudes enviadas y recibidas entre colegas Medfile mediante Código Medfile.</p>
      </div>
    </header>

    <MedfileCodeCard v-if="medfileCode" :code="medfileCode" class="compartidos-code" />

    <div class="compartidos-tabs" role="tablist">
      <button
        type="button"
        :class="{ active: tab === 'inbox' }"
        role="tab"
        @click="tab = 'inbox'"
      >
        Recibidos ({{ inbox.length }})
      </button>
      <button
        type="button"
        :class="{ active: tab === 'sent' }"
        role="tab"
        @click="tab = 'sent'"
      >
        Enviados ({{ sent.length }})
      </button>
    </div>

    <section v-if="tab === 'inbox'" class="share-list">
      <PanelCard v-if="!inbox.length" title="Bandeja vacía" padded>
        <p>Cuando un colega te comparta un historial con tu código, aparecerá aquí.</p>
      </PanelCard>

      <article v-for="item in inbox" :key="item.id" class="share-item">
        <div>
          <strong>{{ item.sourcePatientName }}</strong>
          <span>de {{ item.sourceTenantName }} ({{ item.sourceMedfileCode }})</span>
          <StatusBadge>{{ statusLabel(item.status) }}</StatusBadge>
          <p v-if="item.message" class="share-item-message">{{ item.message }}</p>
          <small>Vence: {{ formatDate(item.expiresAt) }}</small>
        </div>
        <div class="share-item-actions">
          <MfButton
            v-if="item.status === 'pending'"
            @click="acceptShare(item.id)"
          >
            Aceptar
          </MfButton>
          <MfButton
            v-if="item.status === 'pending'"
            variant="secondary"
            @click="rejectShare(item.id)"
          >
            Rechazar
          </MfButton>
          <MfButton
            v-if="item.status === 'active'"
            :to="`/compartidos/${item.id}`"
          >
            Ver historial
          </MfButton>
        </div>
      </article>
    </section>

    <section v-else class="share-list">
      <PanelCard v-if="!sent.length" title="Sin envíos" padded>
        <p>Desde la ficha de un paciente puedes compartir con un colega usando su Código Medfile.</p>
      </PanelCard>

      <article v-for="item in sent" :key="item.id" class="share-item">
        <div>
          <strong>{{ item.sourcePatientName }}</strong>
          <span>→ {{ item.targetTenantName }} ({{ item.targetMedfileCode }})</span>
          <StatusBadge>{{ statusLabel(item.status) }}</StatusBadge>
          <small>Vence: {{ formatDate(item.expiresAt) }}</small>
        </div>
        <div class="share-item-actions">
          <MfButton
            v-if="item.status === 'active'"
            variant="secondary"
            :to="`/compartidos/${item.id}`"
          >
            Ver
          </MfButton>
          <MfButton
            v-if="['pending', 'active'].includes(item.status)"
            variant="ghost"
            @click="revokeShare(item.id)"
          >
            Revocar
          </MfButton>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'doctor', ssr: false })
import type { ClinicalShareSummary } from '@medfile/types'

const { apiFetch } = useMedfileApi()
const tab = ref<'inbox' | 'sent'>('inbox')
const medfileCode = ref('')
const inbox = ref<ClinicalShareSummary[]>([])
const sent = ref<ClinicalShareSummary[]>([])

async function loadAll() {
  const [me, inboxData, sentData] = await Promise.all([
    apiFetch<{ tenant: { medfileCode?: string } }>('/api/auth/me'),
    apiFetch<ClinicalShareSummary[]>('/api/clinical-shares/inbox'),
    apiFetch<ClinicalShareSummary[]>('/api/clinical-shares/sent'),
  ])

  medfileCode.value = me.tenant.medfileCode ?? ''
  inbox.value = inboxData
  sent.value = sentData
}

onMounted(() => {
  loadAll().catch(() => {})
})

async function acceptShare(id: string) {
  await apiFetch(`/api/clinical-shares/${id}/accept`, { method: 'POST' })
  await loadAll()
}

async function rejectShare(id: string) {
  await apiFetch(`/api/clinical-shares/${id}/reject`, { method: 'POST' })
  await loadAll()
}

async function revokeShare(id: string) {
  await apiFetch(`/api/clinical-shares/${id}/revoke`, { method: 'POST' })
  await loadAll()
}

function statusLabel(status: ClinicalShareSummary['status']) {
  const labels: Record<ClinicalShareSummary['status'], string> = {
    pending: 'Pendiente',
    active: 'Activo',
    rejected: 'Rechazado',
    revoked: 'Revocado',
    expired: 'Expirado',
  }
  return labels[status]
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped>
.compartidos-code {
  margin-bottom: 20px;
}

.compartidos-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.compartidos-tabs button {
  min-height: 40px;
  padding: 0 16px;
  border: var(--mf-border);
  border-radius: 999px;
  background: white;
  font-weight: 600;
  cursor: pointer;
}

.compartidos-tabs button.active {
  background: var(--mf-navy-900);
  color: white;
  border-color: var(--mf-navy-900);
}

.share-list {
  display: grid;
  gap: 12px;
}

.share-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border: var(--mf-border);
  border-radius: var(--mf-radius-md);
  background: white;
}

.share-item span,
.share-item small {
  display: block;
  color: var(--mf-neutral-500);
  font-size: 13px;
}

.share-item-message {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--mf-slate-700);
}

.share-item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}
</style>
