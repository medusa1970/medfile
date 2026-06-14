import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { verifyAccessToken } from '../../common/verify-access-token';
import { MailService } from '../mail/mail.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { TenantsService } from '../tenants/tenants.service';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
}

const VERIFICATION_TTL_MINUTES = 30;
const PASSWORD_RESET_TTL_MINUTES = 60;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly tenantsService: TenantsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  async register(input: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta con este correo.');
    }

    const tenant = await this.tenantsService.createFreeTenant(input.clinicName);
    const passwordHash = await hash(input.password, 12);
    const verification = this.createVerificationChallenge();

    const user = await this.usersService.createOwner({
      tenantId: tenant.id,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      emailVerificationCode: verification.code,
      emailVerificationExpiresAt: verification.expiresAt,
    });

    await this.tenantsService.assignOwner(tenant.id, user.id);
    await this.subscriptionsService.createFreeForTenant(tenant.id);

    this.queueVerificationCode(input.email, verification.code, 'register');

    const session = await this.buildSessionResponse({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      medfileCode: tenant.medfileCode,
      emailVerified: false,
      onboardingCompleted: false,
    });

    return {
      ...session,
      verification: this.buildVerificationPayload(input.email, verification.code),
    };
  }

  async login(input: LoginDto) {
    const user = await this.usersService.findByEmail(input.email);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const passwordMatches = await compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const tenant = await this.tenantsService.findById(user.tenantId);

    return this.buildSessionResponse({
      userId: String(user._id),
      tenantId: user.tenantId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantName: tenant?.name as string | undefined,
      tenantSlug: tenant?.slug as string | undefined,
      medfileCode: tenant?.medfileCode as string | undefined,
      emailVerified: this.isEmailVerified(user.emailVerified),
      onboardingCompleted: this.isOnboardingCompleted(user.onboardingCompletedAt),
    });
  }

  async verifyEmail(authorizationHeader: string | undefined, body: VerifyEmailDto) {
    const userId = await this.requireUserId(authorizationHeader);
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    if (this.isEmailVerified(user.emailVerified)) {
      return { verified: true, email: user.email };
    }

    if (!user.emailVerificationCode) {
      throw new BadRequestException('No hay codigo activo. Solicita uno nuevo.');
    }

    if (this.isVerificationExpired(user.emailVerificationExpiresAt)) {
      throw new BadRequestException('El codigo expiro. Solicita uno nuevo.');
    }

    if (user.emailVerificationCode !== body.code.trim()) {
      throw new BadRequestException('Codigo invalido. Revisa el correo e intenta nuevamente.');
    }

    await this.usersService.markEmailVerified(userId);

    return { verified: true, email: user.email };
  }

  async resendVerification(authorizationHeader: string | undefined) {
    const userId = await this.requireUserId(authorizationHeader);
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    if (this.isEmailVerified(user.emailVerified)) {
      return { sent: true, email: user.email };
    }

    const verification = this.createVerificationChallenge();
    await this.usersService.setEmailVerificationCode(
      userId,
      verification.code,
      verification.expiresAt,
    );

    this.queueVerificationCode(user.email, verification.code, 'resend-auth');

    return {
      sent: true,
      email: user.email,
      verification: this.buildVerificationPayload(user.email, verification.code),
    };
  }

  async resendVerificationPublic(body: ResendVerificationDto) {
    const normalizedEmail = body.email.trim().toLowerCase();
    this.logger.log(`Reenvio OTP publico solicitado para ${normalizedEmail}`);

    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user || this.isEmailVerified(user.emailVerified)) {
      this.logger.warn(
        `Reenvio OTP omitido (sin usuario o ya verificado): ${normalizedEmail}`,
      );
      return { sent: true };
    }

    const verification = this.createVerificationChallenge();
    await this.usersService.setEmailVerificationCode(
      String(user._id),
      verification.code,
      verification.expiresAt,
    );

    this.queueVerificationCode(user.email, verification.code, 'resend-public');
    this.logger.log(`Reenvio OTP encolado para ${user.email}`);

    return {
      sent: true,
      email: user.email,
      verification: this.buildVerificationPayload(user.email, verification.code),
    };
  }

  async forgotPassword(body: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(body.email);

    if (!user || user.status !== 'active') {
      return { sent: true };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

    await this.usersService.setPasswordResetToken(
      String(user._id),
      this.hashResetToken(token),
      expiresAt,
    );

    this.queuePasswordReset(user.email, token);

    return {
      sent: true,
      ...(this.isDevEnvironment()
        ? {
            reset: this.buildPasswordResetPayload(user.email, token),
          }
        : {}),
    };
  }

  async resetPassword(body: ResetPasswordDto) {
    const user = await this.usersService.findByPasswordResetTokenHash(
      this.hashResetToken(body.token.trim()),
    );

    const normalizedEmail = body.email.trim().toLowerCase();
    if (!user || user.email !== normalizedEmail) {
      throw new BadRequestException('Enlace invalido o expirado. Solicita uno nuevo.');
    }

    if (
      !user.passwordResetExpiresAt ||
      this.isVerificationExpired(user.passwordResetExpiresAt)
    ) {
      throw new BadRequestException('El enlace expiro. Solicita uno nuevo.');
    }

    const passwordHash = await hash(body.password, 12);
    await this.usersService.updatePasswordHash(String(user._id), passwordHash);
    await this.usersService.clearPasswordResetToken(String(user._id));

    return { reset: true };
  }

  async changePassword(authorizationHeader: string | undefined, body: ChangePasswordDto) {
    const userId = await this.requireUserId(authorizationHeader);
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    if (!this.isEmailVerified(user.emailVerified)) {
      throw new ForbiddenException('Verifica tu correo antes de cambiar la contrasena.');
    }

    const passwordMatches = await compare(body.currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new BadRequestException('La contrasena actual no es correcta.');
    }

    if (body.currentPassword === body.newPassword) {
      throw new BadRequestException('La nueva contrasena debe ser distinta.');
    }

    const passwordHash = await hash(body.newPassword, 12);
    await this.usersService.updatePasswordHash(userId, passwordHash);

    return { changed: true };
  }

  async updateProfile(authorizationHeader: string | undefined, body: UpdateProfileDto) {
    const userId = await this.requireUserId(authorizationHeader);
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    if (!this.isEmailVerified(user.emailVerified)) {
      throw new ForbiddenException('Verifica tu correo antes de editar tu perfil.');
    }

    if (!body.fullName && !body.phone) {
      throw new BadRequestException('No hay cambios para guardar.');
    }

    const updated = await this.usersService.updateProfile(userId, body);
    if (!updated) {
      throw new BadRequestException('No pudimos actualizar tu perfil.');
    }

    return {
      user: {
        id: String(updated._id),
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone ?? null,
      },
    };
  }

  async completeOnboarding(authorizationHeader: string | undefined, body: CompleteOnboardingDto) {
    const userId = await this.requireUserId(authorizationHeader);
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    if (!this.isEmailVerified(user.emailVerified)) {
      throw new ForbiddenException('Verifica tu correo antes de continuar.');
    }

    const profile = {
      professionalName: body.professionalName?.trim() || user.fullName,
      specialty: body.specialty?.trim() || '',
      country: body.country?.trim() || '',
      notes: body.notes?.trim() || '',
      completedAt: new Date().toISOString(),
    };

    await this.tenantsService.updateSettings(user.tenantId, { profile });
    await this.usersService.markOnboardingCompleted(userId);

    return { completed: true, profile };
  }

  async me(authorizationHeader?: string) {
    const token = this.extractBearerToken(authorizationHeader);
    if (!token) {
      throw new UnauthorizedException('Sesion requerida.');
    }

    const payload = await verifyAccessToken<AccessTokenPayload>(this.jwtService, token);
    const [user, tenant, subscription] = await Promise.all([
      this.usersService.findById(payload.sub),
      this.tenantsService.findById(payload.tenantId),
      this.subscriptionsService.findCurrentForTenant(payload.tenantId),
    ]);

    if (!user || !tenant) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    const settings = (tenant.settings ?? {}) as Record<string, unknown>;
    const profile = (settings.profile ?? null) as Record<string, unknown> | null;

    return {
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role,
        emailVerified: this.isEmailVerified(user.emailVerified),
        onboardingCompleted: this.isOnboardingCompleted(user.onboardingCompletedAt),
      },
      tenant: {
        id: String(tenant._id),
        name: tenant.name,
        slug: tenant.slug,
        medfileCode: tenant.medfileCode,
        profile,
        trialEndsAt:
          tenant.trialEndsAt instanceof Date
            ? tenant.trialEndsAt.toISOString()
            : tenant.trialEndsAt ?? null,
      },
      subscription: {
        status: subscription.status,
        planCode: subscription.planCode,
        trial: subscription.trial,
        usage: subscription.usage,
        usageWarnings: subscription.usageWarnings,
        plan: subscription.plan,
      },
    };
  }

  private async requireUserId(authorizationHeader?: string) {
    const token = this.extractBearerToken(authorizationHeader);
    if (!token) {
      throw new UnauthorizedException('Sesion requerida.');
    }

    const payload = await verifyAccessToken<AccessTokenPayload>(this.jwtService, token);
    return payload.sub;
  }

  private createVerificationChallenge() {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MINUTES * 60 * 1000);

    return { code, expiresAt };
  }

  private buildVerificationPayload(email: string, code: string) {
    return {
      email,
      expiresInMinutes: VERIFICATION_TTL_MINUTES,
      ...(this.isDevEnvironment() ? { devCode: code } : {}),
    };
  }

  private buildPasswordResetPayload(email: string, token: string) {
    return {
      email,
      token,
      expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
    };
  }

  private hashResetToken(token: string) {
    return createHash('sha256').update(token.trim()).digest('hex');
  }

  private queueVerificationCode(email: string, code: string, context: string) {
    this.logger.log(`Encolando OTP (${context}) para ${email}`);
    void this.deliverVerificationCode(email, code)
      .then(() => this.logger.log(`OTP entregado (${context}) a ${email}`))
      .catch((error) =>
        this.logger.error(
          `OTP fallo (${context}) a ${email}`,
          error instanceof Error ? error.stack : String(error),
        ),
      );
  }

  private queuePasswordReset(email: string, token: string) {
    this.logger.log(`Encolando reset de contraseña para ${email}`);
    void this.deliverPasswordReset(email, token)
      .then(() => this.logger.log(`Reset encolado enviado a ${email}`))
      .catch((error) =>
        this.logger.error(
          `Reset fallo para ${email}`,
          error instanceof Error ? error.stack : String(error),
        ),
      );
  }

  private async deliverVerificationCode(email: string, code: string) {
    if (this.mailService.isConfigured()) {
      try {
        await this.mailService.sendVerificationCode({
          to: email,
          code,
          expiresInMinutes: VERIFICATION_TTL_MINUTES,
        });
      } catch (error) {
        this.logger.error(
          `No se pudo enviar OTP a ${email}`,
          error instanceof Error ? error.stack : String(error),
        );
        throw error;
      }
      return;
    }

    if (this.isDevEnvironment()) {
      console.info(`[Medfile] Codigo de verificacion para ${email}: ${code}`);
      return;
    }

    this.logger.warn(`SMTP no configurado; no se envio OTP a ${email}`);
  }

  private async deliverPasswordReset(email: string, token: string) {
    if (this.mailService.isConfigured()) {
      const resetUrl = `${this.getPublicWebUrl()}/restablecer-contrasena?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
      try {
        await this.mailService.sendPasswordResetLink({
          to: email,
          resetUrl,
          expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
        });
      } catch (error) {
        this.logger.error(
          `No se pudo enviar reset a ${email}`,
          error instanceof Error ? error.stack : String(error),
        );
        throw error;
      }
      return;
    }

    if (this.isDevEnvironment()) {
      console.info(`[Medfile] Token de restablecimiento para ${email}: ${token}`);
      return;
    }

    this.logger.warn(`SMTP no configurado; no se envio reset a ${email}`);
  }

  private getPublicWebUrl() {
    const explicit = this.config.get<string>('APP_PUBLIC_URL')?.trim();
    if (explicit) {
      return explicit.replace(/\/$/, '');
    }

    const firstOrigin = (this.config.get<string>('WEB_ORIGIN') ?? '')
      .split(',')
      .map((value) => value.trim())
      .find(Boolean);

    return firstOrigin?.replace(/\/$/, '') ?? 'http://localhost:3100';
  }

  private isVerificationExpired(value?: Date | string) {
    if (!value) return true;

    const expiresAt = value instanceof Date ? value : new Date(value);
    return Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now();
  }

  private isEmailVerified(value?: boolean) {
    return value !== false;
  }

  private isOnboardingCompleted(value?: Date | string) {
    if (!value) return false;
    const completedAt = value instanceof Date ? value : new Date(value);
    return !Number.isNaN(completedAt.getTime());
  }

  private isDevEnvironment() {
    return process.env.NODE_ENV !== 'production';
  }

  private async buildSessionResponse(input: {
    userId: string;
    tenantId: string;
    email: string;
    fullName: string;
    role: string;
    tenantName?: string;
    tenantSlug?: string;
    medfileCode?: string;
    trialEndsAt?: string;
    emailVerified: boolean;
    onboardingCompleted: boolean;
  }) {
    const accessToken = await this.jwtService.signAsync({
      sub: input.userId,
      tenantId: input.tenantId,
      role: input.role,
      email: input.email,
    } satisfies AccessTokenPayload);

    return {
      accessToken,
      user: {
        id: input.userId,
        fullName: input.fullName,
        email: input.email,
        role: input.role,
        emailVerified: input.emailVerified,
        onboardingCompleted: input.onboardingCompleted,
      },
      tenant: {
        id: input.tenantId,
        name: input.tenantName,
        slug: input.tenantSlug,
        medfileCode: input.medfileCode,
        trialEndsAt: input.trialEndsAt,
      },
    };
  }

  private extractBearerToken(authorizationHeader?: string) {
    const [type, token] = authorizationHeader?.split(' ') ?? [];
    return type?.toLowerCase() === 'bearer' ? token : undefined;
  }
}
