import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import type { PaymentProviderCode } from '../../../common/platform-admin';

export class UpdatePaymentSettingsDto {
  @IsOptional()
  @IsIn(['mock', 'mercadopago', 'economico_qr'])
  defaultProvider?: PaymentProviderCode;

  @IsOptional()
  @IsBoolean()
  mercadopagoEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  economicoQrEnabled?: boolean;

  @IsOptional()
  @IsString()
  economicoMerchantLabel?: string;

  @IsOptional()
  @IsString()
  economicoInstructions?: string;
}
