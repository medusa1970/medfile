import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from '../patients/patient.schema';
import { User, UserSchema } from '../users/user.schema';
import { SecurityModule } from '../security/security.module';
import { PlanLimitsService } from './plan-limits.service';
import { Subscription, SubscriptionSchema } from './subscription.schema';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [
    SecurityModule,
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PlanLimitsService],
  exports: [SubscriptionsService, PlanLimitsService],
})
export class SubscriptionsModule {}
