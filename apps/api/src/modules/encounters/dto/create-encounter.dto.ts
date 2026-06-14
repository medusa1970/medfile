import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

const careTypes = ['private', 'epidemiological', 'soat', 'other'] as const;
const patientDestinations = [
  'home',
  'referred',
  'death',
  'external_followup',
  'absconded',
  'observation',
  'interconsultation',
] as const;

class VitalSignsDto {
  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @IsOptional()
  @IsNumber()
  heartRate?: number;

  @IsOptional()
  @IsNumber()
  respiratoryRate?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  oxygenSaturation?: number;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  heightCm?: number;
}

export class CreateEncounterDto {
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsIn(['general', 'emergency'])
  template?: 'general' | 'emergency';

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsIn(careTypes)
  careType?: (typeof careTypes)[number];

  @IsOptional()
  @IsString()
  careTypeOther?: string;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsOptional()
  @IsBoolean()
  assistedArrival?: boolean;

  @IsOptional()
  @IsString()
  assistedBy?: string;

  @IsString()
  @MinLength(2)
  reason!: string;

  @IsOptional()
  @IsString()
  presentIllness?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  physicalExamNotes?: string;

  @IsOptional()
  @IsString()
  auxiliaryExams?: string;

  @IsOptional()
  @IsString()
  companionName?: string;

  @IsOptional()
  @IsIn(patientDestinations)
  patientDestination?: (typeof patientDestinations)[number];

  @IsOptional()
  @IsString()
  referralFacility?: string;

  @IsOptional()
  @IsString()
  responsiblePhysicianName?: string;

  @IsOptional()
  @IsDateString()
  observationAdmissionAt?: string;

  @IsOptional()
  @IsString()
  observationRoom?: string;

  @IsOptional()
  @IsString()
  evolutionNotes?: string;

  @IsOptional()
  @IsString()
  dischargeDiagnosis?: string;

  @IsOptional()
  @IsDateString()
  dischargedAt?: string;

  @IsOptional()
  @IsString()
  notesToFamily?: string;

  @IsOptional()
  @IsString()
  responsibleFamilyName?: string;

  @IsOptional()
  @IsString()
  responsibleFamilyDocumentId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;
}
