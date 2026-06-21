<template>
  <div class="app-layout">
    <header :class="['app-mobile-bar', { 'app-mobile-bar--with-back': showBack }]">
      <button
        v-if="showBack"
        type="button"
        class="app-mobile-back"
        aria-label="Volver atrás"
        @click="goBack"
      >
        <MedIcon name="arrow-left" size="sm" />
      </button>

      <NuxtLink to="/dashboard" class="app-mobile-home" aria-label="Ir al dashboard">
        <MedIcon name="home" size="sm" />
      </NuxtLink>

      <BrandLogo to="/dashboard" compact aria-label="Ir al dashboard de Medfile" />

      <button
        type="button"
        class="app-mobile-menu-toggle"
        :aria-expanded="mobileNavOpen"
        aria-controls="app-mobile-nav"
        :aria-label="mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'"
        @click="toggleMobileNav"
      >
        <svg v-if="!mobileNavOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </header>

    <button
      v-show="mobileNavOpen"
      type="button"
      class="app-sidebar-backdrop"
      aria-label="Cerrar menú"
      tabindex="-1"
      @click="closeMobileNav"
    />

    <aside :class="['app-sidebar', { 'app-sidebar--open': mobileNavOpen }]">
      <BrandLogo />

      <nav id="app-mobile-nav" aria-label="Modulo medico">
        <NuxtLink
          v-for="item in navItems"
          :key="item.label"
          :class="['app-nav-item', { active: item.active }]"
          :to="item.href"
          @click="closeMobileNav"
        >
          {{ item.label }}
          <span v-if="item.count">{{ item.count }}</span>
        </NuxtLink>
      </nav>

      <footer class="app-sidebar-footer">
        <p v-if="sessionUser" class="app-session-user">
          {{ sessionUser.fullName }}
          <span class="app-session-email">{{ sessionUser.email }}</span>
        </p>
        <MfButton variant="ghost" block @click="logout">
          Cerrar sesion
        </MfButton>
      </footer>
    </aside>

    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { canShowAppBack, readReturnToQuery, resolveAppBackRoute } from '~/utils/app-back-route'

interface SessionUser {
  fullName: string
  email: string
  role?: string
  isPlatformAdmin?: boolean
}

interface NavItem {
  label: string
  href: string
  count?: string
  active?: boolean
}

const route = useRoute()
const router = useRouter()
const { apiFetch, clearSession, hasSession } = useMedfileApi()
const sessionUser = ref<SessionUser | null>(null)
const mobileNavOpen = ref(false)

const showBack = computed(() => canShowAppBack(route.path, readReturnToQuery(route.query)))

async function goBack() {
  const returnTo = readReturnToQuery(route.query)

  if (returnTo) {
    await navigateTo(returnTo)
    return
  }

  if (import.meta.client && window.history.length > 1) {
    router.back()
    return
  }

  await navigateTo(resolveAppBackRoute(route.path))
}

const navItems = computed(() => {
  const role = sessionUser.value?.role ?? 'owner'
  const isAssistant = role === 'assistant'
  const isClinicalCapture = role === 'clinical_capture'

  if (isClinicalCapture) {
    const items: NavItem[] = [
      { label: 'Cola clínica', href: '/cola-clinica' },
      { label: 'Pacientes', href: '/pacientes' },
      { label: 'Mi perfil', href: '/cuenta' },
    ]
    return items.map((item) => ({
      ...item,
      active: route.path === item.href || route.path.startsWith(`${item.href}/`),
    }))
  }

  const items: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', count: '12' },
    { label: 'Pacientes', href: '/pacientes' },
    { label: 'Documentos', href: '/documentos', count: '4' },
  ]

  if (!isAssistant) {
    items.push({ label: 'Compartidos', href: '/compartidos' })
    items.push({ label: 'Suscripcion', href: '/suscripcion' })
  }

  if (!isAssistant && (role === 'owner' || role === 'doctor')) {
    items.splice(2, 0, { label: 'Cola clínica', href: '/cola-clinica' })
  }

  items.push({ label: 'Mi perfil', href: '/cuenta' })

  if (!isAssistant && (role === 'owner' || role === 'doctor')) {
    items.splice(items.length - 1, 0, { label: 'Equipo', href: '/cuenta/equipo' })
  }

  if (sessionUser.value?.isPlatformAdmin) {
    items.push({ label: 'Admin plataforma', href: '/admin' })
  }

  return items.map((item) => ({
    ...item,
    active:
      item.href !== '#' &&
      (route.path === item.href || route.path.startsWith(`${item.href}/`)),
  }))
})

function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value
}

function closeMobileNav() {
  mobileNavOpen.value = false
}

function onMobileNavKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMobileNav()
}

onMounted(() => {
  loadSessionUser()
  document.addEventListener('keydown', onMobileNavKeydown)
})

watch(
  () => route.path,
  () => {
    closeMobileNav()
    if (!sessionUser.value && hasSession()) {
      loadSessionUser()
    }
  },
)

watch(mobileNavOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

onUnmounted(() => {
  document.removeEventListener('keydown', onMobileNavKeydown)
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

async function loadSessionUser() {
  if (!hasSession()) {
    sessionUser.value = null
    return
  }

  try {
    const response = await apiFetch<{ user: SessionUser & { role?: string; isPlatformAdmin?: boolean } }>(
      '/api/auth/me',
    )
    sessionUser.value = response.user
  } catch {
    sessionUser.value = null
  }
}

async function logout() {
  clearSession()
  sessionUser.value = null
  await navigateTo('/login')
}
</script>
