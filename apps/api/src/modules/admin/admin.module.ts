import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from '../subscriptions/subscription.schema';
import { Tenant, TenantSchema } from '../tenants/tenant.schema';
import { User, UserSchema } from '../users/user.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PlatformAdminGuard } from './platform-admin.guard';
import { PlatformSettings, PlatformSettingsSchema } from './platform-settings.schema';
import { PlatformSettingsService } from './platform-settings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlatformSettings.name, schema: PlatformSettingsSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, PlatformSettingsService, PlatformAdminGuard],
  exports: [PlatformSettingsService],
})
export class AdminModule {}
