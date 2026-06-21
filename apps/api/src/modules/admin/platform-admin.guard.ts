import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { verifyAccessToken } from '../../common/verify-access-token';
import { isPlatformAdminEmail } from '../../common/platform-admin';
import { AuthenticatedRequest } from '../security/auth-context';

interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
}

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Sesion requerida.');
    }

    const payload = await verifyAccessToken<AccessTokenPayload>(this.jwtService, token);

    if (!isPlatformAdminEmail(payload.email, this.config)) {
      throw new ForbiddenException('Acceso reservado al equipo Medfile.');
    }

    request.auth = {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email,
    };

    return true;
  }

  private extractBearerToken(authorizationHeader?: string | string[]) {
    const header = Array.isArray(authorizationHeader)
      ? authorizationHeader[0]
      : authorizationHeader;
    const [type, token] = header?.split(' ') ?? [];
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
