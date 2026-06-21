<template>
  <NuxtLink v-if="to" v-bind="forwardedAttrs" :class="classes" :to="to">
    <slot />
  </NuxtLink>
  <a v-else-if="href" v-bind="forwardedAttrs" :class="classes" :href="href">
    <slot />
  </a>
  <button v-else v-bind="forwardedAttrs" :class="classes" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    block: false,
    disabled: false,
  },
)

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

const classes = computed(() => [
  'btn',
  `btn-${props.variant}`,
  attrs.class,
  {
    'btn-block': props.block,
  },
])
</script>
