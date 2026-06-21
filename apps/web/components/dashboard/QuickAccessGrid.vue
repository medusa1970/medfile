<template>
  <PanelCard padded class="quick-access-panel">
    <template #header>
      <div class="quick-access-heading">
        <span class="quick-access-heading__icon" aria-hidden="true">
          <MedIcon name="home" size="sm" />
        </span>
        <div>
          <h2>Accesos rápidos</h2>
          <p class="panel-description">
            {{ subtitle }}
          </p>
        </div>
      </div>
    </template>

    <div class="quick-access-grid" role="list">
      <NuxtLink
        v-for="item in items"
        :key="item.id"
        :to="item.to"
        class="quick-access-tile"
        :class="{ 'quick-access-tile--locked': item.locked }"
        role="listitem"
        :aria-label="item.locked ? `${item.label}. Requiere ${item.lockBadge}. Mejorar plan.` : item.label"
      >
        <span
          class="quick-access-tile__icon"
          :class="`quick-access-tile__icon--${item.tone}`"
          aria-hidden="true"
        >
          <MedIcon :name="item.locked ? 'lock' : item.icon" size="sm" />
        </span>
        <span class="quick-access-tile__label">{{ item.label }}</span>
        <span class="quick-access-tile__hint">{{ item.hint }}</span>
        <span v-if="item.lockBadge && item.locked" class="quick-access-tile__lock-badge">
          {{ item.lockBadge }}
        </span>
        <span v-else-if="item.badge" class="quick-access-tile__badge">{{ item.badge }}</span>
      </NuxtLink>
    </div>
  </PanelCard>
</template>

<script setup lang="ts">
import type { DoctorQuickAccessItem } from '~/utils/doctor-quick-access'

defineProps<{
  items: DoctorQuickAccessItem[]
  subtitle?: string
}>()
</script>
