/* --- Normalize System ---------------------------------------------------------------------------- */

import type { NormalizeType, NormalizerRegistry } from "./types";
import { normalizeMobile } from "./normalizers/mobile";
import { normalizeOtp } from "./normalizers/otp";
import { normalizeNationalCode } from "./normalizers/national-code";
import { normalizeNumber } from "./normalizers/numbers";
import { normalizeText } from "./normalizers/text";
import { normalizePassword } from "./normalizers/password";

/**
 * Registry of all normalizers
 */
const normalizers: NormalizerRegistry = {
  mobile: normalizeMobile,
  otp: normalizeOtp,
  "national-code": normalizeNationalCode,
  number: normalizeNumber,
  text: normalizeText,
  password: normalizePassword,
};

/**
 * Normalizes input value based on the specified type
 * 
 * @param type - Type of normalization to apply (mobile, otp, national-code, number, text)
 * @param value - Input value to normalize
 * @returns Normalized value
 * 
 * @example
 * normalize("mobile", "۰۹۱۲۳۴۵۶۷۸۹") // "09123456789"
 * normalize("otp", "۱۲۳۴") // "1234"
 * normalize("national-code", "۱۲۳۴۵۶۷۸۹۰") // "1234567890"
 * normalize("number", "۱۲۳") // "123"
 * normalize("text", "  hello  ") // "hello"
 * normalize("password", "my password123!") // "my password123!"
 */
export function normalize(type: NormalizeType, value: string): string {
  const normalizer = normalizers[type];
  
  if (!normalizer) {
    console.warn(`[normalize] Unknown normalize type: ${type}. Returning original value.`);
    return value;
  }
  
  try {
    return normalizer(value);
  } catch (error) {
    console.error(`[normalize] Error normalizing value with type "${type}":`, error);
    return value;
  }
}

// Export individual normalizers for direct use if needed
export { normalizeMobile } from "./normalizers/mobile";
export { normalizeOtp } from "./normalizers/otp";
export { normalizeNationalCode } from "./normalizers/national-code";
export { normalizeNumber } from "./normalizers/numbers";
export { normalizeText } from "./normalizers/text";
export { normalizePassword } from "./normalizers/password";

// Export types
export type { NormalizeType, NormalizerFunction } from "./types";

