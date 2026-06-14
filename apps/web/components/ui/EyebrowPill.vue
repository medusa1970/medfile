<template>
  <div class="eyebrow">
    <span v-if="pulse" class="pulse"></span>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    pulse?: boolean
  }>(),
  {
    pulse: true,
  },
)
</script>
