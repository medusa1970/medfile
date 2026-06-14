<template>
  <component :is="asLabel ? 'label' : 'div'" class="upload-zone" :for="forId">
    <span class="feature-icon">{{ icon }}</span>
    <strong>{{ title }}</strong>
    <p>{{ description }}</p>
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    icon?: string
    asLabel?: boolean
    forId?: string
  }>(),
  {
    icon: 'UP',
    asLabel: false,
    forId: undefined,
  },
)
</script>
