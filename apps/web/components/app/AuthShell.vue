<template>
  <div class="page-shell auth-page">
    <MarketingNav />

    <main class="auth-shell">
      <section class="auth-intro">
        <div class="auth-intro-copy">
          <EyebrowPill>{{ eyebrow }}</EyebrowPill>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
        </div>

        <div class="trust-row auth-trust">
          <InfoCard
            v-for="item in resolvedTrustItems"
            :key="item.value"
            :icon="item.icon"
            :value="item.value"
            :label="item.label"
          />
        </div>
      </section>

      <section class="auth-card">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { MedIconName } from '~/components/ui/MedIcon.vue'

type AuthTrustItem = { icon: MedIconName; value: string; label: string }

const defaultTrustItems: AuthTrustItem[] = [
  { icon: 'gift', value: 'Gratis', label: 'sin vencimiento' },
  { icon: 'lock', value: 'Tus datos', label: 'nunca se borran' },
  { icon: 'mobile', value: 'WhatsApp', label: 'enlace al paciente' },
]

const props = withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    description: string
    trustItems?: AuthTrustItem[]
  }>(),
  {},
)

const resolvedTrustItems = computed(() => props.trustItems ?? defaultTrustItems)
</script>
