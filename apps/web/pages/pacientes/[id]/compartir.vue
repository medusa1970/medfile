<template>
  <div class="dashboard-page patient-subpage">
      <header class="dashboard-topbar">
        <div class="dashboard-topbar__main">
          <EyebrowPill>Colaboración clínica</EyebrowPill>
          <h1 class="dashboard-topbar__title">Compartir con colega</h1>
          <p class="dashboard-topbar__lead">
            {{ patientName }} — acceso temporal de solo lectura. Tú sigues siendo el médico titular.
          </p>
        </div>
      </header>

      <PanelCard v-if="!canShare" title="Plan Profesional requerido" padded class="patient-panel-compact">
        <p class="panel-empty panel-empty--compact">
          Compartir historiales con colegas Medfile está incluido en el plan Profesional. Incluye
          permisos granulares, duración limitada y revocación inmediata.
        </p>
        <MfButton :to="subscriptionReturnRoute">Ver planes</MfButton>
      </PanelCard>

      <template v-else>
        <PanelCard title="Nueva solicitud de acceso" padded>
          <ShareWithColleagueForm
            :patient-id="patientId"
            :patient-name="patientName"
            @shared="refreshShares"
          />
        </PanelCard>

        <PanelCard v-if="activeShares.length" title="Accesos enviados" :badge="`${activeShares.length} activos`" padded>
          <ul class="share-status-list">
            <li v-for="share in activeShares" :key="share.id" class="share-status-item">
              <div>
                <strong>{{ share.targetTenantName || share.targetMedfileCode }}</strong>
                <span>{{ statusLabel(share.status) }} · vence {{ formatDate(share.expiresAt) }}</span>
              </div>
              <StatusBadge>{{ share.targetMedfileCode }}</StatusBadge>
            </li>
          </ul>
          <MfButton variant="secondary" to="/compartidos" class="share-status-link">
            Gestionar en Compartidos
          </MfButton>
        </PanelCard>
      </template>
    </div>
</template>

<script setup lang="ts">
import type { ClinicalShareSummary } from '@medfile/types'
import { normalizePlanCode, subscriptionPlans } from '@medfile/types/plans'
import { subscriptionRoute } from '~/utils/subscription-route'

definePageMeta({ layout: 'doctor', ssr: false })

const route = useRoute()
const { apiFetch } = useMedfileApi()
const patientId = computed(() => String(route.params.id ?? ''))
const subscriptionReturnRoute = computed(() => subscriptionRoute(route.fullPath))

const patientName = ref('Paciente')
const planCode = ref('free')

const { data: sharesData, refresh: refreshShares } = await useAsyncData(
  `patient-shares-${patientId.value}`,
  async () => {
    if (!patientId.value) return [] as ClinicalShareSummary[]
    try {
      return await apiFetch<ClinicalShareSummary[]>('/api/clinical-shares/sent')
    } catch {
      return [] as ClinicalShareSummary[]
    }
  },
  { server: false },
)

onMounted(async () => {
  if (!patientId.value) {
    await navigateTo('/pacientes')
    return
  }

  try {
    const [patient, subscription] = await Promise.all([
      apiFetch<{ fullName: string }>(`/api/patients/${patientId.value}`),
      apiFetch<{ planCode: string }>('/api/subscriptions/current'),
    ])
    patientName.value = patient.fullName
    planCode.value = normalizePlanCode(subscription.planCode)
  } catch {
    patientName.value = 'Paciente'
  }
})

const canShare = computed(() => {
  const plan = subscriptionPlans.find((item) => item.code === planCode.value)
  return plan?.capabilities.clinicalShare ?? false
})

const activeShares = computed(() =>
  (sharesData.value ?? []).filter(
    (share) =>
      share.sourcePatientId === patientId.value &&
      ['pending', 'active'].includes(share.status),
  ),
)

function statusLabel(status: ClinicalShareSummary['status']) {
  const labels: Record<ClinicalShareSummary['status'], string> = {
    pending: 'Pendiente de aceptación',
    active: 'Activo',
    rejected: 'Rechazado',
    revoked: 'Revocado',
    expired: 'Expirado',
  }
  return labels[status]
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped>
.share-status-list {
  display: grid;
  gap: 10px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
}

.share-status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--mf-slate-100);
  border-radius: 12px;
  background: rgb(248 250 252 / 0.88);
}

.share-status-item strong {
  display: block;
  color: var(--mf-navy-900);
  font-size: 14px;
}

.share-status-item span {
  color: var(--mf-slate-500);
  font-size: 13px;
}

.share-status-link {
  width: 100%;
}
</style>
