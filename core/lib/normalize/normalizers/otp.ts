/* --- OTP Normalizer ------------------------------------------------------------------------------ */

import { INPUT_LIMITS } from "@/core/config/security";
import { normalizeNumber } from "./numbers";
import { limitLength } from "../utils";

/**
 * Normalizes OTP code input:
 * - Converts Persian/Arabic digits to English
 * - Removes non-digit characters
 * - Limits to OTP_CODE.MAX digits (based on INPUT_LIMITS.OTP_CODE.MAX)
 * 
 * @param value - OTP code input to normalize
 * @returns Normalized OTP code (English digits only, max 4-6 digits)
 * 
 * @example
 * normalizeOtp("۱۲۳۴") // "1234"
 * normalizeOtp("١٢٣٤") // "1234"
 * normalizeOtp("1234abc") // "1234"
 * normalizeOtp("123456789") // "1234" (truncated to max length)
 */
export function normalizeOtp(value: string): string {
  if (!value) return "";
  
  // Normalize digits (Persian/Arabic to English, remove non-digits)
  const normalized = normalizeNumber(value);
  
  // Limit to max length (4 digits for OTP_CODE)
  return limitLength(normalized, INPUT_LIMITS.OTP_CODE.MAX);
}

