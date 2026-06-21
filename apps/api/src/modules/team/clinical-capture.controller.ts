import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { RequireRoles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { ClinicalCaptureService } from './clinical-capture.service';
import {
  AddQueueEntryDto,
  CreateClinicSiteDto,
  CreateNursingCaptureDto,
} from './dto/clinical-capture.dto';

@Controller('clinical-capture')
@UseGuards(TenantAuthGuard, RolesGuard)
export class ClinicalCaptureController {
  constructor(private readonly clinicalCaptureService: ClinicalCaptureService) {}

  @Get('clinic-sites')
  @RequireRoles('owner', 'doctor', 'clinical_capture')
  listSites(@CurrentTenant() auth: AuthContext) {
    return this.clinicalCaptureService.listClinicSites(auth.tenantId);
  }

  @Post('clinic-sites')
  @RequireRoles('owner', 'doctor')
  createSite(@CurrentTenant() auth: AuthContext, @Body() body: CreateClinicSiteDto) {
    return this.clinicalCaptureService.createClinicSite(auth.tenantId, body.name, body.label);
  }

  @Get('queue')
  @RequireRoles('owner', 'doctor', 'clinical_capture')
  listQueue(
    @CurrentTenant() auth: AuthContext,
    @Query('clinicSiteId') clinicSiteId?: string,
    @Query('date') queueDate?: string,
  ) {
    return this.clinicalCaptureService.listQueue({
      tenantId: auth.tenantId,
      userId: auth.userId,
      role: auth.role,
      clinicSiteId,
      queueDate,
    });
  }

  @Post('queue')
  @RequireRoles('owner', 'doctor')
  addToQueue(@CurrentTenant() auth: AuthContext, @Body() body: AddQueueEntryDto) {
    return this.clinicalCaptureService.addToQueue({
      tenantId: auth.tenantId,
      userId: auth.userId,
      role: auth.role,
      patientId: body.patientId,
      clinicSiteId: body.clinicSiteId,
      notes: body.notes,
    });
  }

  @Post('nursing')
  @RequireRoles('clinical_capture')
  createNursing(@CurrentTenant() auth: AuthContext, @Body() body: CreateNursingCaptureDto) {
    return this.clinicalCaptureService.createNursingCapture({
      tenantId: auth.tenantId,
      userId: auth.userId,
      role: auth.role,
      patientId: body.patientId,
      clinicSiteId: body.clinicSiteId,
      vitalSigns: body.vitalSigns as Record<string, unknown> | undefined,
      nursingNote: body.nursingNote,
      triageLevel: body.triageLevel,
    });
  }

  @Get('nursing/patient/:patientId')
  @RequireRoles('owner', 'doctor', 'clinical_capture')
  listNursing(@CurrentTenant() auth: AuthContext, @Param('patientId') patientId: string) {
    return this.clinicalCaptureService.listNursingCaptures(auth.tenantId, patientId);
  }
}
