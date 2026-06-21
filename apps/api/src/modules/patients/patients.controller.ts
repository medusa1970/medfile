import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type { TenantRole } from '@medfile/types';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { RequireRoles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { PatientsService } from './patients.service';

@UseGuards(TenantAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll(@CurrentTenant() auth: AuthContext) {
    return this.patientsService.findAllForTenant(auth.tenantId, {
      userId: auth.userId,
      role: auth.role as TenantRole,
    });
  }

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles('owner', 'doctor', 'assistant')
  create(@CurrentTenant() auth: AuthContext, @Body() body: CreatePatientDto) {
    return this.patientsService.createForTenant(auth.tenantId, body, {
      userId: auth.userId,
      role: auth.role as TenantRole,
    });
  }

  @Get(':id')
  findOne(@CurrentTenant() auth: AuthContext, @Param('id') patientId: string) {
    return this.patientsService.findOneForTenant(auth.tenantId, patientId, {
      userId: auth.userId,
      role: auth.role as TenantRole,
    });
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @RequireRoles('owner', 'doctor', 'assistant')
  update(
    @CurrentTenant() auth: AuthContext,
    @Param('id') patientId: string,
    @Body() body: UpdatePatientDto,
  ) {
    return this.patientsService.updateForTenant(auth.tenantId, patientId, body, {
      userId: auth.userId,
      role: auth.role as TenantRole,
    });
  }
}
