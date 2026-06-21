/**
 * Enlace wa.me para compartir mensajes (Plan Gratis).
 * @see docs/20-gratis-vs-pago.md
 */
export function normalizeWhatsAppPhone(phone: string) {
  return phone.replace(/\D/g, '');
}

export function buildWhatsAppShareUrl(message: string, phone?: string) {
  const text = encodeURIComponent(message);
  const digits = phone ? normalizeWhatsAppPhone(phone) : '';
  if (digits.length >= 8) {
    return `https://wa.me/${digits}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

export function buildUploadRequestWhatsAppMessage(input: {
  patientName?: string;
  doctorLabel?: string;
  uploadUrl: string;
  title?: string;
}) {
  const greeting = input.patientName ? `Hola ${input.patientName},` : 'Hola,';
  const doctor = input.doctorLabel ?? 'Tu medico';
  const task = input.title ?? 'enviar tus examenes o documentos medicos';
  const url = input.uploadUrl.trim();

  return [
    `${greeting}`,
    '',
    `${doctor} te solicita ${task}.`,
    '',
    'Abre este enlace seguro:',
    url,
    '',
    'Puedes tomar una foto o subir un PDF desde tu celular.',
  ].join('\n');
}

export function openWhatsAppShare(message: string, phone?: string) {
  if (!import.meta.client) return;
  window.open(buildWhatsAppShareUrl(message, phone), '_blank', 'noopener,noreferrer');
}
