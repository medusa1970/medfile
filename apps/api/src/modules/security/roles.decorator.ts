import { SetMetadata } from '@nestjs/common';
import type { TenantRole } from '@medfile/types';

export const ROLES_KEY = 'medfile_roles';

export const RequireRoles = (...roles: TenantRole[]) => SetMetadata(ROLES_KEY, roles);
