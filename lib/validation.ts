import { greToPer, perToGre } from "@/lib/date";

/* --- Types ------------------------------------------------------------------------------------ */
export type ValidationResult = {
  success: boolean;
  title: string;
  message: string;
};

/* --- Validates mobile number ------------------------------------------------------------------ */
export function validateMobile(
  mobile: string ,
  strict: boolean = false
): ValidationResult {
  if (!mobile) {
    return {
      success: false,
      title: "Mobile is required",
      message: "شماره موبایل اجباری است"
    };
  }
  const trimmed = mobile.trim();
  if (!strict) {
    /* --- Validate Iranian only ---- */
    const iranianMobileRegex = /^09\d{9}$/;
    if (!iranianMobileRegex.test(trimmed)) {
      return {
        success: false,
        title: "Mobile must be 11 digits and start with 09",
        message: "شماره موبایل باید 11 رقم و با 09 شروع شود"
      };
    }
  } else {
    /* --- Validate digits only ----- */
    const digitsOnly = /^\d+$/;
    if (!digitsOnly.test(trimmed) || trimmed.length < 10 || trimmed.length > 15) {
      return {
        success: false,
        title: "Mobile must be between 10 and 15 digits",
        message: "شماره موبایل باید بین 10 و 15 رقم باشد"
      };
    }
  }

  return { success: true, title: "Mobile is valid", message: "شماره موبایل معتبر است" };
}
/* --- Validates password ----------------------------------------------------------------------- */
export function validatePassword(
  password: string ,
  minLength: number = 8,
  maxLength: number = 50
): ValidationResult {
  if (!password) {
    return {
      success: false,
      title: "Password is required",
      message: "رمز عبور اجباری است"
    };
  }
  /* --- Validate minimum length --- */
  if (password.length < minLength) {
    return {
      success: false,
      title: `Password must be at least ${minLength} characters long`,
      message: `رمز عبور باید حداقل ${minLength} رقم باشد`
    };
  }
  if (password.length > maxLength) {
    return {
      success: false,
      title: `Password must be less than ${maxLength} characters long`,
      message: `رمز عبور باید حداکثر ${maxLength} رقم باشد`
    };
  }

  return { success: true, title: "Password is valid", message: "رمز عبور معتبر است" };
}
/* --- Validates otp code ----------------------------------------------------------------------- */
export function validateOtpCode(
  otpCode: string ,
  length: number = 4,
): ValidationResult {
  if (!otpCode) {
    return {
      success: false,
      title: "OTP code is required",
      message: "کد تأیید اجباری است"
    };
  }
  if (otpCode.length !== length) {
    return {
      success: false,
      title: `OTP code must be ${length} characters long`,
      message: `کد تأید باید ${length} رقم باشد`
    };
  }

  return { success: true, title: "OTP code is valid", message: "کد تأید معتبر است" };
}
/* --- Validates device id --------------------------------------------------------------------- */
export function validateDeviceId(
  deviceId: string 
): ValidationResult {
  if (!deviceId) {
    return {
      success: false,
      title: "Device ID is required",
      message: "Device ID اجباری است"
    };
  }

  return { success: true, title: "Device ID is valid", message: "آی دی دستگاه معتبر است" };
}

/* --- Validates nationalCode ----------------------------------------------------------------------- */
export function validateNationalCode(
  value: string
): ValidationResult {
  
  if (!value) {
    return {
      success: false,
      title: "NationalCode is required",
      message: "کد ملی اجباری است"
    };
  }
  const trimmed = value.trim();
  const nationalCodeRegex = /^[0-9]{10}$/;
  if (!nationalCodeRegex.test(trimmed)) {
    return {
      success: false,
      title: "NationalCode is not Valid",
      message: "کد ملی معتبر نیست"
    };
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
    return {
      success: false,
      title: "NationalCode is not Valid",
      message: "کد ملی معتبر نیست"
    };
  }

  return { success: true, title: "NationalCode is valid", message: "کد ملی معتبر است" };
}

/* --- Validates shortDate (without time) ------------------------------------------------- */
export function validateShortDate(
  value: string
): ValidationResult {
  if (!value) {
    return {
      success: false,
      title: "Date is required",
      message: "تاریخ اجباری است"
    };
  }
  
  // Trim and normalize separators: convert / to -
  const normalized = value.trim().replace(/\//g, '-');
  
  // Check format: YYYY-MM-DD (no time part)
  const shortDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!shortDateRegex.test(normalized)) {
    return {
      success: false,
      title: "Date is not Valid",
      message: "تاریخ معتبر نیست"
    };
  }
  
  try {
    // Parse date parts
    const [year, month, day] = normalized.split('-').map(Number);
    
    // Validate month (1-12)
    if (month < 1 || month > 12) {
      return {
        success: false,
        title: "Date is not Valid",
        message: "ماه باید بین 1 تا 12 باشد"
      };
    }
    
    let isValid = false;
    
    // Try as Persian date (year >= 1000 and < 2000) - تاریخ جلالی
    if (year >= 1000 && year < 2000) {
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
        if (day < 1 || day > maxDay) {
          return {
            success: false,
            title: "Date is not Valid",
            message: `روز باید بین 1 تا ${maxDay} باشد`
          };
        }
        
        // Try to convert to Gregorian to verify it's a valid date
        const converted = perToGre(normalized);
        const convertedDatePart = converted.split(' ')[0];
        if (converted && /^\d{4}-\d{2}-\d{2}$/.test(convertedDatePart)) {
          const [cy, cm, cd] = convertedDatePart.split('-').map(Number);
          if (cy >= 1000 && cy < 3000 && cm >= 1 && cm <= 12 && cd >= 1 && cd <= 31) {
            isValid = true;
          }
        }
      } catch {
        // Not a valid Persian date
      }
    }
    
    // Try as Gregorian date (year >= 1000 and < 3000)
    if (!isValid && year >= 1000 && year < 3000) {
      // Validate day (1-31) for Gregorian
      if (day < 1 || day > 31) {
        return {
          success: false,
          title: "Date is not Valid",
          message: "روز باید بین 1 تا 31 باشد"
        };
      }
      
      try {
        const converted = greToPer(normalized);
        const convertedDatePart = converted.split(' ')[0];
        if (converted && /^\d{4}-\d{2}-\d{2}$/.test(convertedDatePart)) {
          const [cy, cm, cd] = convertedDatePart.split('-').map(Number);
          if (cy >= 1000 && cy < 2000 && cm >= 1 && cm <= 12 && cd >= 1 && cd <= 31) {
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

/* --- Validates date (with time) --------------------------------------------------------- */
export function validateDate(
  value: string
): ValidationResult {
  if (!value) {
    return {
      success: false,
      title: "Date is required",
      message: "تاریخ اجباری است"
    };
  }
  
  // Trim and normalize separators: convert / to -
  const normalized = value.trim().replace(/\//g, '-');
  
  // Check format: YYYY-MM-DD HH:MM:SS.microseconds (with time part)
  const dateWithTimeRegex = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(\.\d+)?$/;
  if (!dateWithTimeRegex.test(normalized)) {
    return {
      success: false,
      title: "Date is not Valid",
      message: "تاریخ معتبر نیست"
    };
  }
  
  try {
    // Extract date part
    const datePart = normalized.split(/[\sT]/)[0];
    const [year] = datePart.split('-').map(Number);
    
    let isValid = false;
    
    // Try as Gregorian date (year >= 1000 and < 3000)
    if (year >= 1000 && year < 3000) {
      try {
        const converted = greToPer(normalized);
        // If conversion succeeds and returns a valid date format with time, it's valid
        if (converted && /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(converted)) {
          const convertedDatePart = converted.split(' ')[0];
          const [cy, cm, cd] = convertedDatePart.split('-').map(Number);
          // Verify it's a valid conversion
          if (cy >= 1000 && cy < 2000 && cm >= 1 && cm <= 12 && cd >= 1 && cd <= 31) {
            isValid = true;
          }
        }
      } catch {
        // Not a valid Gregorian date
      }
    }
    
    // Try as Persian date (year >= 1000 and < 2000)
    if (!isValid && year >= 1000 && year < 2000) {
      try {
        const converted = perToGre(normalized);
        // If conversion succeeds and returns a valid date format with time, it's valid
        if (converted && /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(converted)) {
          const convertedDatePart = converted.split(' ')[0];
          const [cy, cm, cd] = convertedDatePart.split('-').map(Number);
          // Verify it's a valid conversion
          if (cy >= 1000 && cy < 3000 && cm >= 1 && cm <= 12 && cd >= 1 && cd <= 31) {
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