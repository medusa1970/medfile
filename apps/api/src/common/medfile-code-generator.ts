import { MEDFILE_CODE_BODY_LENGTH, MEDFILE_CODE_CHARSET, MEDFILE_CODE_PREFIX } from '@medfile/types';

export function generateMedfileCodeBody() {
  let body = '';
  for (let index = 0; index < MEDFILE_CODE_BODY_LENGTH; index += 1) {
    const charIndex = Math.floor(Math.random() * MEDFILE_CODE_CHARSET.length);
    body += MEDFILE_CODE_CHARSET[charIndex];
  }
  return body;
}

export function buildMedfileCode(body = generateMedfileCodeBody()) {
  return `${MEDFILE_CODE_PREFIX}${body}`;
}
