<template>
  <section class="panel">
    <header v-if="$slots.header || title || badge" class="panel-header">
      <slot name="header">
        <div>
          <h2 v-if="title">{{ title }}</h2>
          <p v-if="description" class="panel-description">{{ description }}</p>
        </div>
        <StatusBadge v-if="badge" :tone="badgeTone">{{ badge }}</StatusBadge>
      </slot>
    </header>
    <div :class="{ 'panel-body': padded }">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    badge?: string
    badgeTone?: '' | 'warning' | 'danger' | 'success'
    padded?: boolean
  }>(),
  {
    title: '',
    description: '',
    badge: '',
    badgeTone: '',
    padded: false,
  },
)
</script>
