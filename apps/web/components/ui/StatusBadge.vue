<template>
  <span :class="['badge', tone]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: '' | 'warning' | 'danger' | 'success'
  }>(),
  {
    tone: '',
  },
)
</script>
