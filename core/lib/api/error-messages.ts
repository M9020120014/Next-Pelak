// Standard error messages for API responses
// Centralized error messages for consistency and easier maintenance

export const ERROR_MESSAGES = {
  // Server errors
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'خطای داخلی سرور.',
  },
  
  // Validation errors
  INVALID_INPUT: {
    title: 'Invalid Input',
    message: 'تمام فیلدها الزامی است.',
  },
  
  // Authentication errors
  UNAUTHORIZED: {
    title: 'Unauthorized',
    message: 'احراز هویت نامعتبر است.',
  },
  
  // Account locked
  ACCOUNT_LOCKED: {
    title: 'Account Locked',
    message: 'حساب کاربری به دلیل تلاش‌های ناموفق متعدد موقتاً قفل شده است.',
  },
  
  // Login success
  LOGIN_SUCCESS: {
    title: 'Login Successful',
    message: 'ورود با موفقیت انجام شد.',
  },
  
  // Token errors
  INVALID_TOKEN_FORMAT: {
    title: 'Invalid Token Format',
    message: 'فرمت توکن نامعتبر است',
  },
  
  TOKEN_REFRESHED: {
    title: 'Token Refreshed',
    message: 'توکن با موفقیت تمدید شد.',
  },
  
  // OTP errors
  OTP_SEND_ERROR: {
    title: 'Error',
    message: 'خطا در ارسال کد تایید',
  },
  
  OTP_SENT: {
    title: 'OTP sent',
    message: 'کد تایید ارسال شد',
  },
  
  OTP_VERIFY_ERROR: {
    title: 'Error',
    message: 'خطا در تایید کد تایید',
  },
  
  OTP_VERIFY_SUCCESS: {
    title: 'Verification successful',
    message: 'تایید با موفقیت انجام شد',
  },
  
  // Registration errors
  USER_REGISTERED: {
    title: 'User Registered',
    message: 'کاربر با موفقیت ثبت شد',
  },
  
  // Password errors
  PASSWORD_SET_SUCCESS: {
    title: 'Password Set and Login Successful',
    message: 'رمز عبور تنظیم شد و ورود با موفقیت انجام شد.',
  },
  
  // Logger errors
  ERROR_LOGGED: {
    title: 'Error logged successfully',
    message: 'خطا با موفقیت ثبت شد',
  },
  
  LOGGER_ERROR: {
    title: 'Error',
    message: 'خطا در ثبت خطا',
  },
  
  // Request errors
  REQUEST_TOO_LARGE: {
    title: 'Request Too Large',
    message: 'درخواست بسیار بزرگ است',
  },
  
  ACCESS_DENIED: {
    title: 'Access Denied',
    message: 'دسترسی به این درخواست مجاز نیست',
  },
  
  TOO_MANY_REQUESTS: {
    title: 'Too Many Requests',
    message: 'درخواست‌های زیادی ارسال شده است',
  },
  
  CSRF_VALIDATION_FAILED: {
    title: 'CSRF Validation Failed',
    message: 'درخواست نامعتبر است',
  },
  
  // Configuration errors
  CONFIG_ERROR: {
    title: 'Configuration Error',
    message: 'پیکربندی سرور نامعتبر است.',
  },
  
  // Network errors
  SERVER_CONNECTION_ERROR: {
    title: 'Server Error',
    message: 'خطای ارتباط با سرور.',
  },
  
  REQUEST_TIMEOUT: {
    title: 'Request Timeout',
    message: 'زمان درخواست به پایان رسید.',
  },
  
  PARSE_ERROR: {
    title: 'Parse Error',
    message: 'پاسخ سرور نامعتبر است.',
  },
  
  // Generic errors
  UNKNOWN_ERROR: {
    title: 'Error',
    message: 'خطایی رخ داده است.',
  },
  
  ERROR_OCCURRED: {
    title: 'Error',
    message: 'خطا در سرور.',
  },
} as const

