import { IsString, MinLength } from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  @MinLength(2)
  fileName!: string;

  @IsString()
  mimeType!: string;
}
