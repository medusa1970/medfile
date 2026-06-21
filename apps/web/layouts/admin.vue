<template>
  <div class="admin-layout">
    <header class="admin-topbar">
      <div>
        <EyebrowPill>Medfile interno</EyebrowPill>
        <h1>Administración</h1>
      </div>
      <nav class="admin-nav" aria-label="Administracion">
        <NuxtLink to="/admin">Resumen</NuxtLink>
        <NuxtLink to="/admin/clientes">Clientes</NuxtLink>
        <NuxtLink to="/admin/configuracion">Configuración</NuxtLink>
        <MfButton variant="ghost" to="/dashboard">Volver al app</MfButton>
        <MfButton variant="ghost" @click="logoutAdmin">Salir</MfButton>
      </nav>
    </header>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ADMIN_LOGIN_PATH } from '~/utils/admin-routes'

const { clearSession } = useMedfileApi()

async function logoutAdmin() {
  clearSession()
  await navigateTo(ADMIN_LOGIN_PATH)
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--mf-slate-50);
}

.admin-topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid rgb(226 232 240 / 0.9);
  background: white;
}

.admin-topbar h1 {
  margin: 4px 0 0;
  font-size: 22px;
}

.admin-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.admin-nav a {
  padding: 8px 12px;
  border-radius: 10px;
  color: var(--mf-navy-900);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.admin-nav a.router-link-active {
  background: var(--mf-brand-50);
  color: var(--mf-teal-600);
}

.admin-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}
</style>
