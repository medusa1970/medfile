import { IsIn, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VitalSignsInputDto {
  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @IsOptional()
  heartRate?: number;

  @IsOptional()
  respiratoryRate?: number;

  @IsOptional()
  temperature?: number;

  @IsOptional()
  oxygenSaturation?: number;

  @IsOptional()
  weightKg?: number;

  @IsOptional()
  heightCm?: number;
}

export class CreateNursingCaptureDto {
  @IsString()
  patientId!: string;

  @IsString()
  clinicSiteId!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsInputDto)
  vitalSigns?: VitalSignsInputDto;

  @IsOptional()
  @IsString()
  nursingNote?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  triageLevel?: 'low' | 'medium' | 'high';
}

export class AddQueueEntryDto {
  @IsString()
  patientId!: string;

  @IsString()
  clinicSiteId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateClinicSiteDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  label?: string;
}
