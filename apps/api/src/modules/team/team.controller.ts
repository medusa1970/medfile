import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { RequireRoles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { AcceptTeamInvitationDto } from './dto/accept-team-invitation.dto';
import { CreateTeamInvitationDto } from './dto/create-team-invitation.dto';
import { UpdateMemberClinicsDto } from './dto/update-member-clinics.dto';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('members')
  @UseGuards(TenantAuthGuard, RolesGuard)
  @RequireRoles('owner', 'doctor')
  listMembers(@CurrentTenant() auth: AuthContext) {
    return this.teamService.listMembers(auth.tenantId);
  }

  @Get('invitations')
  @UseGuards(TenantAuthGuard, RolesGuard)
  @RequireRoles('owner', 'doctor')
  listInvitations(@CurrentTenant() auth: AuthContext) {
    return this.teamService.listPendingInvitations(auth.tenantId);
  }

  @Get('audit')
  @UseGuards(TenantAuthGuard, RolesGuard)
  @RequireRoles('owner', 'doctor')
  listAudit(@CurrentTenant() auth: AuthContext, @Query('limit') limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : undefined;
    return this.teamService.listAudit(auth.tenantId, Number.isFinite(parsed) ? parsed : undefined);
  }

  @Post('invitations')
  @UseGuards(TenantAuthGuard, RolesGuard)
  @RequireRoles('owner', 'doctor')
  createInvitation(
    @CurrentTenant() auth: AuthContext,
    @Body() body: CreateTeamInvitationDto,
  ) {
    return this.teamService.createInvitation(auth.tenantId, auth.userId, body);
  }

  @Delete('invitations/:id')
  @UseGuards(TenantAuthGuard, RolesGuard)
  @RequireRoles('owner', 'doctor')
  revokeInvitation(@CurrentTenant() auth: AuthContext, @Param('id') invitationId: string) {
    return this.teamService.revokeInvitation(auth.tenantId, invitationId);
  }

  @Delete('members/:id')
  @UseGuards(TenantAuthGuard, RolesGuard)
  @RequireRoles('owner', 'doctor')
  revokeMember(@CurrentTenant() auth: AuthContext, @Param('id') memberId: string) {
    if (memberId === auth.userId) {
      throw new BadRequestException('No puedes revocarte a ti mismo.');
    }
    return this.teamService.revokeMember(auth.tenantId, memberId, auth.userId, auth.role);
  }

  @Patch('members/:id/clinic-contexts')
  @UseGuards(TenantAuthGuard, RolesGuard)
  @RequireRoles('owner', 'doctor')
  updateMemberClinics(
    @CurrentTenant() auth: AuthContext,
    @Param('id') memberId: string,
    @Body() body: UpdateMemberClinicsDto,
  ) {
    return this.teamService.updateMemberClinicContexts(
      auth.tenantId,
      memberId,
      body.clinicContextIds,
      auth.userId,
      auth.role,
    );
  }

  @Get('invitations/preview')
  previewInvitation(@Query('token') token?: string) {
    if (!token) {
      return { valid: false };
    }
    return this.teamService.previewInvitation(token);
  }

  @Post('invitations/accept')
  acceptInvitation(@Body() body: AcceptTeamInvitationDto) {
    return this.teamService.acceptInvitation(body);
  }
}
