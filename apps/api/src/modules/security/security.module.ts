import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { getJwtModuleOptions } from '../../config/jwt-options';
import { UsersModule } from '../users/users.module';
import { TenantAuthGuard } from './tenant-auth.guard';

@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getJwtModuleOptions(config),
    }),
  ],
  providers: [TenantAuthGuard],
  exports: [TenantAuthGuard, JwtModule, UsersModule],
})
export class SecurityModule {}
