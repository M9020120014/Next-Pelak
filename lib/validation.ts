import { greToPer, perToGre } from "@/lib/date";
import { PASSWORD, INPUT_LIMITS, TOKEN, DATE_VALIDATION } from "@/config/security";

/* --- Types ------------------------------------------------------------------------------------ */
export type ValidationResult = {
  success: boolean;
  title: string;
  message: string;
};

/* --- Base Validation Helper ------------------------------------------------------------------- */
/**
 * Base validation function to reduce code duplication
 * Creates a validation result with consistent structure
 */
function createValidationResult(
  success: boolean,
  title: string,
  message: string
): ValidationResult {
  return { success, title, message };
}

/**
 * Create success validation result
 */
function success(title: string, message: string): ValidationResult {
  return createValidationResult(true, title, message);
}

/**
 * Create failure validation result
 */
function failure(title: string, message: string): ValidationResult {
  return createValidationResult(false, title, message);
}

/* --- Validates mobile number ------------------------------------------------------------------ */
export function validateMobile(
  mobile: string ,
  strict: boolean = false
): ValidationResult {
  if (!mobile) {
    return failure("Mobile is required", "شماره موبایل اجباری است");
  }
  const trimmed = mobile.trim();
  if (!strict) {
    /* --- Validate Iranian only ---- */
    const iranianMobileRegex = /^09\d{9}$/;
    if (!iranianMobileRegex.test(trimmed)) {
      return failure(
        "Mobile must be 11 digits and start with 09",
        "شماره موبایل باید 11 رقم و با 09 شروع شود"
      );
    }
  } else {
    /* --- Validate digits only ----- */
    const digitsOnly = /^\d+$/;
    if (!digitsOnly.test(trimmed) || trimmed.length < INPUT_LIMITS.MOBILE.MIN || trimmed.length > INPUT_LIMITS.MOBILE.MAX) {
      return failure(
        `Mobile must be between ${INPUT_LIMITS.MOBILE.MIN} and ${INPUT_LIMITS.MOBILE.MAX} digits`,
        `شماره موبایل باید بین ${INPUT_LIMITS.MOBILE.MIN} و ${INPUT_LIMITS.MOBILE.MAX} رقم باشد`
      );
    }
  }

  return success("Mobile is valid", "شماره موبایل معتبر است");
}
/* --- Validates password ----------------------------------------------------------------------- */
export function validatePassword(
  password: string ,
  minLength: number = PASSWORD.MIN_LENGTH,
  maxLength: number = INPUT_LIMITS.PASSWORD.MAX
): ValidationResult {
  // Ensure minimum length is at least the configured minimum
  const effectiveMinLength = Math.max(minLength, PASSWORD.MIN_LENGTH);
  if (!password) {
    return failure("Password is required", "رمز عبور اجباری است");
  }
  /* --- Validate minimum length --- */
  if (password.length < effectiveMinLength) {
    return failure(
      `Password must be at least ${effectiveMinLength} characters long`,
      `رمز عبور باید حداقل ${effectiveMinLength} کاراکتر باشد`
    );
  }
  if (password.length > maxLength) {
    return failure(
      `Password must be less than ${maxLength} characters long`,
      `رمز عبور باید حداکثر ${maxLength} کاراکتر باشد`
    );
  }

  // Password complexity validation
  if (PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return failure(
      "Password must contain at least one uppercase letter",
      "رمز عبور باید حداقل یک حرف بزرگ داشته باشد"
    );
  }

  if (PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return failure(
      "Password must contain at least one lowercase letter",
      "رمز عبور باید حداقل یک حرف کوچک داشته باشد"
    );
  }

  if (PASSWORD.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    return failure(
      "Password must contain at least one number",
      "رمز عبور باید حداقل یک عدد داشته باشد"
    );
  }

  if (PASSWORD.REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return failure(
      "Password must contain at least one special character",
      "رمز عبور باید حداقل یک کاراکتر خاص داشته باشد"
    );
  }

  return success("Password is valid", "رمز عبور معتبر است");
}
/* --- Validates otp code ----------------------------------------------------------------------- */
export function validateOtpCode(
  otpCode: string ,
  length: number = 4,
): ValidationResult {
  if (!otpCode) {
    return failure("OTP code is required", "کد تأیید اجباری است");
  }
  if (otpCode.length < INPUT_LIMITS.OTP_CODE.MIN || otpCode.length > INPUT_LIMITS.OTP_CODE.MAX) {
    return failure(
      `OTP code must be between ${INPUT_LIMITS.OTP_CODE.MIN} and ${INPUT_LIMITS.OTP_CODE.MAX} characters`,
      `کد تأید باید بین ${INPUT_LIMITS.OTP_CODE.MIN} و ${INPUT_LIMITS.OTP_CODE.MAX} رقم باشد`
    );
  }
  if (otpCode.length !== length && length >= INPUT_LIMITS.OTP_CODE.MIN && length <= INPUT_LIMITS.OTP_CODE.MAX) {
    return failure(
      `OTP code must be ${length} characters long`,
      `کد تأید باید ${length} رقم باشد`
    );
  }

  return success("OTP code is valid", "کد تأید معتبر است");
}
/* --- Validates device id --------------------------------------------------------------------- */
export function validateDeviceId(
  deviceId: string 
): ValidationResult {
  if (!deviceId) {
    return failure("Device ID is required", "Device ID اجباری است");
  }

  // Device ID should be exactly 40 characters (based on idevice token generation)
  // Format: encoded timestamp + device info (9 chars) = 40 chars total
  if (deviceId.length !== TOKEN.DEVICE_ID_LENGTH) {
    return failure("Device ID format is invalid", "فرمت شناسه دستگاه معتبر نیست");
  }

  // Basic format validation: should contain alphanumeric characters
  // Device ID format: starts with 'c' followed by encoded timestamp and device info
  if (!/^[A-Za-z0-9]+$/.test(deviceId)) {
    return failure("Device ID format is invalid", "فرمت شناسه دستگاه معتبر نیست");
  }

  // Enhanced validation: Check structure
  // Device ID should start with 'c' (from encodeTimestamp)
  if (!deviceId.startsWith('c')) {
    return failure("Device ID format is invalid", "فرمت شناسه دستگاه معتبر نیست");
  }

  // Check for 'X' markers in expected positions (from encodeTimestamp structure)
  // Format: c + encoded data + X + random + X
  const xCount = (deviceId.match(/X/g) || []).length;
  if (xCount < 2) {
    return failure("Device ID format is invalid", "فرمت شناسه دستگاه معتبر نیست");
  }

  return success("Device ID is valid", "آی دی دستگاه معتبر است");
}

/* --- Validates nationalCode ----------------------------------------------------------------------- */
export function validateNationalCode(
  value: string
): ValidationResult {
  
  if (!value) {
    return failure("NationalCode is required", "کد ملی اجباری است");
  }
  const trimmed = value.trim();
  const nationalCodeRegex = /^[0-9]{10}$/;
  if (!nationalCodeRegex.test(trimmed)) {
    return failure("NationalCode is not Valid", "کد ملی معتبر نیست");
  }
  const digits = trimmed.split('').map(Number);
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  if (checkDigit !== digits[9]) {
    return failure("NationalCode is not Valid", "کد ملی معتبر نیست");
  }

  return success("NationalCode is valid", "کد ملی معتبر است");
}

/**
 * Validates a short date string (without time component)
 * Supports both Persian (Jalali) and Gregorian calendar formats
 * 
 * Format: YYYY-MM-DD
 * 
 * Persian dates: year between 1000-1999
 * Gregorian dates: year between 1000-2999
 * 
 * @param value - Date string to validate (format: YYYY-MM-DD)
 * @returns ValidationResult indicating success/failure with appropriate message
 * 
 * @example
 * validateShortDate("1403-01-15") // Persian date
 * validateShortDate("2024-03-05") // Gregorian date
 */
export function validateShortDate(
  value: string
): ValidationResult {
  if (!value) {
    return failure("Date is required", "تاریخ اجباری است");
  }
  
  // Trim and normalize separators: convert / to -
  const normalized = value.trim().replace(/\//g, '-');
  
  // Check format: YYYY-MM-DD (no time part)
  const shortDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!shortDateRegex.test(normalized)) {
    return failure("Date is not Valid", "تاریخ معتبر نیست");
  }
  
  try {
    // Parse date parts
    const [year, month, day] = normalized.split('-').map(Number);
    
    // Validate month (1-12)
    if (month < DATE_VALIDATION.MONTH_MIN || month > DATE_VALIDATION.MONTH_MAX) {
      return failure("Date is not Valid", `ماه باید بین ${DATE_VALIDATION.MONTH_MIN} تا ${DATE_VALIDATION.MONTH_MAX} باشد`);
    }
    
    let isValid = false;
    
    // Try as Persian date (year >= 1000 and < 2000) - تاریخ جلالی
    if (year >= DATE_VALIDATION.PERSIAN_YEAR_MIN && year <= DATE_VALIDATION.PERSIAN_YEAR_MAX) {
      try {
        // Check if it's a valid Persian date by validating day based on month
        const isLeapYear = (jy: number): boolean => {
          const cycle = jy % 33;
          return [1, 5, 9, 13, 17, 22, 26, 30].includes(cycle);
        };
        const leap = isLeapYear(year);
        const daysInMonth = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, leap ? 30 : 29];
        const maxDay = daysInMonth[month];
        
        // Validate day based on month
        if (day < DATE_VALIDATION.DAY_MIN || day > maxDay) {
          return failure("Date is not Valid", `روز باید بین ${DATE_VALIDATION.DAY_MIN} تا ${maxDay} باشد`);
        }
        
        // Try to convert to Gregorian to verify it's a valid date
        const converted = perToGre(normalized);
        const convertedDatePart = converted.split(' ')[0];
        if (converted && /^\d{4}-\d{2}-\d{2}$/.test(convertedDatePart)) {
          const [cy, cm, cd] = convertedDatePart.split('-').map(Number);
          if (cy >= DATE_VALIDATION.GREGORIAN_YEAR_MIN && cy < DATE_VALIDATION.GREGORIAN_YEAR_MAX && 
              cm >= DATE_VALIDATION.MONTH_MIN && cm <= DATE_VALIDATION.MONTH_MAX && 
              cd >= DATE_VALIDATION.DAY_MIN && cd <= DATE_VALIDATION.DAY_MAX) {
            isValid = true;
          }
        }
      } catch {
        // Not a valid Persian date
      }
    }
    
    // Try as Gregorian date (year >= 1000 and < 3000)
    if (!isValid && year >= DATE_VALIDATION.GREGORIAN_YEAR_MIN && year < DATE_VALIDATION.GREGORIAN_YEAR_MAX) {
      // Validate day (1-31) for Gregorian
      if (day < DATE_VALIDATION.DAY_MIN || day > DATE_VALIDATION.DAY_MAX) {
        return failure("Date is not Valid", `روز باید بین ${DATE_VALIDATION.DAY_MIN} تا ${DATE_VALIDATION.DAY_MAX} باشد`);
      }
      
      try {
        const converted = greToPer(normalized);
        const convertedDatePart = converted.split(' ')[0];
        if (converted && /^\d{4}-\d{2}-\d{2}$/.test(convertedDatePart)) {
          const [cy, cm, cd] = convertedDatePart.split('-').map(Number);
          if (cy >= DATE_VALIDATION.PERSIAN_YEAR_MIN && cy <= DATE_VALIDATION.PERSIAN_YEAR_MAX && 
              cm >= DATE_VALIDATION.MONTH_MIN && cm <= DATE_VALIDATION.MONTH_MAX && 
              cd >= DATE_VALIDATION.DAY_MIN && cd <= DATE_VALIDATION.DAY_MAX) {
            isValid = true;
          }
        }
      } catch {
        // Not a valid Gregorian date
      }
    }
    
    if (!isValid) {
      return {
        success: false,
        title: "Date is not Valid",
        message: "تاریخ معتبر نیست"
      };
    }
  } catch {
    return {
      success: false,
      title: "Date is not Valid",
      message: "تاریخ معتبر نیست"
    };
  }
  
  return { success: true, title: "Date is valid", message: "تاریخ معتبر است" };
}

/**
 * Validates a date string with time component
 * Supports both Persian (Jalali) and Gregorian calendar formats
 * 
 * Format: YYYY-MM-DD HH:MM:SS[.microseconds]
 * 
 * Persian dates: year between 1000-1999
 * Gregorian dates: year between 1000-2999
 * 
 * @param value - Date string with time to validate (format: YYYY-MM-DD HH:MM:SS[.microseconds])
 * @returns ValidationResult indicating success/failure with appropriate message
 * 
 * @example
 * validateDate("1403-01-15 14:30:00") // Persian date with time
 * validateDate("2024-03-05 14:30:00.123") // Gregorian date with microseconds
 */
export function validateDate(
  value: string
): ValidationResult {
  if (!value) {
    return failure("Date is required", "تاریخ اجباری است");
  }
  
  // Trim and normalize separators: convert / to -
  const normalized = value.trim().replace(/\//g, '-');
  
  // Check format: YYYY-MM-DD HH:MM:SS.microseconds (with time part)
  const dateWithTimeRegex = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(\.\d+)?$/;
  if (!dateWithTimeRegex.test(normalized)) {
    return failure("Date is not Valid", "تاریخ معتبر نیست");
  }
  
  try {
    // Extract date part
    const datePart = normalized.split(/[\sT]/)[0];
    const [year] = datePart.split('-').map(Number);
    
    let isValid = false;
    
    // Try as Gregorian date (year >= 1000 and < 3000)
    if (year >= DATE_VALIDATION.GREGORIAN_YEAR_MIN && year < DATE_VALIDATION.GREGORIAN_YEAR_MAX) {
      try {
        const converted = greToPer(normalized);
        // If conversion succeeds and returns a valid date format with time, it's valid
        if (converted && /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(converted)) {
          const convertedDatePart = converted.split(' ')[0];
          const [cy, cm, cd] = convertedDatePart.split('-').map(Number);
          // Verify it's a valid conversion
          if (cy >= DATE_VALIDATION.PERSIAN_YEAR_MIN && cy <= DATE_VALIDATION.PERSIAN_YEAR_MAX && 
              cm >= DATE_VALIDATION.MONTH_MIN && cm <= DATE_VALIDATION.MONTH_MAX && 
              cd >= DATE_VALIDATION.DAY_MIN && cd <= DATE_VALIDATION.DAY_MAX) {
            isValid = true;
          }
        }
      } catch {
        // Not a valid Gregorian date
      }
    }
    
    // Try as Persian date (year >= 1000 and < 2000)
    if (!isValid && year >= DATE_VALIDATION.PERSIAN_YEAR_MIN && year <= DATE_VALIDATION.PERSIAN_YEAR_MAX) {
      try {
        const converted = perToGre(normalized);
        // If conversion succeeds and returns a valid date format with time, it's valid
        if (converted && /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(converted)) {
          const convertedDatePart = converted.split(' ')[0];
          const [cy, cm, cd] = convertedDatePart.split('-').map(Number);
          // Verify it's a valid conversion
          if (cy >= DATE_VALIDATION.GREGORIAN_YEAR_MIN && cy < DATE_VALIDATION.GREGORIAN_YEAR_MAX && 
              cm >= DATE_VALIDATION.MONTH_MIN && cm <= DATE_VALIDATION.MONTH_MAX && 
              cd >= DATE_VALIDATION.DAY_MIN && cd <= DATE_VALIDATION.DAY_MAX) {
            isValid = true;
          }
        }
      } catch {
        // Not a valid Persian date
      }
    }
    
    if (!isValid) {
      return {
        success: false,
        title: "Date is not Valid",
        message: "تاریخ معتبر نیست"
      };
    }
  } catch {
    return {
      success: false,
      title: "Date is not Valid",
      message: "تاریخ معتبر نیست"
    };
  }
  
  return { success: true, title: "Date is valid", message: "تاریخ معتبر است" };
}