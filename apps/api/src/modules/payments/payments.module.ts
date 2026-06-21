import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { EconomicoQrService } from './economico-qr.service';
import { EconomicoWebhookController } from './economico-webhook.controller';
import { MercadoPagoWebhookController } from './mercadopago-webhook.controller';
import { MercadoPagoService } from './mercadopago.service';
import { PaymentEvent, PaymentEventSchema } from './payment-event.schema';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { QrPayment, QrPaymentSchema } from './qr-payment.schema';

@Module({
  imports: [
    SubscriptionsModule,
    AdminModule,
    MongooseModule.forFeature([
      { name: PaymentEvent.name, schema: PaymentEventSchema },
      { name: QrPayment.name, schema: QrPaymentSchema },
    ]),
  ],
  controllers: [PaymentsController, MercadoPagoWebhookController, EconomicoWebhookController],
  providers: [MercadoPagoService, EconomicoQrService, PaymentsService],
  exports: [PaymentsService, MercadoPagoService, EconomicoQrService],
})
export class PaymentsModule {}
