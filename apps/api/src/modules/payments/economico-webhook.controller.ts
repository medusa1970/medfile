import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

/** Público — lo llama el Banco Económico. Sin JWT. */
@Controller('webhooks/economico')
export class EconomicoWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async receive(@Body() body: unknown) {
    return this.paymentsService.handleEconomicoWebhook(body);
  }
}
