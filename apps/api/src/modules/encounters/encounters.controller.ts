import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { CreateEncounterDto } from './dto/create-encounter.dto';
import { EncountersService } from './encounters.service';

@UseGuards(TenantAuthGuard)
@Controller('encounters')
export class EncountersController {
  constructor(private readonly encountersService: EncountersService) {}

  @Get()
  findForPatient(
    @CurrentTenant() auth: AuthContext,
    @Query('patientId') patientId: string,
  ) {
    return this.encountersService.findForPatient(auth.tenantId, patientId);
  }

  @Post()
  create(@CurrentTenant() auth: AuthContext, @Body() body: CreateEncounterDto) {
    return this.encountersService.createForTenant(auth.tenantId, body);
  }
}
