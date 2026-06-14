import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyAccessToken } from '../../common/verify-access-token';
import { UsersService } from '../users/users.service';
import { AuthenticatedRequest, AuthContext } from './auth-context';

interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
}

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Sesion requerida.');
    }

    const payload = await verifyAccessToken<AccessTokenPayload>(this.jwtService, token);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    if (user.emailVerified === false) {
      throw new ForbiddenException({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Verifica tu correo profesional para continuar.',
        email: user.email,
      });
    }

    request.auth = this.toAuthContext(payload);
    return true;
  }

  private extractBearerToken(authorizationHeader?: string | string[]) {
    if (Array.isArray(authorizationHeader)) return undefined;
    const [type, token] = authorizationHeader?.split(' ') ?? [];
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }

  private toAuthContext(payload: AccessTokenPayload): AuthContext {
    return {
      userId: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email,
    };
  }
}
