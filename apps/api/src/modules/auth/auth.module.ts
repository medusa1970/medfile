import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { TenantsModule } from '../tenants/tenants.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET', 'dev-only-change-me'),
        signOptions: {
          expiresIn: config.get<number>('JWT_ACCESS_TTL_SECONDS', 60 * 60),
        },
      }),
    }),
    TenantsModule,
    UsersModule,
    SubscriptionsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
