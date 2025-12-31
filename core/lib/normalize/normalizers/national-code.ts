/* --- National Code Normalizer --------------------------------------------------------------------- */

import { INPUT_LIMITS } from "@/core/config/security";
import { normalizeNumber } from "./numbers";
import { limitLength } from "../utils";

/**
 * Normalizes national code (کد ملی) input:
 * - Converts Persian/Arabic digits to English
 * - Removes non-digit characters
 * - Limits to 10 digits (based on INPUT_LIMITS.NATIONAL_CODE.MAX)
 * 
 * @param value - National code input to normalize
 * @returns Normalized national code (English digits only, max 10 digits)
 * 
 * @example
 * normalizeNationalCode("۱۲۳۴۵۶۷۸۹۰") // "1234567890"
 * normalizeNationalCode("١٢٣٤٥٦٧٨٩٠") // "1234567890"
 * normalizeNationalCode("1234567890123") // "1234567890" (truncated)
 */
export function normalizeNationalCode(value: string): string {
  if (!value) return "";
  
  // Normalize digits (Persian/Arabic to English, remove non-digits)
  const normalized = normalizeNumber(value);
  
  // Limit to max length (10 digits for national code)
  return limitLength(normalized, INPUT_LIMITS.NATIONAL_CODE.MAX);
}

