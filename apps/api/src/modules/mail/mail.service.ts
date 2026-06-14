import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(
      this.config.get<string>('SMTP_HOST') &&
        this.config.get<string>('SMTP_USER') &&
        this.config.get<string>('SMTP_PASS'),
    );
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

  private async send(input: { to: string; subject: string; text: string; html: string }) {
    if (!this.isConfigured()) {
      throw new Error('SMTP no configurado (SMTP_HOST, SMTP_USER, SMTP_PASS).');
    }

    const transporter = this.getTransporter();
    const from = this.config.get<string>('SMTP_FROM', 'Medfile <noreply@medfile.my>');

    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    this.logger.log(`Correo enviado a ${input.to}: ${input.subject}`);
  }

  private getTransporter() {
    if (this.transporter) return this.transporter;

    const port = Number(this.config.get<string>('SMTP_PORT', '465'));
    const secure = this.config.get<string>('SMTP_SECURE', port === 465 ? 'true' : 'false') === 'true';

    this.transporter = createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port,
      secure,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });

    return this.transporter;
  }
}
