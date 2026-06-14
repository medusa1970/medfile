import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  ClinicalShareConsent,
  ClinicalShareIntention,
  ClinicalSharePermission,
} from '@medfile/types';

export class ClinicalShareScopeDto {
  @IsOptional()
  includeSummary?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  encounterLimit?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];
}

export class ClinicalShareConsentDto {
  @IsEnum(['verbal_documented', 'written', 'digital_checkbox', 'form_photo'])
  method!: ClinicalShareConsent['method'];

  @IsOptional()
  @IsString()
  recordedAt?: string;
}

export class CreateClinicalShareDto {
  @IsString()
  @MinLength(3)
  patientId!: string;

  @IsString()
  @MinLength(5)
  targetMedfileCode!: string;

  @IsEnum(['view_only', 'collaborate', 'transfer'])
  intention!: ClinicalShareIntention;

  @IsOptional()
  @IsArray()
  permissions?: ClinicalSharePermission[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ClinicalShareScopeDto)
  scope?: ClinicalShareScopeDto;

  @IsInt()
  @Min(1)
  @Max(365)
  durationDays!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ValidateNested()
  @Type(() => ClinicalShareConsentDto)
  consent!: ClinicalShareConsentDto;
}
