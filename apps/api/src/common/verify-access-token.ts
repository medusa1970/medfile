import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export async function verifyAccessToken<T extends object>(
  jwtService: JwtService,
  token: string,
): Promise<T> {
  try {
    return await jwtService.verifyAsync<T>(token);
  } catch {
    throw new UnauthorizedException('Sesion expirada o invalida.');
  }
}
