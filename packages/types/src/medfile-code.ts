/** Prefijo visible del identificador publico del consultorio en Medfile. */
export const MEDFILE_CODE_PREFIX = 'MF-';

/** Caracteres sin ambiguedad (sin 0/O, 1/I/L). */
export const MEDFILE_CODE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export const MEDFILE_CODE_BODY_LENGTH = 6;

export const MEDFILE_CODE_PATTERN = /^MF-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;

export function normalizeMedfileCode(input: string) {
  let cleaned = input.trim().toUpperCase().replace(/\s/g, '');
  if (/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(cleaned)) {
    cleaned = `${MEDFILE_CODE_PREFIX}${cleaned}`;
  } else if (cleaned.startsWith('MF') && !cleaned.startsWith(MEDFILE_CODE_PREFIX)) {
    cleaned = `${MEDFILE_CODE_PREFIX}${cleaned.slice(2).replace(/-/g, '')}`;
  }
  return cleaned;
}

export function isValidMedfileCode(code: string) {
  return MEDFILE_CODE_PATTERN.test(normalizeMedfileCode(code));
}

export function formatMedfileCodeForDisplay(code: string) {
  return normalizeMedfileCode(code);
}
