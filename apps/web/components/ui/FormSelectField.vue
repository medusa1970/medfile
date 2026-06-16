<template>
  <label
    :class="[
      'form-field',
      {
        'form-field--compact': compact,
        'form-field--inset': insetLabel,
        'form-field--filled': insetLabel && Boolean(modelValue),
      },
    ]"
  >
    <span v-if="!insetLabel">
      {{ label }}<span v-if="optional" class="form-field-label-optional"> (opcional)</span>
    </span>

    <div
      class="form-field-control"
      :class="{
        'form-field-control--icon': Boolean(icon),
        'form-field-control--select': true,
      }"
    >
      <span v-if="icon" class="form-field-icon" aria-hidden="true">
        <MedIcon :name="icon" size="sm" />
      </span>

      <select
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        @change="onChange"
      >
        <option value="" :disabled="insetLabel" :hidden="insetLabel">
          {{ insetLabel ? '' : placeholderOption || 'Seleccionar' }}
        </option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <span v-if="insetLabel" class="form-field-label">
        {{ label }}<span v-if="optional" class="form-field-label-optional"> · opcional</span>
      </span>
    </div>
  </label>
</template>

<script setup lang="ts">
import type { MedIconName } from '~/components/ui/MedIcon.vue'

export interface FormSelectOption {
  value: string
  label: string
}

withDefaults(
  defineProps<{
    label: string
    modelValue?: string
    options: FormSelectOption[]
    placeholderOption?: string
    required?: boolean
    compact?: boolean
    insetLabel?: boolean
    optional?: boolean
    icon?: MedIconName
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    placeholderOption: '',
    required: false,
    compact: false,
    insetLabel: false,
    optional: false,
    icon: undefined,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>
