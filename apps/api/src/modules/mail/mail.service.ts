import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { createTransport, type Transporter } from 'nodemailer';

type MailProvider = 'brevo' | 'resend' | 'smtp';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private resend: Resend | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const provider = this.getActiveProvider();
    if (provider === 'brevo') {
      this.logger.log('Correo: provider Brevo API (HTTPS, compatible Railway Hobby)');
      return;
    }

    if (provider === 'resend') {
      this.logger.log('Correo: provider Resend API');
      return;
    }

    if (provider === 'smtp') {
      this.logger.log('Correo: provider SMTP directo');
      return;
    }

    this.logger.warn(
      'Correo no configurado (BREVO_API_KEY, RESEND_API_KEY o SMTP_HOST/SMTP_USER/SMTP_PASS)',
    );
  }

  isConfigured() {
    return this.getActiveProvider() !== null;
  }

  async sendVerificationCode(input: { to: string; code: string; expiresInMinutes: number }) {
    const subject = 'Verifica tu correo en Medfile';
    const text = [
      'Hola,',
      '',
      `Tu codigo de verificacion en Medfile es: ${input.code}`,
      '',
      `Vence en ${input.expiresInMinutes} minutos.`,
      '',
      'Si no creaste una cuenta, ignora este mensaje.',
      '',
      '— Equipo Medfile',
    ].join('\n');

    const html = `
      <p>Hola,</p>
      <p>Tu codigo de verificacion en <strong>Medfile</strong> es:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px;">${input.code}</p>
      <p>Vence en ${input.expiresInMinutes} minutos.</p>
      <p>Si no creaste una cuenta, ignora este mensaje.</p>
      <p>— Equipo Medfile</p>
    `.trim();

    await this.send({ to: input.to, subject, text, html });
  }

  async sendPasswordResetLink(input: {
    to: string;
    resetUrl: string;
    expiresInMinutes: number;
  }) {
    const subject = 'Restablece tu contrasena en Medfile';
    const text = [
      'Hola,',
      '',
      'Recibimos una solicitud para restablecer tu contrasena en Medfile.',
      '',
      `Abre este enlace (vence en ${input.expiresInMinutes} minutos):`,
      input.resetUrl,
      '',
      'Si no solicitaste el cambio, ignora este correo.',
      '',
      '— Equipo Medfile',
    ].join('\n');

    const html = `
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer tu contrasena en <strong>Medfile</strong>.</p>
      <p><a href="${input.resetUrl}">Restablecer contrasena</a></p>
      <p>El enlace vence en ${input.expiresInMinutes} minutos.</p>
      <p>Si no solicitaste el cambio, ignora este correo.</p>
      <p>— Equipo Medfile</p>
    `.trim();

    await this.send({ to: input.to, subject, text, html });
  }

  async sendTeamInvitation(input: {
    to: string;
    inviteeName: string;
    clinicName: string;
    inviterName: string;
    acceptUrl: string;
    expiresInDays: number;
    roleLabel?: string;
  }) {
    const roleText = input.roleLabel ?? 'asistente administrativo';
    const subject = `Invitacion al equipo de ${input.clinicName} en Medfile`;
    const text = [
      `Hola ${input.inviteeName},`,
      '',
      `${input.inviterName} te invito al consultorio ${input.clinicName} en Medfile como ${roleText}.`,
      '',
      `Acepta la invitacion aqui: ${input.acceptUrl}`,
      '',
      `El enlace vence en ${input.expiresInDays} dias.`,
      '',
      '— Equipo Medfile',
    ].join('\n');

    const html = `
      <p>Hola ${input.inviteeName},</p>
      <p><strong>${input.inviterName}</strong> te invito al consultorio <strong>${input.clinicName}</strong> en Medfile como ${roleText}.</p>
      <p><a href="${input.acceptUrl}">Aceptar invitacion</a></p>
      <p>El enlace vence en ${input.expiresInDays} dias.</p>
    `;

    await this.send({ to: input.to, subject, text, html });
  }

  private getActiveProvider(): MailProvider | null {
    if (this.shouldUseBrevoApi()) {
      return 'brevo';
    }

    if (this.getConfig('RESEND_API_KEY')) {
      return 'resend';
    }

    if (this.getConfig('SMTP_HOST', 'EMAIL_HOST') && this.getSmtpAuth()) {
      return 'smtp';
    }

    return null;
  }

  private shouldUseBrevoApi() {
    return Boolean(this.getBrevoApiKey());
  }

  private isBrevoHost(host?: string) {
    const value = (host ?? this.getConfig('SMTP_HOST', 'EMAIL_HOST') ?? '').toLowerCase();
    return value.includes('brevo') || value.includes('sendinblue');
  }

  private getBrevoApiKey() {
    const explicit = this.getConfig('BREVO_API_KEY');
    if (explicit) return explicit;

    if (this.isBrevoHost()) {
      return this.getConfig('SMTP_PASS', 'EMAIL_PASSWORD');
    }

    return undefined;
  }

  private getSmtpAuth() {
    const user = this.getConfig('SMTP_USER', 'EMAIL_USER');
    const pass = this.getConfig('SMTP_PASS', 'EMAIL_PASSWORD');
    return user && pass ? { user, pass } : null;
  }

  private getFromAddress() {
    return (
      this.getConfig('EMAIL_FROM', 'RESEND_FROM', 'SMTP_FROM') ||
      'Medfile <onboarding@resend.dev>'
    );
  }

  private getFromEmailPlain() {
    const from = this.getFromAddress();
    const match = from.match(/<([^>]+)>/);
    return (match?.[1] ?? from).trim();
  }

  private getFromName() {
    const from = this.getFromAddress();
    const match = from.match(/^(.+?)\s*</);
    return match?.[1]?.trim() || 'Medfile';
  }

  private getConfig(...keys: string[]) {
    for (const key of keys) {
      const value = this.config.get<string>(key)?.trim();
      if (value) return value;
    }

    return undefined;
  }

  private async send(input: { to: string; subject: string; text: string; html: string }) {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('Correo no configurado (BREVO_API_KEY, RESEND_API_KEY o SMTP).');
    }

    if (provider === 'brevo') {
      await this.sendViaBrevo(input);
      return;
    }

    if (provider === 'resend') {
      await this.sendViaResend(input);
      return;
    }

    await this.sendViaSmtp(input);
  }

  private async sendViaBrevo(input: { to: string; subject: string; text: string; html: string }) {
    const apiKey = this.getBrevoApiKey();
    if (!apiKey) {
      throw new Error('BREVO_API_KEY no configurado.');
    }

    const senderEmail = this.getFromEmailPlain();
    this.logger.log(`Brevo API enviando a ${input.to} desde ${senderEmail}`);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
          name: this.getFromName(),
        },
        to: [{ email: input.to }],
        subject: input.subject,
        htmlContent: input.html,
        textContent: input.text,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Fallo Brevo hacia ${input.to}: ${response.status} ${body}`);
      throw new Error(`Brevo API ${response.status}: ${body}`);
    }

    const payload = (await response.json()) as { messageId?: string };
    this.logger.log(
      `Correo enviado via Brevo a ${input.to}: ${input.subject} (messageId=${payload.messageId ?? 'n/a'})`,
    );
  }

  private async sendViaResend(input: { to: string; subject: string; text: string; html: string }) {
    const from = this.getFromAddress();
    this.logger.log(`Resend enviando a ${input.to} desde ${from}`);

    const client = this.getResendClient();
    const { error } = await client.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    if (error) {
      this.logger.error(`Fallo Resend hacia ${input.to}: ${error.message}`);
      throw new Error(error.message);
    }

    this.logger.log(`Correo enviado via Resend a ${input.to}: ${input.subject}`);
  }

  private async sendViaSmtp(input: { to: string; subject: string; text: string; html: string }) {
    const transporter = this.getTransporter();
    const from = this.getFromAddress();
    const host = this.getConfig('SMTP_HOST', 'EMAIL_HOST');
    const port = this.getConfig('SMTP_PORT', 'EMAIL_PORT') ?? '465';

    this.logger.log(`SMTP enviando a ${input.to} via ${host}:${port}`);

    try {
      await this.withTimeout(
        transporter.sendMail({
          from,
          to: input.to,
          subject: input.subject,
          text: input.text,
          html: input.html,
        }),
        20_000,
        `SMTP hacia ${input.to}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Fallo SMTP hacia ${input.to}: ${message}`);
      throw error;
    }

    this.logger.log(`Correo enviado via SMTP a ${input.to}: ${input.subject}`);
  }

  private getResendClient() {
    if (this.resend) return this.resend;

    const apiKey = this.getConfig('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no configurado.');
    }

    this.resend = new Resend(apiKey);
    return this.resend;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
    let timeoutId: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} excedio ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private getTransporter() {
    if (this.transporter) return this.transporter;

    const auth = this.getSmtpAuth();
    if (!auth) {
      throw new Error('Credenciales SMTP incompletas.');
    }

    const port = Number(this.getConfig('SMTP_PORT', 'EMAIL_PORT') ?? '465');
    const secure =
      this.getConfig('SMTP_SECURE') === 'true' ||
      (this.getConfig('SMTP_SECURE') !== 'false' && port === 465);
    const isBrevo = this.isBrevoHost();

    this.transporter = createTransport({
      host: this.getConfig('SMTP_HOST', 'EMAIL_HOST'),
      port,
      secure,
      auth,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
      requireTLS: port === 587,
      tls: {
        rejectUnauthorized: !(isBrevo || secure === false),
      },
    });

    return this.transporter;
  }
}
