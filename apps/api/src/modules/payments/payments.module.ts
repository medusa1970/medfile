import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { MercadoPagoWebhookController } from './mercadopago-webhook.controller';
import { MercadoPagoService } from './mercadopago.service';
import { PaymentEvent, PaymentEventSchema } from './payment-event.schema';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    SubscriptionsModule,
    MongooseModule.forFeature([{ name: PaymentEvent.name, schema: PaymentEventSchema }]),
  ],
  controllers: [MercadoPagoWebhookController, PaymentsController],
  providers: [MercadoPagoService, PaymentsService],
  exports: [PaymentsService, MercadoPagoService],
})
export class PaymentsModule {}
