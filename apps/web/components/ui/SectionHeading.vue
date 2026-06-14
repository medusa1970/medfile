<template>
  <div class="section-heading">
    <EyebrowPill v-if="eyebrow">{{ eyebrow }}</EyebrowPill>
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  eyebrow?: string
}>()
</script>
