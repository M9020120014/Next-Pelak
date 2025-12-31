/* --- Normalize Utils ----------------------------------------------------------------------------- */

/**
 * Converts Persian digits (۰-۹) to English digits (0-9)
 */
export function persianToEnglish(value: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = value;
  for (let i = 0; i < persianDigits.length; i++) {
    result = result.replace(new RegExp(persianDigits[i], "g"), englishDigits[i]);
  }
  return result;
}

/**
 * Converts Arabic digits (٠-٩) to English digits (0-9)
 */
export function arabicToEnglish(value: string): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = value;
  for (let i = 0; i < arabicDigits.length; i++) {
    result = result.replace(new RegExp(arabicDigits[i], "g"), englishDigits[i]);
  }
  return result;
}

/**
 * Converts all non-English digits (Persian and Arabic) to English digits
 */
export function normalizeDigits(value: string): string {
  return arabicToEnglish(persianToEnglish(value));
}

/**
 * Removes all non-digit characters from a string
 */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Limits string length to maxLength
 */
export function limitLength(value: string, maxLength: number): string {
  return value.slice(0, maxLength);
}

/**
 * Trims whitespace from both ends
 */
export function trim(value: string): string {
  return value.trim();
}

