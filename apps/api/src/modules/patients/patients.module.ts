import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityModule } from '../security/security.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TeamModule } from '../team/team.module';
import { Patient, PatientSchema } from './patient.schema';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';

@Module({
  imports: [
    SecurityModule,
    SubscriptionsModule,
    TeamModule,
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
