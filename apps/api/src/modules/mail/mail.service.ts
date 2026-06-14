import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { createTransport, type Transporter } from 'nodemailer';

type MailProvider = 'resend' | 'smtp';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private resend: Resend | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const provider = this.getActiveProvider();
    if (provider === 'resend') {
      this.logger.log('Correo: provider Resend API (recomendado en Railway Hobby)');
      return;
    }

    if (provider === 'smtp') {
      this.logger.log('Correo: provider SMTP (requiere Railway Pro para Hostinger)');
      return;
    }

    this.logger.warn('Correo no configurado (RESEND_API_KEY o SMTP_HOST/SMTP_USER/SMTP_PASS)');
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

  private getActiveProvider(): MailProvider | null {
    if (this.config.get<string>('RESEND_API_KEY')?.trim()) {
      return 'resend';
    }

    if (
      this.config.get<string>('SMTP_HOST') &&
      this.config.get<string>('SMTP_USER') &&
      this.config.get<string>('SMTP_PASS')
    ) {
      return 'smtp';
    }

    return null;
  }

  private getFromAddress() {
    return (
      this.config.get<string>('RESEND_FROM')?.trim() ||
      this.config.get<string>('SMTP_FROM')?.trim() ||
      'Medfile <onboarding@resend.dev>'
    );
  }

  private async send(input: { to: string; subject: string; text: string; html: string }) {
    const provider = this.getActiveProvider();
    if (!provider) {
      throw new Error('Correo no configurado (RESEND_API_KEY o SMTP).');
    }

    if (provider === 'resend') {
      await this.sendViaResend(input);
      return;
    }

    await this.sendViaSmtp(input);
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

    this.logger.log(
      `SMTP enviando a ${input.to} via ${this.config.get<string>('SMTP_HOST')}:${this.config.get<string>('SMTP_PORT', '465')}`,
    );

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

    const apiKey = this.config.get<string>('RESEND_API_KEY')?.trim();
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

    const port = Number(this.config.get<string>('SMTP_PORT', '465'));
    const secure =
      this.config.get<string>('SMTP_SECURE', port === 465 ? 'true' : 'false') === 'true';

    this.transporter = createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port,
      secure,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
      ...(port === 587 ? { requireTLS: true } : {}),
    });

    return this.transporter;
  }
}
