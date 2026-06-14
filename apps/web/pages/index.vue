<template>
  <div class="page-shell landing-page">
    <MarketingNav />

    <main>
      <!-- Hero -->
      <section class="container hero">
        <div>
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

          <div class="trust-row" aria-label="Beneficios principales">
            <InfoCard
              v-for="item in trustItems"
              :key="item.value"
              :icon="item.icon"
              :value="item.value"
              :label="item.label"
            />
          </div>
        </div>

        <aside class="product-preview product-preview--compact" aria-label="Vista previa de Medfile">
          <div class="preview-window">
            <div class="preview-topbar preview-topbar--compact">
              <strong>Consultorio Dr. Rivas</strong>
              <StatusBadge tone="success">En línea</StatusBadge>
            </div>
            <div class="preview-body preview-body--compact">
              <div class="preview-content">
                <div class="metric-grid metric-grid--compact">
                  <MetricCard label="Pacientes" value="1,284" />
                  <MetricCard label="Hoy" value="23" />
                  <MetricCard label="Pendiente" value="7" />
                </div>

                <PanelCard title="Pacientes recientes" badge="En vivo">
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

      <!-- Gratis vs de pago -->
      <section id="gratis-vs-pago" class="container section section--compact">
        <SectionHeading
          eyebrow="Qué incluye cada plan"
          title="Gratis para siempre. De pago cuando crezcas."
          description="Tus datos clínicos nunca se borran por impago. Los planes de pago desbloquean capacidad, automatización y compartir historiales con colegas Medfile bajo permisos y restricciones."
        />

        <aside class="plan-share-callout" aria-label="Compartir historiales entre médicos">
          <MedIcon name="users" size="sm" />
          <div>
            <strong>Historiales entre médicos, cuando lo requieras</strong>
            <p>
              Referencias, coberturas o segunda opinión: comparte solo lo necesario con otro médico
              Medfile. Tú defines alcance, duración y permisos; puedes revocar el acceso en cualquier
              momento. Sin mezclar consultorios ni ver pacientes ajenos sin autorización.
            </p>
            <p class="plan-share-callout-foot">
              Incluido en <strong>Plan Profesional</strong>. Desde el registro ya tienes tu
              <strong>Código Medfile</strong> para identificarte entre colegas.
            </p>
          </div>
        </aside>

        <div class="plan-compare-landing">
          <article class="plan-compare-block plan-compare-block--free">
            <span class="plan-tier-badge plan-tier-badge--free">Gratis</span>
            <h3>Incluido sin pagar</h3>
            <ul>
              <li v-for="item in freeIncludes" :key="item">{{ item }}</li>
            </ul>
          </article>
          <article class="plan-compare-block plan-compare-block--paid">
            <span class="plan-tier-badge plan-tier-badge--paid">De pago</span>
            <h3>Básico y Profesional</h3>
            <ul>
              <li v-for="item in paidIncludes" :key="item">{{ item }}</li>
            </ul>
          </article>
        </div>
      </section>

      <!-- Planes -->
      <section id="planes" class="pricing-section">
        <div class="container">
          <SectionHeading
            eyebrow="Planes flexibles"
            title="Gratis para empezar. Paga solo lo que necesites."
            description="Un médico, una cuenta, un pago. WhatsApp automático incluido en planes de pago. Plan Profesional: compartir historiales con colegas Medfile con permisos y restricciones."
          />

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
              <div class="pricing-amount">
                <strong>{{ formatPrice(plan.price) }}</strong>
                <span v-if="plan.priceUsdMonthly"> {{ formatPriceBob(plan.priceUsdMonthly) }}</span>
                <span v-if="plan.price > 0">/ {{ billingLabel }}</span>
              </div>
              <p class="pricing-period-note">{{ plan.priceNote }}</p>
              <ul class="pricing-features">
                <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
              </ul>
              <MfButton :to="plan.ctaTo" block>
                {{ plan.ctaLabel }}
              </MfButton>
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

type BadgeTone = '' | 'warning' | 'danger' | 'success'
type BillingPeriod = 'monthly' | 'quarterly' | 'annual'

const billingPeriod = ref<BillingPeriod>('monthly')

const freeIncludes = [
  'Hasta 50 pacientes y 2 GB',
  'Historia clínica, consultas y alertas',
  'Enlace seguro para que el paciente suba exámenes',
  'Compartir enlace por WhatsApp manual (wa.me)',
  'Código Medfile para identificarte entre colegas',
  '1 usuario · lectura de todo lo ya guardado',
]

const paidIncludes = [
  'Más pacientes y almacenamiento (solo tú, 1 médico)',
  'Recordatorios automáticos por email',
  '100 o 600 WhatsApp automáticos/mes incluidos (según plan)',
  'Profesional: compartir historial con colegas Medfile (permisos, alcance y revocación)',
  'Profesional: automatizaciones, reportes y soporte prioritario',
]

const BOB_PER_USD = 7

const billingOptions = [
  { id: 'monthly' as BillingPeriod, label: 'Mensual', save: '' },
  { id: 'quarterly' as BillingPeriod, label: 'Trimestral', save: '-10%' },
  { id: 'annual' as BillingPeriod, label: 'Anual', save: '-20%' },
]

const billingLabel = computed(() => {
  if (billingPeriod.value === 'quarterly') return 'trimestre'
  if (billingPeriod.value === 'annual') return 'año'
  return 'mes'
})

function calcPrice(monthlyUsd: number) {
  if (monthlyUsd === 0) return 0
  if (billingPeriod.value === 'quarterly') return Math.round(monthlyUsd * 3 * 0.9)
  if (billingPeriod.value === 'annual') return Math.round(monthlyUsd * 12 * 0.8)
  return monthlyUsd
}

function formatPrice(amount: number) {
  if (amount === 0) return 'Gratis'
  return `$${amount}`
}

function formatPriceBob(usdMonthly: number) {
  if (usdMonthly === 0) return ''
  const bob = usdMonthly === 14 ? 98 : usdMonthly === 32 ? 224 : Math.round(usdMonthly * BOB_PER_USD)
  return `(~Bs ${bob}/mes)`
}

const pricingPlans = computed(() => [
  {
    code: 'free',
    name: 'Gratis',
    description: 'Para siempre. Tu consultorio ordenado sin fecha de corte.',
    price: 0,
    priceUsdMonthly: 0,
    priceNote: 'Sin tarjeta · 1 médico · tus datos no expiran',
    features: [
      'Hasta 50 pacientes',
      'Historia clínica y consultas',
      'Enlace de subida para pacientes',
      'WhatsApp manual (compartir enlace)',
      'Código Medfile · preparado para compartir con colegas',
      '2 GB',
    ],
    ctaLabel: 'Crear cuenta gratis',
    ctaTo: '/registro',
    featured: false,
  },
  {
    code: 'basic',
    name: 'Básico',
    description: 'Médico independiente con consulta regular.',
    price: calcPrice(14),
    priceUsdMonthly: 14,
    priceNote:
      billingPeriod.value === 'monthly'
        ? '1 médico · 100 WhatsApp/mes incluidos'
        : billingPeriod.value === 'quarterly'
          ? 'Equivale a ~$13/mes · ahorras 10%'
          : 'Equivale a ~$11/mes · ahorras 20%',
    features: [
      'Hasta 200 pacientes',
      '8 GB de almacenamiento',
      '100 WhatsApp automáticos/mes incluidos',
      'Recordatorios por email',
      'Logo del consultorio en enlaces',
    ],
    ctaLabel: 'Elegir plan Básico',
    ctaTo: '/registro',
    featured: true,
  },
  {
    code: 'professional',
    name: 'Profesional',
    description: 'Alto volumen — mismo médico, más capacidad.',
    price: calcPrice(32),
    priceUsdMonthly: 32,
    priceNote:
      billingPeriod.value === 'monthly'
        ? '1 médico · 600 WhatsApp/mes · uso intensivo'
        : billingPeriod.value === 'quarterly'
          ? 'Equivale a ~$29/mes · ahorras 10%'
          : 'Equivale a ~$26/mes · ahorras 20%',
    features: [
      'Hasta 800 pacientes',
      '25 GB de almacenamiento',
      '600 WhatsApp automáticos/mes incluidos',
      'Automatizaciones y digest semanal',
      'Compartir historial con colegas (permisos y revocación)',
      'Reportes y soporte prioritario',
    ],
    ctaLabel: 'Elegir plan Profesional',
    ctaTo: '/registro',
    featured: false,
  },
])

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
