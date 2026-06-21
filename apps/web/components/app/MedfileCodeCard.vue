<template>
  <div :class="['medfile-code-card', { 'medfile-code-card--compact': compact }]">
    <div class="medfile-code-card__header">
      <span class="medfile-code-card__label">Código Medfile</span>
      <span class="medfile-code-card__hint">Tu identificador en la plataforma</span>
    </div>
    <div class="medfile-code-card__body">
      <code class="medfile-code-card__code">{{ code || '—' }}</code>
      <MfButton v-if="code" variant="secondary" type="button" @click="copyCode">
        {{ copied ? 'Copiado' : 'Copiar' }}
      </MfButton>
    </div>
    <p class="medfile-code-card__help">
      Comparte este código con colegas para que te envíen o reciban historiales clínicos en Medfile.
    </p>
  </div>
</template>

<script setup lang="ts">
import { copyTextToClipboard } from '~/utils/copy-to-clipboard'

const props = defineProps<{
  code?: string | null
  compact?: boolean
}>()

const copied = ref(false)

async function copyCode() {
  if (!props.code || !import.meta.client) return

  const ok = await copyTextToClipboard(props.code)
  copied.value = ok

  if (ok) {
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.medfile-code-card {
  padding: 16px 18px;
  border: var(--mf-border);
  border-radius: var(--mf-radius-md);
  background: linear-gradient(135deg, rgb(0 31 92 / 0.04), rgb(0 169 206 / 0.06));
}

.medfile-code-card__header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 12px;
}

.medfile-code-card__label {
  font-size: 13px;
  font-weight: 700;
  color: var(--mf-navy-900);
}

.medfile-code-card__hint {
  font-size: 12px;
  color: var(--mf-neutral-500);
}

.medfile-code-card__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.medfile-code-card__code {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--mf-teal-600);
}

.medfile-code-card__help {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--mf-slate-700);
}

.medfile-code-card--compact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  padding: 12px 14px;
}

.medfile-code-card--compact .medfile-code-card__header {
  flex: 1 1 140px;
  margin-bottom: 0;
}

.medfile-code-card--compact .medfile-code-card__body {
  flex: 0 1 auto;
}

.medfile-code-card--compact .medfile-code-card__code {
  font-size: 18px;
}

.medfile-code-card--compact .medfile-code-card__help {
  flex: 1 1 100%;
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
}
</style>
