import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './modules/admin/admin.module';
import { getWorkspaceEnvPaths } from './config/env-paths';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { ClinicalSharesModule } from './modules/clinical-shares/clinical-shares.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { EncountersModule } from './modules/encounters/encounters.module';
import { HealthModule } from './modules/health/health.module';
import { SecurityModule } from './modules/security/security.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PatientsModule } from './modules/patients/patients.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { TeamModule } from './modules/team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getWorkspaceEnvPaths(),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URL') ||
          config.get<string>('MONGODB_URI') ||
          config.get<string>('LOCAL_MONGODB_URI') ||
          config.get<string>('MONGO_URI') ||
          'mongodb://localhost:27017/medfile_dev',
      }),
    }),
    AuthModule,
    SecurityModule,
    TenantsModule,
    HealthModule,
    PatientsModule,
    EncountersModule,
    DocumentsModule,
    SubscriptionsModule,
    ClinicalSharesModule,
    PaymentsModule,
    AdminModule,
    TeamModule,
  ],
})
export class AppModule {}
