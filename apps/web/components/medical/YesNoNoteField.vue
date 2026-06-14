<template>
  <label class="yes-no-field">
    <span>{{ label }}</span>
    <div class="yes-no-controls">
      <label><input v-model="choice" type="radio" :name="name" value="yes" /> Si</label>
      <label><input v-model="choice" type="radio" :name="name" value="no" /> No</label>
      <label><input v-model="choice" type="radio" :name="name" value="unknown" /> N/D</label>
    </div>
    <input
      v-if="!compact"
      v-model="notes"
      class="yes-no-notes"
      type="text"
      :placeholder="notesPlaceholder"
    />
  </label>
</template>

<script setup lang="ts">
import type { YesNoNote } from '@medfile/types'

const props = withDefaults(
  defineProps<{
    label: string
    name: string
    modelValue?: YesNoNote
    notesPlaceholder?: string
    compact?: boolean
  }>(),
  {
    modelValue: () => ({}),
    notesPlaceholder: 'Detalle opcional',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: YesNoNote]
}>()

const choice = computed({
  get() {
    if (props.modelValue?.value === true) return 'yes'
    if (props.modelValue?.value === false) return 'no'
    return 'unknown'
  },
  set(value: 'yes' | 'no' | 'unknown') {
    emit('update:modelValue', {
      value: value === 'unknown' ? undefined : value === 'yes',
      notes: props.modelValue?.notes,
    })
  },
})

const notes = computed({
  get: () => props.modelValue?.notes ?? '',
  set: (notes: string) => {
    emit('update:modelValue', {
      value: props.modelValue?.value,
      notes,
    })
  },
})
</script>
