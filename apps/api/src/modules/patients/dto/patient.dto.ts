import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

const patientStatuses = ['active', 'follow_up', 'critical'] as const;
const patientSexes = ['male', 'female', 'other'] as const;

class YesNoNoteDto {
  @IsOptional()
  @IsBoolean()
  value?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

class PatientAddressDto {
  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;
}

class GynecologicalBackgroundDto {
  @IsOptional()
  @IsString()
  menarche?: string;

  @IsOptional()
  @IsString()
  sexualActivityStart?: string;

  @IsOptional()
  @IsString()
  contraception?: string;

  @IsOptional()
  @IsString()
  lastMenstrualPeriod?: string;

  @IsOptional()
  @IsString()
  cycleDuration?: string;
}

class ObstetricBackgroundDto {
  @IsOptional()
  @IsNumber()
  pregnancies?: number;

  @IsOptional()
  @IsNumber()
  births?: number;

  @IsOptional()
  @IsNumber()
  abortions?: number;

  @IsOptional()
  @IsNumber()
  cesareans?: number;

  @IsOptional()
  @IsNumber()
  ectopic?: number;

  @IsOptional()
  @IsString()
  gestationalAge?: string;
}

class PatientMedicalBackgroundDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  familyDiabetes?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  familyHypertension?: YesNoNoteDto;

  @IsOptional()
  @IsString()
  familyOtherNotes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  habitAlcohol?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  habitTobacco?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  habitDrugs?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  habitMedications?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  chronicDiabetes?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  chronicHypertension?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  chronicTuberculosis?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  chronicAsthma?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  chronicAllergies?: YesNoNoteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => YesNoNoteDto)
  chronicSurgeries?: YesNoNoteDto;

  @IsOptional()
  @IsString()
  chronicOtherNotes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GynecologicalBackgroundDto)
  gynecological?: GynecologicalBackgroundDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ObstetricBackgroundDto)
  obstetric?: ObstetricBackgroundDto;
}

export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsIn(patientSexes)
  sex?: (typeof patientSexes)[number];

  @IsOptional()
  @IsISO8601()
  birthDate?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PatientAddressDto)
  address?: PatientAddressDto;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(patientStatuses)
  status?: (typeof patientStatuses)[number];

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  insuranceName?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PatientMedicalBackgroundDto)
  medicalBackground?: PatientMedicalBackgroundDto;
}

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsIn(patientSexes)
  sex?: (typeof patientSexes)[number];

  @IsOptional()
  @IsISO8601()
  birthDate?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PatientAddressDto)
  address?: PatientAddressDto;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn([...patientStatuses, 'archived'])
  status?: (typeof patientStatuses)[number] | 'archived';

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  insuranceName?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PatientMedicalBackgroundDto)
  medicalBackground?: PatientMedicalBackgroundDto;
}
