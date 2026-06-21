<template>
  <ul class="kv-grid" :class="gridClass" :style="gridStyle">
    <li
      v-for="field in fields"
      :key="field.label"
      class="kv-grid__item"
      :class="{ 'kv-grid__item--missing': field.missing, 'kv-grid__item--wide': field.span === 2 }"
    >
      <span class="kv-grid__label">{{ field.label }}</span>
      <span class="kv-grid__value">{{ field.display }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
export interface KeyValueField {
  label: string
  display: string
  missing?: boolean
  span?: 1 | 2
}

const props = withDefaults(
  defineProps<{
    fields: KeyValueField[]
    /** Columnas escritorio (default 2). */
    columns?: number
    /** Columnas móvil: auto = 2 si hay varios campos, si no 1. */
    mobileColumns?: 'auto' | 1 | 2
    compact?: boolean
  }>(),
  {
    columns: 2,
    mobileColumns: 'auto',
    compact: true,
  },
)

const gridClass = computed(() => ({
  'kv-grid--compact': props.compact,
}))

const gridStyle = computed(() => {
  const mobileColumns =
    props.mobileColumns === 'auto'
      ? props.fields.length <= 1
        ? 1
        : 2
      : props.mobileColumns

  return {
    '--kv-grid-cols-mobile': String(mobileColumns),
    '--kv-grid-cols-desktop': String(props.columns),
  }
})
</script>
