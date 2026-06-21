import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdatePaymentSettingsDto } from './dto/update-payment-settings.dto';
import { PlatformAdminGuard } from './platform-admin.guard';

@UseGuards(PlatformAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  overview() {
    return this.adminService.getOverview();
  }

  @Get('clients')
  clients() {
    return this.adminService.listClients();
  }

  @Get('settings/payments')
  paymentSettings() {
    return this.adminService.getPaymentSettings();
  }

  @Patch('settings/payments')
  updatePaymentSettings(@Body() body: UpdatePaymentSettingsDto) {
    return this.adminService.updatePaymentSettings(body);
  }
}
