import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalDocument, MedicalDocumentSchema } from '../documents/medical-document.schema';
import { Encounter, EncounterSchema } from '../encounters/encounter.schema';
import { Patient, PatientSchema } from '../patients/patient.schema';
import { SecurityModule } from '../security/security.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TenantsModule } from '../tenants/tenants.module';
import { ClinicalShare, ClinicalShareSchema } from './clinical-share.schema';
import { ClinicalSharesController } from './clinical-shares.controller';
import { ClinicalSharesService } from './clinical-shares.service';

@Module({
  imports: [
    SecurityModule,
    SubscriptionsModule,
    TenantsModule,
    MongooseModule.forFeature([
      { name: ClinicalShare.name, schema: ClinicalShareSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Encounter.name, schema: EncounterSchema },
      { name: MedicalDocument.name, schema: MedicalDocumentSchema },
    ]),
  ],
  controllers: [ClinicalSharesController],
  providers: [ClinicalSharesService],
})
export class ClinicalSharesModule {}
