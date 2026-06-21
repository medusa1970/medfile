import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { RequireRoles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { ClinicalSharesService } from './clinical-shares.service';
import { CreateClinicalShareDto } from './dto/create-clinical-share.dto';

@UseGuards(TenantAuthGuard)
@Controller('clinical-shares')
export class ClinicalSharesController {
  constructor(private readonly clinicalSharesService: ClinicalSharesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles('owner', 'doctor')
  create(@CurrentTenant() auth: AuthContext, @Body() body: CreateClinicalShareDto) {
    return this.clinicalSharesService.createForTenant(auth.tenantId, auth.userId, body);
  }

  @Get('sent')
  listSent(@CurrentTenant() auth: AuthContext) {
    return this.clinicalSharesService.listSent(auth.tenantId);
  }

  @Get('inbox')
  listInbox(@CurrentTenant() auth: AuthContext) {
    return this.clinicalSharesService.listInbox(auth.tenantId);
  }

  @Post(':id/accept')
  @UseGuards(RolesGuard)
  @RequireRoles('owner', 'doctor')
  accept(@CurrentTenant() auth: AuthContext, @Param('id') shareId: string) {
    return this.clinicalSharesService.acceptShare(auth.tenantId, auth.userId, shareId);
  }

  @Post(':id/reject')
  reject(@CurrentTenant() auth: AuthContext, @Param('id') shareId: string) {
    return this.clinicalSharesService.rejectShare(auth.tenantId, shareId);
  }

  @Post(':id/revoke')
  @UseGuards(RolesGuard)
  @RequireRoles('owner', 'doctor')
  revoke(@CurrentTenant() auth: AuthContext, @Param('id') shareId: string) {
    return this.clinicalSharesService.revokeShare(auth.tenantId, auth.userId, shareId);
  }

  @Get(':id/view')
  viewShared(@CurrentTenant() auth: AuthContext, @Param('id') shareId: string) {
    return this.clinicalSharesService.getSharedPatientView(auth.tenantId, shareId);
  }
}
