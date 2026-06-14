import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { TenantAuthGuard } from './tenant-auth.guard';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET', 'dev-only-change-me'),
      }),
    }),
  ],
  providers: [TenantAuthGuard],
  exports: [TenantAuthGuard, JwtModule],
})
export class SecurityModule {}
