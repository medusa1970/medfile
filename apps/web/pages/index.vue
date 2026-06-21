<template>
  <div class="page-shell landing-page">
    <MarketingNav />

    <main>
      <!-- Hero -->
      <section class="container hero hero--landing">
        <div class="hero-intro">
          <EyebrowPill>
            SaaS clínico para médicos independientes
          </EyebrowPill>
          <h1>
            Menos papeles.
            <span class="hero-highlight">Más tiempo con tus pacientes.</span>
          </h1>
          <p class="hero-copy">
            Medfile organiza historias clínicas, consultas, exámenes y citas en web y móvil.
            Pensado para el ritmo real de tu consultorio.
          </p>
          <div class="hero-actions">
            <MfButton to="/registro">Empezar gratis</MfButton>
            <MfButton variant="secondary" to="#planes">Ver planes</MfButton>
          </div>

          <div class="hero-note">
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              Sin tarjeta para empezar
            </span>
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              Configuración en minutos
            </span>
            <span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              Tus datos, tu espacio privado
            </span>
          </div>
        </div>

        <div class="hero-showcase">
          <div class="trust-row trust-row--stacked" aria-label="Beneficios principales">
            <InfoCard
              v-for="item in trustItems"
              :key="item.value"
              :icon="item.icon"
              :value="item.value"
              :label="item.label"
            />
          </div>

          <aside class="product-preview product-preview--compact" aria-label="Vista previa de Medfile">
            <div class="preview-window">
              <div class="preview-topbar preview-topbar--compact">
                <strong>Consultorio Dr. Rivas</strong>
                <StatusBadge tone="success">En línea</StatusBadge>
              </div>
              <div class="preview-body preview-body--compact">
                <div class="preview-content preview-content--split">
                  <div class="metric-grid metric-grid--stacked">
                    <MetricCard label="Pacientes" value="1,284" />
                    <MetricCard label="Hoy" value="23" />
                    <MetricCard label="Pendiente" value="7" />
                  </div>

                  <PanelCard title="Pacientes recientes" badge="En vivo" :padded="false">
                    <div class="preview-patient-list">
                      <PatientRow
                        v-for="patient in previewPatients"
                        :key="patient.id"
                        :initials="patient.initials"
                        :name="patient.name"
                        :detail="patient.detail"
                        :status="patient.status"
                        :tone="patient.tone"
                      />
                    </div>
                  </PanelCard>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <nav class="landing-quick-nav container" aria-label="Acceso rápido">
        <a href="#flujo">Cómo funciona</a>
        <a href="#producto">Herramientas</a>
        <a href="#planes">Planes</a>
        <MfButton to="/registro">Empezar gratis</MfButton>
      </nav>

      <!-- Flujo diario -->
      <section id="flujo" class="container section section--compact">
        <SectionHeading
          eyebrow="Tu día a día"
          title="3 pasos, sin complicaciones"
          description="Lo esencial de tu mañana clínica, explicado de forma simple."
        />

        <div class="workflow-showcase">
          <div class="workflow-grid workflow-grid--compact">
            <article v-for="step in workflowSteps" :key="step.title" class="workflow-step">
              <div class="workflow-step-icon" aria-hidden="true">
                <MedIcon :name="step.icon" size="md" />
              </div>
              <div class="workflow-step-body">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
            </article>
          </div>

          <div class="benefits-strip benefits-strip--icons" aria-label="Ventajas para el médico">
            <div v-for="benefit in dailyBenefits" :key="benefit.title" class="benefit-item">
              <span class="benefit-icon" aria-hidden="true">
                <MedIcon :name="benefit.icon" size="sm" />
              </span>
              <strong>{{ benefit.title }}</strong>
              <span>{{ benefit.detail }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Producto -->
      <section id="producto" class="container section section--compact">
        <SectionHeading
          eyebrow="Herramientas clínicas"
          title="Lo que más usas, siempre a mano"
          description="Sin menús confusos: expediente, consultas y seguridad en pantallas claras."
        />

        <div class="feature-grid feature-grid--compact">
          <FeatureCard
            v-for="feature in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :description="feature.description"
          />
        </div>
      </section>

      <!-- Pacientes -->
      <section id="pacientes" class="container section section--compact">
        <SectionHeading
          eyebrow="Función incluida"
          title="Recibe exámenes sin perseguir a tus pacientes"
          description="Generas un enlace desde Medfile. El paciente sube desde su móvil; tú revisas todo en tu bandeja."
        />

        <div class="dashboard-grid dashboard-grid--landing">
          <PanelCard title="Tu bandeja de documentos" badge="4 sin revisar" badge-tone="warning" padded>
            <PatientRow
              v-for="document in previewDocuments"
              :key="document.name"
              :initials="document.type"
              :name="document.name"
              :detail="document.detail"
              :status="document.status"
            />
          </PanelCard>

          <div class="upload-card upload-card--preview">
            <p class="patient-preview-label">
              <MedIcon name="mobile" size="sm" />
              Así lo ve tu paciente
            </p>
            <div class="mobile-frame mobile-frame--demo">
              <div class="mobile-screen">
                <div class="mobile-screen-content">
                  <StatusBadge>Solicitud de Dra. Rivas</StatusBadge>
                  <h3>Subir exámenes</h3>
                  <UploadZone
                    title="Tomar foto o elegir archivo"
                    description="JPG, PNG o PDF desde el móvil."
                  />
                </div>
              </div>
            </div>
            <MfButton variant="secondary" to="/paciente/subir" block>
              Ver demo del enlace
            </MfButton>
          </div>
        </div>
      </section>

      <!-- Planes -->
      <section id="planes" class="pricing-section">
        <div class="container">
          <SectionHeading
            eyebrow="Planes y precios"
            title="Gratis para siempre. De pago cuando crezcas."
            description="Un médico, una cuenta, un pago. Planes mensual, trimestral o anual (paga 10 meses, 12 de servicio). Tus datos clínicos nunca se borran por impago."
          />

          <ul class="pricing-guarantee" aria-label="Compromisos de los planes">
            <li v-for="item in planGuarantees" :key="item">{{ item }}</li>
          </ul>

          <details class="plan-team-callout plan-detail-accordion plan-detail-accordion--wide">
            <summary>
              <MedIcon name="users" size="sm" aria-hidden="true" />
              <span>Tu equipo dentro del consultorio</span>
            </summary>
            <div class="plan-team-callout-body">
              <p>
                Tú invitas por correo, defines permisos y revocas el acceso cuando quieras. Es distinto
                de compartir historial con otro médico Medfile (solo plan Profesional).
              </p>
              <ul class="plan-team-callout-list">
                <li>
                  <strong>Plan Básico y Profesional:</strong>
                  1 asistente o secretaria para filiación, enlaces de subida, bandeja y recordatorios.
                </li>
                <li>
                  <strong>Solo Profesional:</strong>
                  enfermería en la clínica donde atiendes — signos vitales, cola del día, auditoría y
                  permiso temporal que tú autorizas y revocas.
                </li>
              </ul>
            </div>
          </details>

          <div class="pricing-billing-picker pricing-billing-picker--above-grid">
            <p class="pricing-billing-picker__label">¿Cómo prefieres pagar?</p>
            <div class="pricing-toggle" role="group" aria-label="Periodo de facturación">
              <button
                v-for="option in billingOptions"
                :key="option.id"
                type="button"
                :class="{ active: billingPeriod === option.id }"
                @click="billingPeriod = option.id"
              >
                {{ option.label }}
                <span v-if="option.save" class="save-badge">{{ option.save }}</span>
              </button>
            </div>
            <p class="pricing-billing-picker__hint">
              <template v-if="billingPeriod === 'annual'">
                Paga <strong>10 meses</strong> y usa Medfile <strong>12 meses</strong> — WhatsApp incluido cada mes.
              </template>
              <template v-else-if="billingPeriod === 'quarterly'">
                Facturación cada 3 meses con <strong>10 % de descuento</strong>.
              </template>
              <template v-else>
                También disponible <strong>plan anual</strong>: paga 10 meses, lleva 12 (<strong>2 meses gratis</strong>).
              </template>
            </p>
          </div>

          <div class="pricing-grid">
            <article
              v-for="plan in pricingPlans"
              :key="plan.code"
              class="pricing-card"
              :class="{ featured: plan.featured }"
            >
              <span v-if="plan.featured" class="pricing-card-badge">Más popular</span>
              <h3>{{ plan.name }}</h3>
              <p class="pricing-card-desc">{{ plan.description }}</p>
              <p v-if="plan.tierNote" class="pricing-tier-note">{{ plan.tierNote }}</p>
              <div class="pricing-amount">
                <strong>{{ plan.priceLabel }}</strong>
                <span v-if="plan.priceRef" class="pricing-usd-ref">{{ plan.priceRef }}</span>
              </div>
              <p v-if="plan.priceEffective" class="pricing-effective-note">{{ plan.priceEffective }}</p>
              <p
                v-if="billingPeriod === 'monthly' && plan.annualTeaser"
                class="pricing-annual-teaser"
              >
                {{ plan.annualTeaser }}
              </p>
              <p class="pricing-period-note">{{ plan.priceNote }}</p>
              <ul class="pricing-features">
                <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
              </ul>
              <div v-if="extrasForPlan(plan.code).length" class="pricing-extras">
                <details
                  v-for="extra in extrasForPlan(plan.code)"
                  :key="extra.id"
                  class="plan-detail-accordion"
                >
                  <summary>
                    <MedIcon :name="extra.icon" size="sm" aria-hidden="true" />
                    <span>{{ extra.title }}</span>
                  </summary>
                  <p>{{ extra.detail }}</p>
                </details>
              </div>
              <div class="pricing-card-footer">
                <MfButton :to="plan.ctaTo" block>
                  {{ plan.ctaLabel }}
                </MfButton>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- CTA final -->
      <section class="container">
        <div class="cta-band">
          <h2>Tu consultorio merece un archivo médico moderno</h2>
          <p>
            Únete a médicos que ya organizan pacientes, consultas y documentos con Medfile.
            Empieza con el Plan Gratis — sin tarjeta y sin perder tus datos si no pagas.
          </p>
          <div class="cta-band-actions">
            <MfButton to="/registro">Crear mi cuenta gratis</MfButton>
            <MfButton variant="secondary" to="/login">Ya tengo cuenta</MfButton>
          </div>
        </div>
      </section>
    </main>

    <MarketingFooter />
  </div>
</template>

<script setup lang="ts">
import type { MedIconName } from '~/components/ui/MedIcon.vue'
import type { BillingPeriod, PlanCode } from '@medfile/types/plans'
import { subscriptionPlans } from '@medfile/types/plans'
import {
  formatPlanEffectiveMonthlyNote,
  formatPlanPeriodNote,
  formatPlanPricePrimary,
  formatPlanUsdReference,
} from '~/utils/plan-pricing-display'

type BadgeTone = '' | 'warning' | 'danger' | 'success'

const billingPeriod = ref<BillingPeriod>('monthly')

const planGuarantees = [
  'Sin tarjeta para empezar con el plan Gratis',
  'Plan anual: paga 10 meses, 12 de servicio (2 meses gratis)',
  'Datos clínicos que no expiran aunque no pagues',
  'WhatsApp manual (wa.me) siempre disponible',
]

const billingOptions = [
  { id: 'monthly' as BillingPeriod, label: 'Mensual', save: '' },
  { id: 'quarterly' as BillingPeriod, label: 'Trimestral', save: '-10%' },
  { id: 'annual' as BillingPeriod, label: 'Anual', save: '2 meses gratis' },
]

type PlanExtra = {
  id: string
  icon: MedIconName
  title: string
  detail: string
  plans: PlanCode[]
}

const planExtras: PlanExtra[] = [
  {
    id: 'assistant',
    icon: 'clipboard',
    title: 'Asistente o secretaria incluida',
    detail:
      'Delega altas, solicitudes de subida y la bandeja administrativa. Tú sigues siendo responsable clínico; revocas su acceso desde Equipo en cualquier momento.',
    plans: ['basic'],
  },
  {
    id: 'nurse',
    icon: 'alert',
    title: 'Enfermería con permiso temporal',
    detail:
      'Habilita personal de enfermería para registrar signos vitales, triage y cola del día en la clínica que indiques. Acceso acotado, con auditoría, revocable por ti.',
    plans: ['professional'],
  },
  {
    id: 'share',
    icon: 'users',
    title: 'Compartir historial con colegas Medfile',
    detail:
      'Referencias o segunda opinión: tú eliges qué bloques compartir, por cuánto tiempo y con qué permisos. Revocable en cualquier momento.',
    plans: ['professional'],
  },
]

function extrasForPlan(code: PlanCode) {
  return planExtras.filter((extra) => extra.plans.includes(code))
}

const pricingPlans = computed(() => {
  const period = billingPeriod.value
  const freePlan = subscriptionPlans.find((plan) => plan.code === 'free')
  const basicPlan = subscriptionPlans.find((plan) => plan.code === 'basic')
  const professionalPlan = subscriptionPlans.find((plan) => plan.code === 'professional')

  return [
    {
      code: 'free' as PlanCode,
      name: 'Gratis',
      description: 'Tu consultorio ordenado sin fecha de corte.',
      tierNote: '',
      priceLabel: 'Para siempre',
      priceRef: '',
      priceEffective: '',
      priceNote: 'Sin tarjeta · 1 médico · 2 GB · hasta 50 pacientes',
      annualTeaser: '',
      features: [...(freePlan?.features ?? [])],
      ctaLabel: 'Crear cuenta gratis',
      ctaTo: '/registro',
      featured: false,
    },
    {
      code: 'basic' as PlanCode,
      name: 'Básico',
      description: 'Consulta regular con asistente y recordatorios automáticos.',
      tierNote: 'Incluye todo el plan Gratis, más:',
      priceLabel: formatPlanPricePrimary('basic', period),
      priceRef: formatPlanUsdReference('basic', period),
      priceEffective: formatPlanEffectiveMonthlyNote('basic', period),
      priceNote: formatPlanPeriodNote('basic', period),
      annualTeaser:
        period === 'monthly'
          ? `Anual: ${formatPlanPricePrimary('basic', 'annual')} · 2 meses gratis`
          : '',
      features: [...(basicPlan?.features ?? [])],
      ctaLabel: 'Elegir plan Básico',
      ctaTo: '/registro',
      featured: true,
    },
    {
      code: 'professional' as PlanCode,
      name: 'Profesional',
      description: 'Alto volumen, enfermería delegada y colaboración con colegas.',
      tierNote: 'Incluye todo el plan Básico, más:',
      priceLabel: formatPlanPricePrimary('professional', period),
      priceRef: formatPlanUsdReference('professional', period),
      priceEffective: formatPlanEffectiveMonthlyNote('professional', period),
      priceNote: formatPlanPeriodNote('professional', period),
      annualTeaser:
        period === 'monthly'
          ? `Anual: ${formatPlanPricePrimary('professional', 'annual')} · 2 meses gratis`
          : '',
      features: [...(professionalPlan?.features ?? [])],
      ctaLabel: 'Elegir plan Profesional',
      ctaTo: '/registro',
      featured: false,
    },
  ]
})

const patients = [
  {
    id: 'p1',
    initials: 'MG',
    name: 'María García',
    detail: 'Control hipertensión · hoy 9:00 AM',
    status: 'Activo',
    tone: '' as BadgeTone,
  },
  {
    id: 'p2',
    initials: 'AM',
    name: 'Ana Martínez',
    detail: 'HbA1c elevada · revisar resultados',
    status: 'Crítico',
    tone: 'danger' as BadgeTone,
  },
  {
    id: 'p3',
    initials: 'CR',
    name: 'Carlos Rodríguez',
    detail: 'Documento recibido desde móvil',
    status: 'Pendiente',
    tone: 'warning' as BadgeTone,
  },
]

const previewPatients = computed(() => patients.slice(0, 2))

const trustItems: { icon: MedIconName; value: string; label: string }[] = [
  { icon: 'gift', value: 'Gratis', label: 'sin vencimiento' },
  { icon: 'users', value: 'Colegas', label: 'historial con permisos' },
  { icon: 'lock', value: 'Tus datos', label: 'nunca se borran' },
]

const workflowSteps: { icon: MedIconName; title: string; description: string }[] = [
  {
    icon: 'calendar',
    title: 'Revisa tu agenda',
    description: 'Citas, pendientes y alertas clínicas en una pantalla.',
  },
  {
    icon: 'clipboard',
    title: 'Atiende con historia completa',
    description: 'Alergias, medicamentos y consultas previas al instante.',
  },
  {
    icon: 'upload',
    title: 'Recibe exámenes por móvil',
    description: 'El paciente sube resultados; tú los revisas y archivas.',
  },
]

const dailyBenefits: { icon: MedIconName; title: string; detail: string }[] = [
  { icon: 'folder', title: 'Historia clínica', detail: 'Consultas y antecedentes' },
  { icon: 'file', title: 'Documentos', detail: 'PDFs e imágenes ordenados' },
  { icon: 'alert', title: 'Alertas', detail: 'Casos críticos visibles' },
  { icon: 'mobile', title: 'Multi-dispositivo', detail: 'PC, tablet o móvil' },
]

const features: { icon: MedIconName; title: string; description: string }[] = [
  {
    icon: 'folder',
    title: 'Expediente por paciente',
    description: 'Todo el historial en una sola vista, sin carpetas ni papeles.',
  },
  {
    icon: 'clipboard',
    title: 'Consultas rápidas',
    description: 'Motivo, diagnóstico y signos vitales en pocos clics.',
  },
  {
    icon: 'shield',
    title: 'Espacio privado y colaboración controlada',
    description:
      'Tus pacientes aislados de otros consultorios. Cuando lo requieras, comparte historiales con colegas Medfile bajo permisos y restricciones.',
  },
]

const previewDocuments = computed(() => documents.slice(0, 2))

const documents = [
  {
    type: 'PDF',
    name: 'Hemograma completo',
    detail: 'Ana Martínez · enviado hace 12 min',
    status: 'Revisar',
  },
  {
    type: 'IMG',
    name: 'Foto de sonografía',
    detail: 'Laura Fernández · móvil',
    status: 'Clasificar',
  },
  {
    type: 'LAB',
    name: 'Perfil lipídico',
    detail: 'María García · laboratorio externo',
    status: 'Nuevo',
  },
]

useHead({
  title: 'Medfile | Historiales médicos, mejor cuidado',
  meta: [
    {
      name: 'description',
      content:
        'Medfile ayuda a médicos independientes a gestionar pacientes, consultas, documentos y suscripciones. Plan Gratis permanente.',
    },
  ],
})
</script>
