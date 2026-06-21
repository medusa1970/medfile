import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../mail/mail.module';
import { Patient, PatientSchema } from '../patients/patient.schema';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TenantsModule } from '../tenants/tenants.module';
import { UsersModule } from '../users/users.module';
import { AuditLog, AuditLogSchema } from './audit-log.schema';
import { AuditService } from './audit.service';
import { ClinicSite, ClinicSiteSchema } from './clinic-site.schema';
import { ClinicalCaptureController } from './clinical-capture.controller';
import { ClinicalCaptureService } from './clinical-capture.service';
import { DayQueueEntry, DayQueueEntrySchema } from './day-queue-entry.schema';
import { NursingCapture, NursingCaptureSchema } from './nursing-capture.schema';
import { TeamInvitation, TeamInvitationSchema } from './team-invitation.schema';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [
    UsersModule,
    TenantsModule,
    SubscriptionsModule,
    MailModule,
    MongooseModule.forFeature([
      { name: TeamInvitation.name, schema: TeamInvitationSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: ClinicSite.name, schema: ClinicSiteSchema },
      { name: DayQueueEntry.name, schema: DayQueueEntrySchema },
      { name: NursingCapture.name, schema: NursingCaptureSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  controllers: [TeamController, ClinicalCaptureController],
  providers: [TeamService, AuditService, ClinicalCaptureService],
  exports: [TeamService, AuditService, ClinicalCaptureService],
})
export class TeamModule {}
