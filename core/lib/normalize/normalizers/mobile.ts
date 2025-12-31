/* --- Mobile Normalizer --------------------------------------------------------------------------- */

import { INPUT_LIMITS } from "@/core/config/security";
import { normalizeNumber } from "./numbers";
import { limitLength } from "../utils";

/**
 * Normalizes mobile number input:
 * - Converts Persian/Arabic digits to English
 * - Removes non-digit characters
 * - Only accepts numbers starting with 09
 * - Limits to 11 digits (based on INPUT_LIMITS.MOBILE.MAX)
 * 
 * @param value - Mobile number input to normalize
 * @returns Normalized mobile number (English digits only, starts with 09, max 11 digits)
 * 
 * @example
 * normalizeMobile("۰۹۱۲۳۴۵۶۷۸۹") // "09123456789"
 * normalizeMobile("09۱۲۳۴۵۶۷۸۹") // "09123456789"
 * normalizeMobile("091234567890123") // "09123456789" (truncated to 11 digits)
 * normalizeMobile("9123456789") // "" (doesn't start with 09, rejected)
 * normalizeMobile("091234567") // "091234567" (partial input, allowed)
 */
export function normalizeMobile(value: string): string {
  if (!value) return "";
  
  // Normalize digits (Persian/Arabic to English, remove non-digits)
  const normalized = normalizeNumber(value);
  
  // If empty after normalization, return empty
  if (!normalized) return "";
  
  // Allow partial input while typing: "0" or "09"
  if (normalized === "0" || normalized === "09") {
    return normalized;
  }
  
  // Only accept numbers starting with 09
  if (!normalized.startsWith("09")) {
    return ""; // Reject numbers that don't start with 09
  }
  
  // Limit to max length (11 digits for Iranian mobile)
  return limitLength(normalized, INPUT_LIMITS.MOBILE.MAX);
}

