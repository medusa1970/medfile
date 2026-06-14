<template>
  <NuxtLink v-if="to" :class="classes" :to="to">
    <slot />
  </NuxtLink>
  <a v-else-if="href" :class="classes" :href="href">
    <slot />
  </a>
  <button v-else :class="classes" :type="type">
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    to?: string
    href?: string
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    block: false,
  },
)

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  {
    'btn-block': props.block,
  },
])
</script>
