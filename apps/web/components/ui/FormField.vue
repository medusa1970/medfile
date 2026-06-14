<template>
  <label :class="['form-field', { 'form-field--compact': compact }]">
    <span>{{ label }}</span>

    <div
      v-if="!textarea"
      class="form-field-control"
      :class="{
        'form-field-control--icon': Boolean(icon),
        'form-field-control--toggle': togglePassword,
      }"
    >
      <span v-if="icon" class="form-field-icon" aria-hidden="true">
        <MedIcon :name="icon" size="sm" />
      </span>

      <input
        :value="displayValue"
        :type="resolvedType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :maxlength="maxlength"
        :inputmode="inputmode"
        :disabled="disabled"
        @input="onInput"
      />

      <button
        v-if="togglePassword"
        type="button"
        class="form-field-toggle"
        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        :aria-pressed="showPassword"
        @click="showPassword = !showPassword"
      >
        <MedIcon :name="showPassword ? 'eye-off' : 'eye'" size="sm" />
      </button>
    </div>

    <textarea
      v-else
      :value="displayValue"
      :placeholder="placeholder"
      :required="required"
      :rows="textareaRows"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
  </label>
</template>

<script setup lang="ts">
import type { MedIconName } from '~/components/ui/MedIcon.vue'

const props = withDefaults(
  defineProps<{
    label: string
    modelValue?: string | number
    type?: string
    placeholder?: string
    autocomplete?: string
    textarea?: boolean
    required?: boolean
    compact?: boolean
    rows?: number
    maxlength?: number
    inputmode?: 'text' | 'numeric' | 'email' | 'tel' | 'url' | 'search' | 'none' | 'decimal'
    icon?: MedIconName
    togglePassword?: boolean
    digitsOnly?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    autocomplete: undefined,
    textarea: false,
    required: false,
    compact: false,
    rows: 4,
    maxlength: undefined,
    inputmode: undefined,
    icon: undefined,
    togglePassword: false,
    digitsOnly: false,
    disabled: false,
  },
)

const showPassword = ref(false)

const displayValue = computed(() =>
  props.modelValue === undefined || props.modelValue === null ? '' : String(props.modelValue),
)

const textareaRows = computed(() => props.rows)

const resolvedType = computed(() => {
  if (props.togglePassword) {
    return showPassword.value ? 'text' : 'password'
  }

  return props.type
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  if (props.disabled) return

  const input = event.target as HTMLInputElement
  let value = input.value

  if (props.digitsOnly) {
    value = value.replace(/\D/g, '')
    if (props.maxlength) {
      value = value.slice(0, props.maxlength)
    }
    input.value = value
  }

  emit('update:modelValue', value)
}
</script>
