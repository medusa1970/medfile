<template>
  <article class="metric-card">
    <small>{{ label }}</small>
    <strong>{{ value }}</strong>
    <StatusBadge v-if="note" :tone="tone">{{ note }}</StatusBadge>
  </article>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string
    note?: string
    tone?: '' | 'warning' | 'danger' | 'success'
  }>(),
  {
    note: '',
    tone: '',
  },
)
</script>
