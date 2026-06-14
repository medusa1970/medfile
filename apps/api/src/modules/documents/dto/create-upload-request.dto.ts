import { IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUploadRequestDto {
  @IsString()
  patientId!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
