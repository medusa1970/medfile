<template>
  <article class="trust-card" :class="{ 'trust-card--icon': icon }">
    <span v-if="icon" class="trust-card-icon" aria-hidden="true">
      <MedIcon :name="icon" size="sm" />
    </span>
    <div class="trust-card-body">
      <strong>{{ value }}</strong>
      <span>{{ label }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MedIconName } from '~/components/ui/MedIcon.vue'

defineProps<{
  value: string
  label: string
  icon?: MedIconName
}>()
</script>
