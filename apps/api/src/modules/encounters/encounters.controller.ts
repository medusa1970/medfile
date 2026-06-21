import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { RequireRoles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { EncountersService } from './encounters.service';

@UseGuards(TenantAuthGuard)
@Controller('encounters')
export class EncountersController {
  constructor(private readonly encountersService: EncountersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @RequireRoles('owner', 'doctor', 'assistant')
  findForPatient(
    @CurrentTenant() auth: AuthContext,
    @Query('patientId') patientId: string,
  ) {
    return this.encountersService.findForPatient(auth.tenantId, patientId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles('owner', 'doctor')
  create(@CurrentTenant() auth: AuthContext, @Body() body: CreateEncounterDto) {
    return this.encountersService.createForTenant(auth.tenantId, body, {
      userId: auth.userId,
      role: auth.role as 'owner' | 'doctor',
    });
  }
}
