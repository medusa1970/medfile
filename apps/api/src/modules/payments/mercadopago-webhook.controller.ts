import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('webhooks/mercadopago')
export class MercadoPagoWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  receivePost(
    @Body() body: Record<string, unknown>,
    @Query('topic') topic?: string,
    @Query('id') id?: string,
  ) {
    const resourceId =
      id ||
      (typeof body?.data === 'object' && body?.data !== null
        ? String((body.data as { id?: string | number }).id ?? '')
        : undefined) ||
      (body?.id ? String(body.id) : undefined);

    const resolvedTopic =
      topic ||
      (typeof body?.type === 'string' ? body.type : undefined) ||
      (typeof body?.topic === 'string' ? body.topic : undefined);

    return this.paymentsService.handleMercadoPagoWebhook({
      topic: resolvedTopic,
      resourceId,
      body,
    });
  }

  @Get()
  receiveGet(@Query('topic') topic?: string, @Query('id') id?: string) {
    return this.paymentsService.handleMercadoPagoWebhook({
      topic,
      resourceId: id,
    });
  }
}
