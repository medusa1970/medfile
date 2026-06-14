<template>
  <footer class="marketing-footer">
    <div class="container footer-shell">
      <div class="footer-main">
        <div class="footer-brand">
          <BrandLogo />
          <p class="footer-tagline">
            Historiales médicos, mejor cuidado. Organiza pacientes, consultas y documentos
            en un solo lugar seguro.
          </p>
          <MfButton to="/registro" class="footer-cta">Empezar gratis</MfButton>
        </div>

        <div class="footer-columns">
          <nav class="footer-column" aria-label="Enlaces de producto">
            <h4>Producto</h4>
            <ul>
              <li v-for="link in productLinks" :key="link.href">
                <a :href="link.href">{{ link.label }}</a>
              </li>
            </ul>
          </nav>

          <nav class="footer-column" aria-label="Enlaces de cuenta">
            <h4>Cuenta</h4>
            <ul>
              <li>
                <NuxtLink to="/registro">Empezar gratis</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/login">Iniciar sesión</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/paciente/subir">Enlace para pacientes</NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div class="footer-trust" aria-label="Garantías">
        <span>Plan Gratis permanente</span>
        <span>Tus datos no se borran</span>
        <span>Enlace seguro al paciente</span>
      </div>

      <div class="footer-bottom">
        <span>© {{ year }} Medfile. Todos los derechos reservados.</span>
        <span>Datos aislados por médico · Cifrado en tránsito</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const route = useRoute()
const year = new Date().getFullYear()

const hashPrefix = computed(() => (route.path === '/' ? '' : '/'))

const productLinks = computed(() => [
  { href: `${hashPrefix.value}#producto`, label: 'Funcionalidades' },
  { href: `${hashPrefix.value}#flujo`, label: 'Cómo funciona' },
  { href: `${hashPrefix.value}#gratis-vs-pago`, label: 'Gratis vs. de pago' },
  { href: `${hashPrefix.value}#planes`, label: 'Planes y precios' },
])
</script>
