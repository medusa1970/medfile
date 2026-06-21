import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { TenantRole } from '@medfile/types';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email: this.normalizeEmail(email) }).exec();
  }

  findById(userId: string) {
    return this.userModel.findById(userId).lean().exec();
  }

  findActiveForTenant(tenantId: string) {
    return this.userModel
      .find({ tenantId, status: { $in: ['active', 'invited'] } })
      .sort({ role: 1, createdAt: 1 })
      .lean()
      .exec();
  }

  countSeatsForTenant(tenantId: string) {
    return this.userModel
      .countDocuments({ tenantId, status: { $in: ['active', 'invited'] } })
      .exec();
  }

  createTeamMember(input: {
    tenantId: string;
    fullName: string;
    email: string;
    passwordHash: string;
    role: 'assistant' | 'clinical_capture';
    clinicContexts?: string[];
  }) {
    return this.userModel.create({
      tenantId: input.tenantId,
      fullName: input.fullName.trim(),
      email: this.normalizeEmail(input.email),
      passwordHash: input.passwordHash,
      role: input.role,
      clinicContexts: input.clinicContexts ?? [],
      status: 'active',
      emailVerified: true,
      onboardingCompletedAt: new Date(),
    });
  }

  /** @deprecated usar createTeamMember */
  createAssistant(input: {
    tenantId: string;
    fullName: string;
    email: string;
    passwordHash: string;
  }) {
    return this.createTeamMember({ ...input, role: 'assistant' });
  }

  disableMember(userId: string, tenantId: string) {
    return this.userModel
      .findOneAndUpdate(
        { _id: userId, tenantId, role: { $ne: 'owner' } },
        { status: 'disabled' },
        { new: true },
      )
      .lean()
      .exec();
  }

  reactivateTeamMember(input: {
    userId: string;
    tenantId: string;
    fullName: string;
    passwordHash: string;
    role: 'assistant' | 'clinical_capture';
    clinicContexts?: string[];
  }) {
    return this.userModel
      .findOneAndUpdate(
        { _id: input.userId, tenantId: input.tenantId, role: { $in: ['assistant', 'clinical_capture'] } },
        {
          fullName: input.fullName.trim(),
          passwordHash: input.passwordHash,
          role: input.role,
          clinicContexts: input.clinicContexts ?? [],
          status: 'active',
          emailVerified: true,
          onboardingCompletedAt: new Date(),
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  /** @deprecated usar reactivateTeamMember */
  reactivateAssistant(input: {
    userId: string;
    tenantId: string;
    fullName: string;
    passwordHash: string;
  }) {
    return this.reactivateTeamMember({ ...input, role: 'assistant' });
  }

  countByRole(tenantId: string, role: TenantRole) {
    return this.userModel
      .countDocuments({ tenantId, role, status: { $in: ['active', 'invited'] } })
      .exec();
  }

  updateClinicContexts(userId: string, tenantId: string, clinicContexts: string[]) {
    return this.userModel
      .findOneAndUpdate(
        { _id: userId, tenantId, role: 'clinical_capture' },
        { clinicContexts },
        { new: true },
      )
      .lean()
      .exec();
  }

  findByPasswordResetTokenHash(tokenHash: string) {
    return this.userModel.findOne({ passwordResetTokenHash: tokenHash }).exec();
  }

  createOwner(input: {
    tenantId: string;
    fullName: string;
    email: string;
    phone: string;
    passwordHash: string;
    emailVerificationCode: string;
    emailVerificationExpiresAt: Date;
  }) {
    return this.userModel.create({
      tenantId: input.tenantId,
      fullName: input.fullName,
      email: this.normalizeEmail(input.email),
      phone: this.normalizePhone(input.phone),
      passwordHash: input.passwordHash,
      role: 'owner',
      status: 'active',
      emailVerified: false,
      emailVerificationCode: input.emailVerificationCode,
      emailVerificationExpiresAt: input.emailVerificationExpiresAt,
    });
  }

  updateProfile(userId: string, input: { fullName?: string; phone?: string }) {
    const update: Record<string, string> = {};

    if (input.fullName !== undefined) {
      update.fullName = input.fullName.trim();
    }

    if (input.phone !== undefined) {
      update.phone = this.normalizePhone(input.phone);
    }

    return this.userModel.findByIdAndUpdate(userId, update, { new: true }).lean().exec();
  }

  updatePasswordHash(userId: string, passwordHash: string) {
    return this.userModel
      .findByIdAndUpdate(userId, { passwordHash }, { new: true })
      .lean()
      .exec();
  }

  setPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: expiresAt,
        },
        { new: true },
      )
      .exec();
  }

  clearPasswordResetToken(userId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $unset: {
            passwordResetTokenHash: 1,
            passwordResetExpiresAt: 1,
          },
        },
        { new: true },
      )
      .exec();
  }

  markOnboardingCompleted(userId: string) {
    return this.userModel
      .findByIdAndUpdate(userId, { onboardingCompletedAt: new Date() }, { new: true })
      .lean()
      .exec();
  }

  setEmailVerificationCode(userId: string, code: string, expiresAt: Date) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          emailVerificationCode: code,
          emailVerificationExpiresAt: expiresAt,
        },
        { new: true },
      )
      .exec();
  }

  markEmailVerified(userId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          emailVerified: true,
          $unset: {
            emailVerificationCode: 1,
            emailVerificationExpiresAt: 1,
          },
        },
        { new: true },
      )
      .exec();
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  normalizePhone(phone: string) {
    const digits = phone.replace(/\D/g, '');
    return digits ? `+${digits}` : '';
  }
}
