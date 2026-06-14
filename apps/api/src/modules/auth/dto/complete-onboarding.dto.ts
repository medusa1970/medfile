import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CompleteOnboardingDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  professionalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  specialty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
