import { ConfigService } from '@nestjs/config';

export function isPlatformAdminEmail(email: string, config: ConfigService) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const allowlist = (config.get<string>('MEDFILE_ADMIN_EMAILS') ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(normalized);
}

export type PaymentProviderCode = 'mock' | 'mercadopago' | 'economico_qr';
