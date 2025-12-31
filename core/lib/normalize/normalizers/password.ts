/* --- Password Normalizer ------------------------------------------------------------------------- */

import { INPUT_LIMITS } from "@/core/config/security";
import { limitLength } from "../utils";

/**
 * Normalizes password input:
 * - Removes control characters (0x00-0x1F, 0x7F) for security
 * - Preserves all other characters including spaces and special characters
 * - Limits to PASSWORD.MAX length (based on INPUT_LIMITS.PASSWORD.MAX)
 * 
 * Note: Passwords are NOT trimmed as leading/trailing spaces may be intentional
 * 
 * @param value - Password input to normalize
 * @returns Normalized password (control characters removed, max length limited)
 * 
 * @example
 * normalizePassword("my password123!") // "my password123!"
 * normalizePassword("pass\x00word") // "password" (control character removed)
 * normalizePassword("very long password...") // truncated to max length
 */
export function normalizePassword(value: string): string {
  if (!value) return "";
  
  // Remove control characters (0x00-0x1F, 0x7F) for security
  // But preserve all other characters including spaces and special characters
  const sanitized = value.replace(/[\x00-\x1F\x7F]/g, "");
  
  // Limit to max length
  return limitLength(sanitized, INPUT_LIMITS.PASSWORD.MAX);
}

