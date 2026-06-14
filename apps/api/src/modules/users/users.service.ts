import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
