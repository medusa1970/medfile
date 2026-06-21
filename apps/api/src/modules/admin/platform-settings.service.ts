import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformSettings, PlatformSettingsDocument } from './platform-settings.schema';

const DEFAULT_PAYMENTS = {
  defaultProvider: 'mock' as const,
  mercadopagoEnabled: true,
  economicoQrEnabled: false,
  economicoMerchantLabel: 'Banco Economico',
  economicoInstructions:
    'Escanea el QR con la app del Banco Economico y confirma el monto indicado.',
};

@Injectable()
export class PlatformSettingsService {
  constructor(
    @InjectModel(PlatformSettings.name)
    private readonly settingsModel: Model<PlatformSettingsDocument>,
  ) {}

  async getPaymentsSettings() {
    const doc = await this.settingsModel.findOne({ scope: 'global' }).lean().exec();
    return {
      ...DEFAULT_PAYMENTS,
      ...(doc?.payments ?? {}),
    };
  }

  async updatePaymentsSettings(input: Partial<PlatformSettings['payments']>) {
    const doc = await this.settingsModel
      .findOneAndUpdate(
        { scope: 'global' },
        {
          $set: Object.fromEntries(
            Object.entries(input).map(([key, value]) => [`payments.${key}`, value]),
          ),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean()
      .exec();

    return {
      ...DEFAULT_PAYMENTS,
      ...(doc?.payments ?? {}),
    };
  }
}
