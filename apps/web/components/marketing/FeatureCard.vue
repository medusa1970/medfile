<template>
  <article class="feature-card" :class="{ 'feature-card--compact': compact }">
    <div class="feature-icon" aria-hidden="true">
      <MedIcon :name="icon" size="md" />
    </div>
    <div class="feature-body">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { MedIconName } from '~/components/ui/MedIcon.vue'

withDefaults(
  defineProps<{
    icon: MedIconName
    title: string
    description: string
    compact?: boolean
  }>(),
  { compact: true },
)
</script>
