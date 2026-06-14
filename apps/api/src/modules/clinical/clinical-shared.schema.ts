import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class YesNoNote {
  @Prop()
  value?: boolean;

  @Prop({ trim: true })
  notes?: string;
}

@Schema({ _id: false })
export class PatientAddress {
  @Prop({ trim: true })
  department?: string;

  @Prop({ trim: true })
  province?: string;

  @Prop({ trim: true })
  district?: string;

  @Prop({ trim: true })
  locality?: string;

  @Prop({ trim: true })
  streetAddress?: string;
}

@Schema({ _id: false })
export class GynecologicalBackground {
  @Prop({ trim: true })
  menarche?: string;

  @Prop({ trim: true })
  sexualActivityStart?: string;

  @Prop({ trim: true })
  contraception?: string;

  @Prop({ trim: true })
  lastMenstrualPeriod?: string;

  @Prop({ trim: true })
  cycleDuration?: string;
}

@Schema({ _id: false })
export class ObstetricBackground {
  @Prop()
  pregnancies?: number;

  @Prop()
  births?: number;

  @Prop()
  abortions?: number;

  @Prop()
  cesareans?: number;

  @Prop()
  ectopic?: number;

  @Prop({ trim: true })
  gestationalAge?: string;
}

@Schema({ _id: false })
export class PatientMedicalBackground {
  @Prop({ type: YesNoNote })
  familyDiabetes?: YesNoNote;

  @Prop({ type: YesNoNote })
  familyHypertension?: YesNoNote;

  @Prop({ trim: true })
  familyOtherNotes?: string;

  @Prop({ type: YesNoNote })
  habitAlcohol?: YesNoNote;

  @Prop({ type: YesNoNote })
  habitTobacco?: YesNoNote;

  @Prop({ type: YesNoNote })
  habitDrugs?: YesNoNote;

  @Prop({ type: YesNoNote })
  habitMedications?: YesNoNote;

  @Prop({ type: YesNoNote })
  chronicDiabetes?: YesNoNote;

  @Prop({ type: YesNoNote })
  chronicHypertension?: YesNoNote;

  @Prop({ type: YesNoNote })
  chronicTuberculosis?: YesNoNote;

  @Prop({ type: YesNoNote })
  chronicAsthma?: YesNoNote;

  @Prop({ type: YesNoNote })
  chronicAllergies?: YesNoNote;

  @Prop({ type: YesNoNote })
  chronicSurgeries?: YesNoNote;

  @Prop({ trim: true })
  chronicOtherNotes?: string;

  @Prop({ type: GynecologicalBackground })
  gynecological?: GynecologicalBackground;

  @Prop({ type: ObstetricBackground })
  obstetric?: ObstetricBackground;
}

@Schema({ _id: false })
export class VitalSigns {
  @Prop({ trim: true })
  bloodPressure?: string;

  @Prop()
  heartRate?: number;

  @Prop()
  respiratoryRate?: number;

  @Prop()
  temperature?: number;

  @Prop()
  oxygenSaturation?: number;

  @Prop()
  weightKg?: number;

  @Prop()
  heightCm?: number;
}
