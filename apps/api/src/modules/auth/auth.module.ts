import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtModuleOptions } from '../../config/jwt-options';
import { MailModule } from '../mail/mail.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TenantsModule } from '../tenants/tenants.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getJwtModuleOptions(config),
    }),
    TenantsModule,
    UsersModule,
    SubscriptionsModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
