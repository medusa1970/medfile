import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ConfirmMockCheckoutDto } from './dto/confirm-mock-checkout.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post('checkout')
  @UseGuards(TenantAuthGuard)
  async checkout(@CurrentTenant() auth: AuthContext, @Body() body: CreateCheckoutDto) {
    const checkout = await this.paymentsService.createCheckout({
      tenantId: auth.tenantId,
      payerEmail: auth.email,
      planCode: body.planCode,
      billingPeriod: body.billingPeriod ?? 'monthly',
    });

    await this.subscriptionsService.markCheckoutPending({
      tenantId: auth.tenantId,
      preapprovalId: checkout.preapprovalId,
      planCode: checkout.planCode,
      billingPeriod: checkout.billingPeriod,
      provider: checkout.mode,
    });

    return checkout;
  }

  @Post('sync-checkout')
  @UseGuards(TenantAuthGuard)
  syncCheckout(@CurrentTenant() auth: AuthContext) {
    return this.paymentsService.syncCheckoutForTenant(auth.tenantId);
  }

  @Post('confirm-mock')
  @UseGuards(TenantAuthGuard)
  confirmMock(@CurrentTenant() auth: AuthContext, @Body() body: ConfirmMockCheckoutDto) {
    return this.paymentsService.confirmMockCheckout({
      tenantId: auth.tenantId,
      preapprovalId: body.preapprovalId,
      planCode: body.planCode,
      billingPeriod: body.billingPeriod ?? 'monthly',
    });
  }
}
