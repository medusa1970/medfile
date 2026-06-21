<template>
  <div
    class="stat-strip"
    :class="stripClass"
    :style="stripStyle"
    role="list"
    :aria-label="ariaLabel || undefined"
  >
    <div
      v-for="item in items"
      :key="item.label"
      class="stat-strip__item"
      role="listitem"
      :class="{ 'stat-strip__item--wide': item.span === 2 }"
    >
      <span class="stat-strip__label">{{ item.label }}</span>
      <span class="stat-strip__value">{{ item.value }}</span>
      <StatusBadge
        v-if="item.badge"
        class="stat-strip__badge"
        :tone="item.badgeTone"
      >
        {{ item.badge }}
      </StatusBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface StatStripItem {
  label: string
  value: string
  badge?: string
  badgeTone?: '' | 'warning' | 'danger' | 'success'
  /** Ocupa 2 columnas en la grilla (p. ej. texto largo en móvil). */
  span?: 1 | 2
}

const props = withDefaults(
  defineProps<{
    items: StatStripItem[]
    /** Columnas en escritorio; por defecto min(items.length, 4). */
    columns?: number
    /** Columnas en móvil: auto (2 si hay >1 item), 1 o 2. */
    mobileColumns?: 'auto' | 1 | 2
    compact?: boolean
    ariaLabel?: string
  }>(),
  {
    columns: 0,
    mobileColumns: 'auto',
    compact: true,
    ariaLabel: '',
  },
)

const stripClass = computed(() => ({
  'stat-strip--compact': props.compact,
}))

const stripStyle = computed(() => {
  const desktopColumns = props.columns || Math.min(props.items.length, 4) || 1
  const mobileColumns =
    props.mobileColumns === 'auto'
      ? props.items.length <= 1
        ? 1
        : 2
      : props.mobileColumns

  return {
    '--stat-strip-cols-mobile': String(mobileColumns),
    '--stat-strip-cols-desktop': String(desktopColumns),
  }
})
</script>
