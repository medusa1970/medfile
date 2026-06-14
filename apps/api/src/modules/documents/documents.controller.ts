import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { CompleteUploadRequestDto } from './dto/complete-upload-request.dto';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { CreateUploadRequestDto } from './dto/create-upload-request.dto';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('inbox')
  @UseGuards(TenantAuthGuard)
  inbox(@CurrentTenant() auth: AuthContext) {
    return this.documentsService.findInboxForTenant(auth.tenantId);
  }

  @Get()
  @UseGuards(TenantAuthGuard)
  findForPatient(
    @CurrentTenant() auth: AuthContext,
    @Query('patientId') patientId: string,
  ) {
    return this.documentsService.findForPatient(auth.tenantId, patientId);
  }

  @Post('upload-requests')
  @UseGuards(TenantAuthGuard)
  createUploadRequest(
    @CurrentTenant() auth: AuthContext,
    @Body() body: CreateUploadRequestDto,
  ) {
    return this.documentsService.createUploadRequest(auth.tenantId, body);
  }

  @Get('upload-requests/:token')
  findUploadRequest(@Param('token') token: string) {
    return this.documentsService.findUploadRequestByToken(token);
  }

  @Post('upload-requests/:token/complete')
  completeUploadRequest(@Param('token') token: string, @Body() body: CompleteUploadRequestDto) {
    return this.documentsService.completeUploadRequest(token, body);
  }

  @Post('upload-requests/:token/upload-url')
  createUploadUrl(@Param('token') token: string, @Body() body: CreateUploadUrlDto) {
    return this.documentsService.createUploadUrl(token, body);
  }
}
