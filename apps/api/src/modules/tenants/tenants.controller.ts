import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthContext } from '../security/auth-context';
import { CurrentTenant } from '../security/current-tenant.decorator';
import { TenantAuthGuard } from '../security/tenant-auth.guard';
import { UsersService } from '../users/users.service';
import { TenantsService } from './tenants.service';

@UseGuards(TenantAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('me/code')
  getMyCode(@CurrentTenant() auth: AuthContext) {
    return this.tenantsService.findById(auth.tenantId).then((tenant) => {
      if (!tenant) return null;
      return {
        medfileCode: tenant.medfileCode,
        name: tenant.name,
      };
    });
  }

  @Get('lookup/:code')
  async lookupByCode(@CurrentTenant() auth: AuthContext, @Param('code') code: string) {
    const tenant = await this.tenantsService.findByMedfileCode(code);
    const tenantId = String(tenant._id);

    if (tenantId === auth.tenantId) {
      const self = await this.usersService.findById(auth.userId);
      return {
        id: tenantId,
        name: tenant.name,
        medfileCode: tenant.medfileCode,
        ownerName: self?.fullName,
        isSelf: true,
      };
    }

    let ownerName: string | undefined;
    if (tenant.ownerUserId) {
      const owner = await this.usersService.findById(tenant.ownerUserId);
      ownerName = owner?.fullName;
    }

    return {
      id: tenantId,
      name: tenant.name,
      medfileCode: tenant.medfileCode,
      ownerName,
      isSelf: false,
    };
  }
}
