import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizeMedfileCode } from '@medfile/types';
import { buildMedfileCode } from '../../common/medfile-code-generator';
import { serializeDocument } from '../../common/serialize-document';
import { Tenant, TenantDocument } from './tenant.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async createFreeTenant(name: string) {
    return this.tenantModel.create({
      name,
      slug: await this.createUniqueSlug(name),
      medfileCode: await this.createUniqueMedfileCode(),
      status: 'active',
      settings: {},
    });
  }

  /** @deprecated Usar createFreeTenant */
  async createTrialTenant(name: string) {
    return this.createFreeTenant(name);
  }

  async assignOwner(tenantId: string, ownerUserId: string) {
    return this.tenantModel
      .findByIdAndUpdate(tenantId, { ownerUserId }, { new: true })
      .lean()
      .exec();
  }

  async findById(tenantId: string) {
    const tenant = await this.tenantModel.findById(tenantId).lean().exec();
    if (!tenant) return null;
    return this.ensureMedfileCode(tenant);
  }

  async findByMedfileCode(code: string) {
    const normalized = normalizeMedfileCode(code);
    const tenant = await this.tenantModel.findOne({ medfileCode: normalized }).lean().exec();
    if (!tenant) {
      throw new NotFoundException('No encontramos un consultorio con ese Codigo Medfile.');
    }
    return tenant;
  }

  async getPublicProfileByMedfileCode(code: string, ownerName?: string) {
    const tenant = await this.findByMedfileCode(code);
    return {
      id: String(tenant._id),
      name: tenant.name,
      medfileCode: tenant.medfileCode,
      ownerName,
    };
  }

  private async ensureMedfileCode(tenant: TenantDocument | Record<string, unknown>) {
    if (tenant.medfileCode) return tenant;

    const updated = await this.tenantModel
      .findByIdAndUpdate(
        tenant._id,
        { medfileCode: await this.createUniqueMedfileCode() },
        { new: true },
      )
      .lean()
      .exec();

    return updated ?? tenant;
  }

  private async createUniqueMedfileCode() {
    for (let attempt = 0; attempt < 32; attempt += 1) {
      const medfileCode = buildMedfileCode();
      const exists = await this.tenantModel.exists({ medfileCode });
      if (!exists) return medfileCode;
    }

    throw new Error('No se pudo generar un Codigo Medfile unico.');
  }

  private async createUniqueSlug(name: string) {
    const baseSlug =
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'consulta';

    let slug = baseSlug;
    let suffix = 1;

    while (await this.tenantModel.exists({ slug })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return slug;
  }

  serializeTenant(tenant: Record<string, unknown>) {
    return serializeDocument(tenant as { _id: unknown });
  }

  async updateSettings(tenantId: string, settings: Record<string, unknown>) {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) return null;

    tenant.settings = {
      ...(tenant.settings ?? {}),
      ...settings,
    };

    await tenant.save();
    return tenant.toObject();
  }
}
