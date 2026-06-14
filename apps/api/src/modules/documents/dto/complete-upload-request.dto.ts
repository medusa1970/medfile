import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CompleteUploadRequestDto {
  @IsString()
  @MinLength(2)
  fileName!: string;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSizeBytes?: number;

  @IsOptional()
  @IsString()
  storageKey?: string;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
