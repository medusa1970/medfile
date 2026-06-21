import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { TenantRole } from '@medfile/types';

export class CreateTeamInvitationDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsOptional()
  @IsIn(['assistant', 'clinical_capture'])
  role?: Extract<TenantRole, 'assistant' | 'clinical_capture'>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clinicContextIds?: string[];

  @IsOptional()
  @IsString()
  message?: string;
}
