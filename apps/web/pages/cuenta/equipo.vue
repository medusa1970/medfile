<template>
  <div class="dashboard-page">
    <header class="dashboard-topbar">
      <div class="dashboard-topbar__main">
        <EyebrowPill>Equipo</EyebrowPill>
        <h1 class="dashboard-topbar__title">Mi equipo</h1>
        <p class="dashboard-topbar__lead">
          Invita colaboradores del consultorio. Compartir con colegas es distinto —
          <NuxtLink to="/compartidos">Compartidos</NuxtLink>.
        </p>
      </div>
    </header>

    <StatStrip v-if="usageStats.length" :items="usageStats" aria-label="Cupo de usuarios" />

    <PanelCard title="Invitar colaborador" padded class="patient-panel-compact">
      <p v-if="!canInviteAny" class="panel-hint panel-hint--compact">
        Tu plan actual no incluye usuarios delegados.
        <NuxtLink :to="subscriptionRoute()">Mejorar plan</NuxtLink>
      </p>
      <form v-else class="auth-form account-form" @submit.prevent="sendInvitation">
        <div class="auth-form-row">
          <FormField v-model="inviteForm.fullName" label="Nombre completo" required />
          <FormField v-model="inviteForm.email" label="Correo" type="email" required />
        </div>
        <div class="auth-form-row">
          <label class="form-field">
            <span class="form-field__label">Rol</span>
            <select v-model="inviteForm.role" class="form-field__input">
              <option value="assistant">Asistente administrativo</option>
              <option v-if="canInviteClinical" value="clinical_capture">Captura clínica (enfermería)</option>
            </select>
          </label>
        </div>
        <div v-if="inviteForm.role === 'clinical_capture'" class="auth-form-row">
          <label class="form-field">
            <span class="form-field__label">Clínicas asignadas</span>
            <select
              v-model="inviteForm.clinicContextIds"
              class="form-field__input"
              multiple
              size="4"
            >
              <option v-for="site in clinicSites" :key="site.id" :value="site.id">
                {{ site.label || site.name }}
              </option>
            </select>
          </label>
        </div>
        <p v-if="inviteForm.role === 'clinical_capture' && !clinicSites.length" class="panel-hint">
          Crea al menos una clínica abajo antes de invitar captura clínica.
        </p>
        <p v-if="inviteError" class="form-error">{{ inviteError }}</p>
        <p v-if="inviteSuccess" class="form-success">{{ inviteSuccess }}</p>
        <MfButton type="submit" :disabled="inviteLoading || seatsFull">
          {{ inviteLoading ? 'Enviando…' : 'Enviar invitación' }}
        </MfButton>
        <p v-if="devAcceptUrl" class="panel-hint panel-hint--compact">
          Dev: <a :href="devAcceptUrl">{{ devAcceptUrl }}</a>
        </p>
      </form>
    </PanelCard>

    <PanelCard v-if="canInviteClinical" title="Clínicas" padded class="patient-panel-compact">
      <form class="auth-form account-form" @submit.prevent="createClinicSite">
        <div class="auth-form-row">
          <FormField v-model="newClinic.name" label="Nombre" required placeholder="Ej. Clínica Norte" />
          <FormField v-model="newClinic.label" label="Etiqueta corta" placeholder="Opcional" />
        </div>
        <MfButton type="submit" :disabled="clinicLoading">Agregar clínica</MfButton>
      </form>
      <ul v-if="clinicSites.length" class="team-member-list">
        <li v-for="site in clinicSites" :key="site.id" class="team-member-item">
          <strong>{{ site.label || site.name }}</strong>
        </li>
      </ul>
    </PanelCard>

    <PanelCard title="Miembros activos" padded class="patient-panel-compact">
      <p v-if="membersPending" class="panel-empty panel-empty--compact">Cargando…</p>
      <ul v-else-if="(members ?? []).length" class="team-member-list">
        <li v-for="member in members ?? []" :key="member.id" class="team-member-item">
          <div>
            <strong>{{ member.fullName }}</strong>
            <span class="team-member-meta">
              {{ member.email }} · {{ roleLabel(member.role) }}
              <template v-if="member.clinicContexts?.length">
                · {{ formatClinics(member.clinicContexts) }}
              </template>
            </span>
          </div>
          <div class="team-member-actions">
            <MfButton
              v-if="member.role === 'clinical_capture'"
              variant="ghost"
              @click="editClinics(member)"
            >
              Clínicas
            </MfButton>
            <MfButton
              v-if="member.role !== 'owner'"
              variant="secondary"
              :disabled="revokingId === member.id"
              @click="revokeMember(member.id)"
            >
              Revocar
            </MfButton>
          </div>
        </li>
      </ul>
      <p v-else class="panel-empty panel-empty--compact">Solo el titular por ahora.</p>
    </PanelCard>

    <PanelCard title="Invitaciones pendientes" padded class="patient-panel-compact">
      <p v-if="!(invitations ?? []).length" class="panel-empty panel-empty--compact">Sin invitaciones pendientes.</p>
      <ul v-else class="team-member-list">
        <li v-for="invitation in invitations ?? []" :key="invitation.id" class="team-member-item">
          <div>
            <strong>{{ invitation.fullName }}</strong>
            <span class="team-member-meta">
              {{ invitation.email }} · {{ roleLabel(invitation.role) }} · vence
              {{ formatDate(invitation.expiresAt) }}
            </span>
          </div>
          <MfButton variant="secondary" @click="revokeInvitation(invitation.id)">Cancelar</MfButton>
        </li>
      </ul>
    </PanelCard>

    <PanelCard v-if="canViewAudit" title="Auditoría reciente" padded class="patient-panel-compact">
      <p v-if="!(auditLog ?? []).length" class="panel-empty panel-empty--compact">
        Sin eventos registrados aún.
      </p>
      <ul v-else class="audit-list">
        <li v-for="entry in auditLog ?? []" :key="entry.id" class="audit-item">
          <strong>{{ auditActionLabel(entry.action) }}</strong>
          <span class="team-member-meta">
            {{ entry.userRole }} · {{ formatDateTime(entry.at) }}
          </span>
        </li>
      </ul>
    </PanelCard>

    <MemberClinicsModal
      :open="clinicsModalOpen"
      :member-id="clinicsModalMember?.id ?? ''"
      :member-name="clinicsModalMember?.fullName ?? ''"
      :clinic-sites="clinicSites"
      :initial-ids="clinicsModalMember?.clinicContexts ?? []"
      @close="clinicsModalOpen = false"
      @saved="onClinicsSaved"
    />
  </div>
</template>

<script setup lang="ts">
import type { StatStripItem } from '~/components/ui/StatStrip.vue'
import { subscriptionRoute } from '~/utils/subscription-route'

definePageMeta({ layout: 'doctor', middleware: ['team-owner'], ssr: false })

interface TeamMember {
  id: string
  fullName: string
  email: string
  role: string
  status: string
  clinicContexts?: string[]
}

interface TeamInvitation {
  id: string
  email: string
  fullName: string
  role: string
  expiresAt: string
}

interface ClinicSite {
  id: string
  name: string
  label?: string
}

interface AuditEntry {
  id: string
  action: string
  userRole: string
  at: string | null
}

const { apiFetch } = useMedfileApi()
const inviteForm = reactive({
  fullName: '',
  email: '',
  role: 'assistant' as 'assistant' | 'clinical_capture',
  clinicContextIds: [] as string[],
})
const inviteLoading = ref(false)
const inviteError = ref('')
const inviteSuccess = ref('')
const devAcceptUrl = ref('')
const revokingId = ref('')
const canInviteAssistant = ref(false)
const canInviteClinical = ref(false)
const canViewAudit = ref(false)
const seatsFull = ref(false)
const usageStats = ref<StatStripItem[]>([])
const clinicSites = ref<ClinicSite[]>([])
const clinicLoading = ref(false)
const newClinic = reactive({ name: '', label: '' })
const clinicsModalOpen = ref(false)
const clinicsModalMember = ref<TeamMember | null>(null)

const canInviteAny = computed(() => canInviteAssistant.value || canInviteClinical.value)

const { data: members, pending: membersPending, refresh: refreshMembers } = await useAsyncData(
  'team-members',
  () => apiFetch<TeamMember[]>('/api/team/members'),
)

const { data: invitations, refresh: refreshInvitations } = await useAsyncData(
  'team-invitations',
  () => apiFetch<TeamInvitation[]>('/api/team/invitations'),
)

const { data: auditLog, refresh: refreshAudit } = await useAsyncData(
  'team-audit',
  () => apiFetch<AuditEntry[]>('/api/team/audit?limit=20'),
)

async function loadClinicSites() {
  if (!canInviteClinical.value) return
  try {
    const sites = await apiFetch<Array<{ _id?: string; id?: string; name: string; label?: string }>>(
      '/api/clinical-capture/clinic-sites',
    )
    clinicSites.value = sites.map((site) => ({
      id: site.id ?? site._id ?? '',
      name: site.name,
      label: site.label,
    }))
  } catch {
    clinicSites.value = []
  }
}

async function loadPlanUsage() {
  try {
    const me = await apiFetch<{
      subscription: {
        plan: {
          capabilities: { assistantUsers: boolean; clinicalCaptureUsers: boolean; auditLog: boolean }
          limits: { users: number }
        }
        usage: { users: { used: number; limit: number } }
      }
    }>('/api/auth/me')

    canInviteAssistant.value = me.subscription.plan.capabilities.assistantUsers
    canInviteClinical.value = me.subscription.plan.capabilities.clinicalCaptureUsers
    canViewAudit.value = me.subscription.plan.capabilities.auditLog
    const used = me.subscription.usage.users.used
    const limit = me.subscription.usage.users.limit
    seatsFull.value = used >= limit
    usageStats.value = [
      { label: 'Usuarios', value: `${used} / ${limit}`, badge: seatsFull.value ? 'completo' : '' },
    ]
    await loadClinicSites()
  } catch {
    canInviteAssistant.value = false
    canInviteClinical.value = false
  }
}

function roleLabel(role: string) {
  if (role === 'owner') return 'Titular'
  if (role === 'assistant') return 'Asistente'
  if (role === 'clinical_capture') return 'Captura clínica'
  return role
}

function formatClinics(ids: string[]) {
  return ids
    .map((id) => clinicSites.value.find((site) => site.id === id)?.label ?? id)
    .join(', ')
}

function auditActionLabel(action: string) {
  const labels: Record<string, string> = {
    'team.invite': 'Invitación enviada',
    'team.join': 'Miembro se unió',
    'team.revoke': 'Acceso revocado',
    'team.update_clinic_contexts': 'Clínicas actualizadas',
    'patient.create': 'Paciente creado',
    'patient.update': 'Paciente actualizado',
    'encounter.create': 'Atención registrada',
    'document.upload_request': 'Solicitud de subida',
    'queue.add': 'Paciente en cola',
    'nursing.capture': 'Signos vitales',
  }
  return labels[action] ?? action
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
}

function formatDateTime(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function sendInvitation() {
  inviteLoading.value = true
  inviteError.value = ''
  inviteSuccess.value = ''
  devAcceptUrl.value = ''

  try {
    const body: Record<string, unknown> = {
      fullName: inviteForm.fullName,
      email: inviteForm.email,
      role: inviteForm.role,
    }
    if (inviteForm.role === 'clinical_capture') {
      body.clinicContextIds = [...inviteForm.clinicContextIds]
    }

    const response = await apiFetch<{ acceptUrl?: string }>('/api/team/invitations', {
      method: 'POST',
      body,
    })
    inviteSuccess.value = 'Invitación enviada.'
    if (response.acceptUrl) devAcceptUrl.value = response.acceptUrl
    inviteForm.fullName = ''
    inviteForm.email = ''
    inviteForm.clinicContextIds = []
    await Promise.all([refreshMembers(), refreshInvitations(), refreshAudit(), loadPlanUsage()])
  } catch (error) {
    inviteError.value = getErrorMessage(error)
  } finally {
    inviteLoading.value = false
  }
}

async function createClinicSite() {
  clinicLoading.value = true
  try {
    await apiFetch('/api/clinical-capture/clinic-sites', {
      method: 'POST',
      body: { name: newClinic.name, label: newClinic.label || undefined },
    })
    newClinic.name = ''
    newClinic.label = ''
    await loadClinicSites()
  } catch (error) {
    inviteError.value = getErrorMessage(error)
  } finally {
    clinicLoading.value = false
  }
}

function editClinics(member: TeamMember) {
  clinicsModalMember.value = member
  clinicsModalOpen.value = true
}

async function onClinicsSaved() {
  await refreshMembers()
  await refreshAudit()
}

async function revokeMember(memberId: string) {
  revokingId.value = memberId
  try {
    await apiFetch(`/api/team/members/${memberId}`, { method: 'DELETE' })
    await Promise.all([refreshMembers(), refreshAudit(), loadPlanUsage()])
  } finally {
    revokingId.value = ''
  }
}

async function revokeInvitation(invitationId: string) {
  await apiFetch(`/api/team/invitations/${invitationId}`, { method: 'DELETE' })
  await Promise.all([refreshInvitations(), loadPlanUsage()])
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data
    const message = data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return 'No se pudo completar la acción.'
}

onMounted(() => {
  void loadPlanUsage()
})
</script>

<style scoped>
.team-member-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.team-member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--mf-neutral-200);
}

.team-member-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.team-member-meta {
  display: block;
  color: var(--mf-neutral-500);
  font-size: 13px;
}

.audit-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.audit-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--mf-neutral-200);
}
</style>
