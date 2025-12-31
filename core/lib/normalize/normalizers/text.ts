/* --- Text Normalizer ----------------------------------------------------------------------------- */

import { INPUT_LIMITS } from "@/core/config/security";
import { trim, limitLength } from "../utils";

/**
 * Normalizes text input:
 * - Trims whitespace from both ends
 * - Limits to GENERAL_TEXT.MAX length (based on INPUT_LIMITS.GENERAL_TEXT.MAX)
 * 
 * @param value - Text input to normalize
 * @returns Normalized text (trimmed, max length limited)
 * 
 * @example
 * normalizeText("  hello world  ") // "hello world"
 * normalizeText("very long text...") // truncated to max length
 */
export function normalizeText(value: string): string {
  if (!value) return "";
  
  // Trim whitespace
  const trimmed = trim(value);
  
  // Limit to max length
  return limitLength(trimmed, INPUT_LIMITS.GENERAL_TEXT.MAX);
}

