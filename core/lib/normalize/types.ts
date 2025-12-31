/* --- Normalize Types ----------------------------------------------------------------------------- */

/**
 * Supported normalization types
 */
export type NormalizeType =
  | "mobile"
  | "otp"
  | "national-code"
  | "number"
  | "text"
  | "password";

/**
 * Normalizer function signature
 */
export type NormalizerFunction = (value: string) => string;

/**
 * Registry of all normalizers
 */
export type NormalizerRegistry = Record<NormalizeType, NormalizerFunction>;

