<template>
  <form
    class="auth-form medical-background-form"
    :class="{ 'medical-background-form--compact': compact }"
    @submit.prevent="submitForm"
  >
    <SectionHeading
      v-if="!compact"
      eyebrow="Antecedentes"
      title="Historia medica del paciente"
    />

    <div :class="compact ? 'background-sections-grid' : undefined">
      <div class="form-section" :class="{ 'form-section--full': compact }">
        <h3>Familiares</h3>
        <div :class="compact ? 'background-family-grid' : 'form-grid-2'">
          <YesNoNoteField v-model="form.familyDiabetes" name="family-diabetes" label="Diabetes" :compact="compact" />
          <YesNoNoteField v-model="form.familyHypertension" name="family-hypertension" label="Hipertension" :compact="compact" />
        </div>
        <FormField
          v-if="!compact"
          v-model="form.familyOtherNotes"
          label="Otros antecedentes familiares"
          textarea
        />
      </div>

      <div class="form-section" :class="{ 'form-section--full': compact }">
        <h3>Habitos</h3>
        <div :class="compact ? 'background-habits-grid' : 'form-grid-2'">
          <YesNoNoteField v-model="form.habitAlcohol" name="habit-alcohol" label="Alcohol" :compact="compact" />
          <YesNoNoteField v-model="form.habitTobacco" name="habit-tobacco" label="Tabaco" :compact="compact" />
          <YesNoNoteField v-model="form.habitDrugs" name="habit-drugs" label="Drogas" :compact="compact" />
          <YesNoNoteField v-model="form.habitMedications" name="habit-medications" label="Medicamentos" :compact="compact" />
        </div>
      </div>

      <div class="form-section" :class="{ 'form-section--full': compact }">
        <h3>Cronico patologicos</h3>
        <div :class="compact ? 'background-chronic-grid' : 'form-grid-2'">
          <YesNoNoteField v-model="form.chronicDiabetes" name="chronic-diabetes" label="Diabetes" :compact="compact" />
          <YesNoNoteField v-model="form.chronicHypertension" name="chronic-hypertension" label="Hipertension" :compact="compact" />
          <YesNoNoteField v-model="form.chronicTuberculosis" name="chronic-tb" label="Tuberculosis" :compact="compact" />
          <YesNoNoteField v-model="form.chronicAsthma" name="chronic-asthma" label="Asma" :compact="compact" />
          <YesNoNoteField v-model="form.chronicAllergies" name="chronic-allergies" label="Alergias" :compact="compact" />
          <YesNoNoteField v-model="form.chronicSurgeries" name="chronic-surgeries" label="Cirugias" :compact="compact" />
        </div>
        <FormField v-if="!compact" v-model="form.chronicOtherNotes" label="Otros antecedentes" textarea />
      </div>

      <div class="form-section">
        <h3>Ginecologicos</h3>
        <div :class="compact ? 'background-gyn-grid' : 'form-grid-2'">
          <FormField v-model="form.gynecological.menarche" label="Menarca" />
          <FormField v-model="form.gynecological.sexualActivityStart" label="IVSA" />
          <FormField v-model="form.gynecological.contraception" label="MAC" />
          <FormField v-model="form.gynecological.lastMenstrualPeriod" label="FUM" />
          <FormField v-model="form.gynecological.cycleDuration" label="Duracion ciclo" />
        </div>
      </div>

      <div class="form-section">
        <h3>Obstetricos</h3>
        <div class="form-grid-3">
          <FormField v-model="form.obstetric.pregnancies" label="Gestas" type="number" />
          <FormField v-model="form.obstetric.births" label="Partos" type="number" />
          <FormField v-model="form.obstetric.abortions" label="Abortos" type="number" />
          <FormField v-model="form.obstetric.cesareans" label="Cesareas" type="number" />
          <FormField v-model="form.obstetric.ectopic" label="Ectopicos" type="number" />
          <FormField v-model="form.obstetric.gestationalAge" label="EGA" />
        </div>
      </div>
    </div>

    <div v-if="error" class="form-error">{{ error }}</div>
    <div v-if="saved" class="form-success">Antecedentes guardados.</div>

    <MfButton type="submit" :block="!compact">{{ loading ? 'Guardando...' : 'Guardar antecedentes' }}</MfButton>
  </form>
</template>

<script setup lang="ts">
import type { PatientMedicalBackground } from '@medfile/types'

const props = defineProps<{
  modelValue: PatientMedicalBackground
  compact?: boolean
  loading?: boolean
  saved?: boolean
  error?: string
}>()

const emit = defineEmits<{
  submit: [value: PatientMedicalBackground]
}>()

const form = reactive(createBackgroundForm(props.modelValue))

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(form, createBackgroundForm(value))
  },
  { deep: true },
)

function submitForm() {
  emit('submit', serializeBackground(form))
}

function createBackgroundForm(value?: PatientMedicalBackground) {
  return {
    familyDiabetes: value?.familyDiabetes ?? {},
    familyHypertension: value?.familyHypertension ?? {},
    familyOtherNotes: value?.familyOtherNotes ?? '',
    habitAlcohol: value?.habitAlcohol ?? {},
    habitTobacco: value?.habitTobacco ?? {},
    habitDrugs: value?.habitDrugs ?? {},
    habitMedications: value?.habitMedications ?? {},
    chronicDiabetes: value?.chronicDiabetes ?? {},
    chronicHypertension: value?.chronicHypertension ?? {},
    chronicTuberculosis: value?.chronicTuberculosis ?? {},
    chronicAsthma: value?.chronicAsthma ?? {},
    chronicAllergies: value?.chronicAllergies ?? {},
    chronicSurgeries: value?.chronicSurgeries ?? {},
    chronicOtherNotes: value?.chronicOtherNotes ?? '',
    gynecological: {
      menarche: value?.gynecological?.menarche ?? '',
      sexualActivityStart: value?.gynecological?.sexualActivityStart ?? '',
      contraception: value?.gynecological?.contraception ?? '',
      lastMenstrualPeriod: value?.gynecological?.lastMenstrualPeriod ?? '',
      cycleDuration: value?.gynecological?.cycleDuration ?? '',
    },
    obstetric: {
      pregnancies: value?.obstetric?.pregnancies ?? '',
      births: value?.obstetric?.births ?? '',
      abortions: value?.obstetric?.abortions ?? '',
      cesareans: value?.obstetric?.cesareans ?? '',
      ectopic: value?.obstetric?.ectopic ?? '',
      gestationalAge: value?.obstetric?.gestationalAge ?? '',
    },
  }
}

function serializeBackground(value: ReturnType<typeof createBackgroundForm>): PatientMedicalBackground {
  const background: PatientMedicalBackground = {
    familyDiabetes: cleanYesNoNote(value.familyDiabetes),
    familyHypertension: cleanYesNoNote(value.familyHypertension),
    familyOtherNotes: value.familyOtherNotes.trim() || undefined,
    habitAlcohol: cleanYesNoNote(value.habitAlcohol),
    habitTobacco: cleanYesNoNote(value.habitTobacco),
    habitDrugs: cleanYesNoNote(value.habitDrugs),
    habitMedications: cleanYesNoNote(value.habitMedications),
    chronicDiabetes: cleanYesNoNote(value.chronicDiabetes),
    chronicHypertension: cleanYesNoNote(value.chronicHypertension),
    chronicTuberculosis: cleanYesNoNote(value.chronicTuberculosis),
    chronicAsthma: cleanYesNoNote(value.chronicAsthma),
    chronicAllergies: cleanYesNoNote(value.chronicAllergies),
    chronicSurgeries: cleanYesNoNote(value.chronicSurgeries),
    chronicOtherNotes: value.chronicOtherNotes.trim() || undefined,
    gynecological: cleanNestedRecord({
      menarche: value.gynecological.menarche.trim() || undefined,
      sexualActivityStart: value.gynecological.sexualActivityStart.trim() || undefined,
      contraception: value.gynecological.contraception.trim() || undefined,
      lastMenstrualPeriod: value.gynecological.lastMenstrualPeriod.trim() || undefined,
      cycleDuration: value.gynecological.cycleDuration.trim() || undefined,
    }),
    obstetric: cleanNestedRecord({
      pregnancies: toNumber(value.obstetric.pregnancies),
      births: toNumber(value.obstetric.births),
      abortions: toNumber(value.obstetric.abortions),
      cesareans: toNumber(value.obstetric.cesareans),
      ectopic: toNumber(value.obstetric.ectopic),
      gestationalAge: value.obstetric.gestationalAge.trim() || undefined,
    }),
  }

  return Object.fromEntries(
    Object.entries(background).filter(([, entry]) => entry !== undefined),
  ) as PatientMedicalBackground
}

function cleanYesNoNote(note?: { value?: boolean; notes?: string }) {
  if (!note) return undefined

  const hasValue = note.value === true || note.value === false
  const trimmedNotes = note.notes?.trim()

  if (!hasValue && !trimmedNotes) return undefined

  return {
    ...(hasValue ? { value: note.value } : {}),
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
  }
}

function cleanNestedRecord<T extends Record<string, unknown>>(record: T) {
  const entries = Object.entries(record).filter(([, value]) => value !== undefined && value !== '')
  return entries.length > 0 ? (Object.fromEntries(entries) as T) : undefined
}

function toNumber(value: string | number | undefined) {
  if (value === '' || value == null) return undefined
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}
</script>
