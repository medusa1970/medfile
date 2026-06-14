"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEDFILE_CODE_PATTERN = exports.MEDFILE_CODE_BODY_LENGTH = exports.MEDFILE_CODE_CHARSET = exports.MEDFILE_CODE_PREFIX = void 0;
exports.normalizeMedfileCode = normalizeMedfileCode;
exports.isValidMedfileCode = isValidMedfileCode;
exports.formatMedfileCodeForDisplay = formatMedfileCodeForDisplay;
/** Prefijo visible del identificador publico del consultorio en Medfile. */
exports.MEDFILE_CODE_PREFIX = 'MF-';
/** Caracteres sin ambiguedad (sin 0/O, 1/I/L). */
exports.MEDFILE_CODE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
exports.MEDFILE_CODE_BODY_LENGTH = 6;
exports.MEDFILE_CODE_PATTERN = /^MF-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;
function normalizeMedfileCode(input) {
    let cleaned = input.trim().toUpperCase().replace(/\s/g, '');
    if (/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(cleaned)) {
        cleaned = `${exports.MEDFILE_CODE_PREFIX}${cleaned}`;
    }
    else if (cleaned.startsWith('MF') && !cleaned.startsWith(exports.MEDFILE_CODE_PREFIX)) {
        cleaned = `${exports.MEDFILE_CODE_PREFIX}${cleaned.slice(2).replace(/-/g, '')}`;
    }
    return cleaned;
}
function isValidMedfileCode(code) {
    return exports.MEDFILE_CODE_PATTERN.test(normalizeMedfileCode(code));
}
function formatMedfileCodeForDisplay(code) {
    return normalizeMedfileCode(code);
}
