import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { SimulateUpgradeDto } from './dto/simulate-upgrade.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @UseGuards(TenantAuthGuard)
  current(@CurrentTenant() auth: AuthContext) {
    return this.subscriptionsService.findCurrentForTenant(auth.tenantId);
  }

  @Get('plans')
  plans() {
    return this.subscriptionsService.findPlans();
  }

  @Post('simulate-upgrade')
  @UseGuards(TenantAuthGuard)
  simulateUpgrade(@CurrentTenant() auth: AuthContext, @Body() body: SimulateUpgradeDto) {
    return this.subscriptionsService.simulateUpgrade(auth.tenantId, body);
  }
}
