import { IsArray, IsString } from 'class-validator';

export class UpdateMemberClinicsDto {
  @IsArray()
  @IsString({ each: true })
  clinicContextIds!: string[];
}
