<template>
  <NuxtLink
    class="brand"
    :class="{ 'brand--compact': compact }"
    :to="to"
    :aria-label="ariaLabel"
  >
    <img class="brand-logo-image" :src="src" :alt="alt" width="490" height="180" />
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    to?: string
    src?: string
    alt?: string
    ariaLabel?: string
    compact?: boolean
  }>(),
  {
    to: '/',
    src: '/brand/logo_medfile.svg',
    alt: 'Medfile',
    ariaLabel: 'Ir al inicio de medfile',
  },
)
</script>
