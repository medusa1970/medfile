import { ConfigService } from '@nestjs/config';

export function getJwtAccessSecret(config: ConfigService) {
  return config.get<string>('JWT_ACCESS_SECRET', 'dev-only-change-me');
}

export function getJwtAccessTtlSeconds(config: ConfigService) {
  const raw = config.get<string>('JWT_ACCESS_TTL_SECONDS');
  const parsed = raw ? Number.parseInt(raw, 10) : 3600;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3600;
}

export function getJwtModuleOptions(config: ConfigService) {
  return {
    secret: getJwtAccessSecret(config),
    signOptions: {
      expiresIn: getJwtAccessTtlSeconds(config),
    },
  };
}
