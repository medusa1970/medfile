<template>
  <svg
    class="med-icon"
    :class="[`med-icon--${name}`, { 'med-icon--lg': size === 'lg' }]"
    :width="sizePx"
    :height="sizePx"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <!-- Agenda -->
    <template v-if="name === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.75" />
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
    </template>

    <!-- Historia / expediente -->
    <template v-else-if="name === 'folder'">
      <path
        d="M4 7h6l2 2h8a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
      <path d="M8 13h8M8 16h5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </template>

    <!-- Subida móvil -->
    <template v-else-if="name === 'upload'">
      <path
        d="M12 16V6m0 0l-3.5 3.5M12 6l3.5 3.5M5 18h14"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>

    <!-- Consulta rápida -->
    <template v-else-if="name === 'clipboard'">
      <rect x="6" y="4" width="12" height="17" rx="2" stroke="currentColor" stroke-width="1.75" />
      <path d="M9 4.5h6a1.5 1.5 0 010 3H9a1.5 1.5 0 010-3z" stroke="currentColor" stroke-width="1.75" />
      <path d="M9 12h6M9 15h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </template>

    <!-- Seguridad -->
    <template v-else-if="name === 'shield'">
      <path
        d="M12 3l7 3v6c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6l7-3z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- Pacientes -->
    <template v-else-if="name === 'users'">
      <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.75" />
      <path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      <path d="M16 8.5a2.5 2.5 0 010 5M19 19c0-2.2-1.5-3.5-3-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </template>

    <!-- Documentos -->
    <template v-else-if="name === 'file'">
      <path
        d="M8 4h6l4 4v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
      <path d="M14 4v4h4M10 13h4M10 16h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </template>

    <!-- Alertas -->
    <template v-else-if="name === 'alert'">
      <path
        d="M12 4l8 14H4L12 4z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
      <path d="M12 10v3M12 16h.01" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </template>

    <!-- Móvil -->
    <template v-else-if="name === 'mobile'">
      <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" stroke-width="1.75" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </template>

    <!-- Reloj / hoy -->
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.75" />
      <path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- Prueba gratis -->
    <template v-else-if="name === 'gift'">
      <rect x="4" y="10" width="16" height="10" rx="1.5" stroke="currentColor" stroke-width="1.75" />
      <path d="M12 10V20M4 10h16M8.5 10C7 10 6 8.8 6 7.5S7 5 8.5 5 11 6.2 11 7.5 10 10 8.5 10zM15.5 10C17 10 18 8.8 18 7.5S17 5 15.5 5 13 6.2 13 7.5 14 10 15.5 10z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" />
    </template>

    <!-- Privado -->
    <template v-else-if="name === 'lock'">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.75" />
      <path d="M8 11V8a4 4 0 118 0v3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </template>

    <!-- Inicio -->
    <template v-else-if="name === 'home'">
      <path
        d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 01-1.5 1.5H15v-5.5H9V20.5H5.5A1.5 1.5 0 014 19V10.5z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
    </template>

    <!-- Persona -->
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.75" />
      <path d="M5 19c0-3.3 3.1-5 7-5s7 1.7 7 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </template>

    <!-- Correo -->
    <template v-else-if="name === 'mail'">
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.75" />
      <path d="M4 8l8 5 8-5" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" />
    </template>

    <!-- Consultorio -->
    <template v-else-if="name === 'clinic'">
      <path
        d="M6 20V8l6-4 6 4v12"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
      <path d="M10 20v-5h4v5M10 10h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
    </template>

    <!-- Ver contraseña -->
    <template v-else-if="name === 'eye'">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.75" />
    </template>

    <!-- Ocultar contraseña -->
    <template v-else-if="name === 'eye-off'">
      <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      <path
        d="M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-4.4M6.4 6.4C4.3 7.8 2.8 9.8 2 12s3.5 6 10 6c1.8 0 3.4-.4 4.8-1.1M17 14.8c1.4-1.2 2.5-2.8 3-4.8"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
      />
    </template>

    <!-- Código -->
    <template v-else-if="name === 'key'">
      <circle cx="8" cy="8" r="4" stroke="currentColor" stroke-width="1.75" />
      <path
        d="M11 11l9 9M16 8h5M19 5v6"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>
  </svg>
</template>

<script setup lang="ts">
export type MedIconName =
  | 'calendar'
  | 'folder'
  | 'upload'
  | 'clipboard'
  | 'shield'
  | 'users'
  | 'file'
  | 'alert'
  | 'mobile'
  | 'clock'
  | 'gift'
  | 'lock'
  | 'home'
  | 'user'
  | 'mail'
  | 'clinic'
  | 'eye'
  | 'eye-off'
  | 'key'

const props = withDefaults(
  defineProps<{
    name: MedIconName
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const sizePx = computed(() => {
  if (props.size === 'sm') return 18
  if (props.size === 'lg') return 26
  return 22
})
</script>

<style scoped>
.med-icon {
  flex-shrink: 0;
  color: currentColor;
}
</style>
