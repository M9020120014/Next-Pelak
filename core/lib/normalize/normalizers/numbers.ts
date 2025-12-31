/* --- Number Normalizer --------------------------------------------------------------------------- */

import { normalizeDigits } from "../utils";

/**
 * Normalizes numeric input by converting Persian/Arabic digits to English
 * and removing non-digit characters
 * 
 * @param value - Input value to normalize
 * @returns Normalized numeric string (English digits only)
 * 
 * @example
 * normalizeNumber("۱۲۳") // "123"
 * normalizeNumber("١٢٣") // "123"
 * normalizeNumber("12۳abc") // "123"
 */
export function normalizeNumber(value: string): string {
  if (!value) return "";
  
  // Convert Persian/Arabic digits to English
  const normalized = normalizeDigits(value);
  
  // Remove non-digit characters
  return normalized.replace(/\D/g, "");
}

