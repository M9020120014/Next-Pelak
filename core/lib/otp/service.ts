// OTP service integration

import { ENV } from '@/core/config/env-merge'
import { REQUEST } from '@/core/config/security'
import { validateURL } from '@/core/lib/security/ssrf-protection'

const OTP_SERVICE_URL = ENV.OTP_SERVER_URL
const OTP_API_KEY = ENV.OTP_API_KEY
const REQUEST_TIMEOUT = REQUEST.TIMEOUT_MS

export type OTPResponse = {
  success: boolean
  title?: string
  message?: string
}

/**
 * Send OTP code to mobile number
 */
export async function sendOTP(mobile: string): Promise<OTPResponse> {
  try {
    // SSRF protection: validate OTP service URL
    if (OTP_SERVICE_URL) {
      const urlValidation = validateURL(OTP_SERVICE_URL)
      if (!urlValidation.valid) {
        return {
          success: false,
          title: 'Configuration Error',
          message: 'OTP service URL is not configured correctly',
        }
      }
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(`${OTP_SERVICE_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': OTP_API_KEY,
        },
        body: JSON.stringify({
          api_key: OTP_API_KEY,
          mobile,
        }),
        cache: 'no-store',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: false,
        title: 'Error sending verification code',
        message: 'خطا در ارسال کد تایید',
      }
    }

    const data = await response.json()
    
    if (!data.success) {
      return {
        success: false,
        title: data.title || 'Error reading information',
        message: data.message || 'خطا در خواندن اطلاعات',
      }
    }

      return {
        success: true,
        title: data.title || 'OTP sent',
        message: data.message || 'کد تایید ارسال شد',
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          title: 'Request Timeout',
          message: 'زمان درخواست به پایان رسید',
        }
      }
      
      throw error
    }
  } catch (error) {
    // Handle timeout or other errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        title: 'Request Timeout',
        message: 'زمان درخواست به پایان رسید',
      }
    }
    
    return {
      success: false,
      title: 'OTP send service failed',
      message: 'خطا در ارتباط با سرور',
    }
  }
}

/**
 * Verify OTP code for mobile number
 */
export async function verifyOTP(mobile: string, code: string): Promise<OTPResponse> {
  try {
    // SSRF protection: validate OTP service URL
    if (OTP_SERVICE_URL) {
      const urlValidation = validateURL(OTP_SERVICE_URL)
      if (!urlValidation.valid) {
        return {
          success: false,
          title: 'Configuration Error',
          message: 'OTP service URL is not configured correctly',
        }
      }
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(`${OTP_SERVICE_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': OTP_API_KEY,
        },
        body: JSON.stringify({
          api_key: OTP_API_KEY,
          code,
          mobile,
        }),
        cache: 'no-store',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: false,
        title: 'Error verifying OTP code',
        message: 'خطا در تایید کد تایید',
      }
    }

    const data = await response.json()
    
    if (!data.success) {
      return {
        success: false,
        title: data.title || 'Error reading information',
        message: data.message || 'خطا در تایید کد تایید',
      }
    }

      return {
        success: true,
        title: data.title || 'Verification successful',
        message: data.message || 'تایید با موفقیت انجام شد',
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          title: 'Request Timeout',
          message: 'زمان درخواست به پایان رسید',
        }
      }
      
      throw error
    }
  } catch (error) {
    // Handle timeout or other errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        title: 'Request Timeout',
        message: 'زمان درخواست به پایان رسید',
      }
    }
    
    return {
      success: false,
      title: 'OTP service failed',
      message: 'خطا در ارتباط با سرور',
    }
  }
}

