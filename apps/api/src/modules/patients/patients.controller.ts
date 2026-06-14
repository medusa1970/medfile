import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { PatientsService } from './patients.service';

@UseGuards(TenantAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll(@CurrentTenant() auth: AuthContext) {
    return this.patientsService.findAllForTenant(auth.tenantId);
  }

  @Post()
  create(@CurrentTenant() auth: AuthContext, @Body() body: CreatePatientDto) {
    return this.patientsService.createForTenant(auth.tenantId, body);
  }

  @Get(':id')
  findOne(@CurrentTenant() auth: AuthContext, @Param('id') patientId: string) {
    return this.patientsService.findOneForTenant(auth.tenantId, patientId);
  }

  @Patch(':id')
  update(
    @CurrentTenant() auth: AuthContext,
    @Param('id') patientId: string,
    @Body() body: UpdatePatientDto,
  ) {
    return this.patientsService.updateForTenant(auth.tenantId, patientId, body);
  }
}
