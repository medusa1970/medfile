<template>
  <header class="nav marketing-nav">
    <div class="container nav-inner">
      <div class="nav-brand">
        <BrandLogo />
      </div>

      <nav class="nav-links" aria-label="Secciones">
        <a
          v-for="link in primaryLinks"
          :key="link.href"
          :href="link.href"
          :class="{ 'is-active': navReady && isLinkActive(link.id) }"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="nav-actions">
        <NuxtLink to="/login" class="nav-text-link">Iniciar sesión</NuxtLink>
        <MfButton to="/registro" class="nav-cta">Empezar gratis</MfButton>
      </div>

      <div ref="menuRef" class="nav-mobile-menu">
        <NuxtLink
          v-if="navReady && showMobileHome"
          to="/"
          class="nav-icon-btn"
          aria-label="Ir al inicio"
          @click="closeMenu"
        >
          <MedIcon name="home" size="sm" />
        </NuxtLink>

        <button
          type="button"
          class="nav-toggle"
          :aria-expanded="menuOpen"
          aria-controls="nav-mobile-drawer"
          :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
          @click.stop="toggleMenu"
        >
          <svg v-if="!menuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="nav-backdrop">
        <button
          v-if="menuOpen"
          type="button"
          class="nav-mobile-backdrop"
          aria-label="Cerrar menú"
          tabindex="-1"
          @click="closeMenu"
        />
      </Transition>

      <Transition name="nav-drawer">
        <aside
          v-if="menuOpen"
          id="nav-mobile-drawer"
          ref="drawerRef"
          class="nav-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <div class="nav-mobile-drawer-header">
            <BrandLogo />
            <button
              type="button"
              class="nav-icon-btn"
              aria-label="Cerrar menú"
              @click="closeMenu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <nav class="nav-mobile-drawer-links" aria-label="Menú móvil">
            <NuxtLink
              v-if="navReady && showMobileHome"
              to="/"
              @click="closeMenu"
            >
              Inicio
            </NuxtLink>
            <a
              v-for="link in mobileLinks"
              :key="link.href"
              :href="link.href"
              :class="{ 'is-active': navReady && isLinkActive(link.id) }"
              @click="closeMenu"
            >
              {{ link.label }}
            </a>
          </nav>

          <div class="nav-mobile-drawer-actions">
            <MfButton variant="ghost" to="/login" block @click="closeMenu">Iniciar sesión</MfButton>
            <MfButton variant="secondary" to="/paciente/subir" block @click="closeMenu">
              Enlace pacientes
            </MfButton>
            <MfButton to="/registro" block @click="closeMenu">Empezar gratis</MfButton>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
interface NavLink {
  href: string
  label: string
  id: string
}

const route = useRoute()
const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const drawerRef = ref<HTMLElement | null>(null)
const activeSection = ref('')
const navReady = ref(false)

const primaryLinks = computed<NavLink[]>(() => {
  const prefix = route.path === '/' ? '' : '/'

  return [
    { href: `${prefix}#producto`, label: 'Producto', id: 'producto' },
    { href: `${prefix}#flujo`, label: 'Cómo funciona', id: 'flujo' },
    { href: `${prefix}#pacientes`, label: 'Pacientes', id: 'pacientes' },
    { href: `${prefix}#planes`, label: 'Planes', id: 'planes' },
  ]
})

const mobileLinks = computed<NavLink[]>(() => {
  const prefix = route.path === '/' ? '' : '/'

  return [
    ...primaryLinks.value,
  ]
})

const showMobileHome = computed(() => route.path !== '/' || Boolean(route.hash))

let sectionObserver: IntersectionObserver | null = null

function isLinkActive(id: string) {
  if (activeSection.value) return activeSection.value === id
  if (route.hash) return route.hash === `#${id}`
  return false
}

function syncActiveFromHash() {
  activeSection.value = route.hash ? route.hash.slice(1) : ''
}

function setupSectionObserver() {
  if (!import.meta.client || route.path !== '/') return

  sectionObserver?.disconnect()

  const sections = mobileLinks.value
    .map((link) => document.getElementById(link.id))
    .filter((element): element is HTMLElement => Boolean(element))

  if (!sections.length) return

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

      const nextId = visible[0]?.target.id
      if (nextId) activeSection.value = nextId
    },
    {
      rootMargin: '-32% 0px -52% 0px',
      threshold: [0, 0.15, 0.35, 0.6],
    },
  )

  sections.forEach((section) => sectionObserver?.observe(section))
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!menuOpen.value) return

  const target = event.target as Node
  if (menuRef.value?.contains(target)) return
  if (drawerRef.value?.contains(target)) return

  closeMenu()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

watch(menuOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})

watch(
  () => route.hash,
  () => syncActiveFromHash(),
)

watch(
  () => route.path,
  () => {
    closeMenu()
    syncActiveFromHash()
    nextTick(() => setupSectionObserver())
  },
)

onMounted(() => {
  navReady.value = true
  syncActiveFromHash()
  setupSectionObserver()
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
  sectionObserver?.disconnect()
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>
