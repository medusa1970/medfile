import { IsString, MinLength } from 'class-validator';

export class AcceptTeamInvitationDto {
  @IsString()
  @MinLength(16)
  token!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
