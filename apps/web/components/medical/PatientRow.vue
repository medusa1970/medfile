<template>
  <component :is="to ? NuxtLink : 'article'" :to="to" class="patient-row">
    <div class="patient-main">
      <span class="avatar">{{ initials }}</span>
      <div>
        <strong>{{ name }}</strong>
        <span>{{ detail }}</span>
      </div>
    </div>
    <StatusBadge :tone="tone">{{ status }}</StatusBadge>
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

withDefaults(
  defineProps<{
    initials: string
    name: string
    detail: string
    status: string
    tone?: '' | 'warning' | 'danger' | 'success'
    to?: string
  }>(),
  {
    tone: '',
    to: '',
  },
)
</script>
