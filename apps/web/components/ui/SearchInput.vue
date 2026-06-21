<template>
  <div class="search-field" :class="{ 'search-field--block': block }">
    <span class="search-field__icon" aria-hidden="true">
      <MedIcon name="search" size="sm" />
    </span>
    <input
      class="search-field__input"
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="ariaLabel || placeholder"
      enterkeyhint="search"
      @input="onInput"
      @keydown.enter.prevent="emit('submit')"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    ariaLabel?: string
    block?: boolean
  }>(),
  {
    modelValue: '',
    placeholder: 'Buscar…',
    ariaLabel: '',
    block: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>
