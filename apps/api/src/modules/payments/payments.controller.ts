import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { RequireRoles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { ConfirmMockCheckoutDto } from './dto/confirm-mock-checkout.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateQrCheckoutDto } from './dto/create-qr-checkout.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(TenantAuthGuard, RolesGuard)
@RequireRoles('owner', 'doctor')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('options')
  getOptions() {
    return this.paymentsService.getPaymentOptions();
  }

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

  @Post('checkout/qr')
  @UseGuards(TenantAuthGuard)
  createQrCheckout(@CurrentTenant() auth: AuthContext, @Body() body: CreateQrCheckoutDto) {
    return this.paymentsService.createQrCheckout({
      tenantId: auth.tenantId,
      userId: auth.userId,
      planCode: body.planCode,
      billingPeriod: body.billingPeriod ?? 'monthly',
    });
  }

  /** Alias legacy — misma respuesta que checkout/qr */
  @Post('economico-qr/checkout')
  @UseGuards(TenantAuthGuard)
  economicoQrCheckout(@CurrentTenant() auth: AuthContext, @Body() body: CreateQrCheckoutDto) {
    return this.createQrCheckout(auth, body);
  }

  @Get('checkout/:id/status')
  @UseGuards(TenantAuthGuard)
  getQrStatus(@CurrentTenant() auth: AuthContext, @Param('id') id: string) {
    return this.paymentsService.getQrCheckoutStatus(id, auth.tenantId);
  }

  @Post('checkout/:id/confirm-mock')
  @UseGuards(TenantAuthGuard)
  confirmMockQr(@CurrentTenant() auth: AuthContext, @Param('id') id: string) {
    return this.paymentsService.confirmMockQrCheckout(id, auth.tenantId);
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
