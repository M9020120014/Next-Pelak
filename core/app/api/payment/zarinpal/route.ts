/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { successResponse, invalidInputError, serverError } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"
import { ENV } from "@/core/config/env"
import { logError } from "@/core/lib/log/logger-utils"

/* --- Functions -------------------------------------------------------------------------------- */
/* --- POST Payment Request --------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
  // Security validation
  const securityCheck = await validateAPIRequest(request, true, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  })
  if (!securityCheck.valid) {
    return securityCheck.response!
  }

  const body = await request.json()
  const { amount, description, idevice, mobile } = body
  // Validate amount
  if (!amount || typeof amount !== 'number' || amount < 1000) {
    return invalidInputError('مبلغ نامعتبر است. حداقل مبلغ ۱۰۰۰ تومان است.')
  }

  // Validate merchant ID configuration
  if (!ENV.ZARINPAL_MERCHANT_ID) {
    logError(
      'Zarinpal merchant ID not configured',
      new Error('ZARINPAL_MERCHANT_ID is not set in environment variables'),
      '/api/payment/zarinpal'
    )
    return serverError('پیکربندی درگاه پرداخت ناقص است.')
  }

  // Validate API URL
  if (!ENV.ZARINPAL_API_URL) {
    logError(
      'Zarinpal API URL not configured',
      new Error('ZARINPAL_API_URL is not set in environment variables'),
      '/api/payment/zarinpal'
    )
    return serverError('پیکربندی درگاه پرداخت ناقص است.')
  }

  // Validate callback URL
  if (!ENV.ZARINPAL_CALLBACK_URL) {
    logError(
      'Zarinpal callback URL not configured',
      new Error('ZARINPAL_CALLBACK_URL is not set in environment variables'),
      '/api/payment/zarinpal'
    )
    return serverError('پیکربندی درگاه پرداخت ناقص است.')
  }

  try {
    // Call Zarinpal API
    const response = await fetch(ENV.ZARINPAL_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: ENV.ZARINPAL_MERCHANT_ID,
        amount: amount,
        currency: 'IRT',
        callback_url: ENV.ZARINPAL_CALLBACK_URL,
        description: description || 'Transaction description.',
        metadata: {
          mobile: mobile || '09123456789',
          order_id: typeof idevice === 'string' ? idevice.slice(0, 40) : 'unknown',
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logError(
        'Zarinpal API error',
        new Error(`Zarinpal API returned ${response.status}: ${errorText}`),
        '/api/payment/zarinpal'
      )
      return serverError('خطا در ارتباط با درگاه پرداخت.')
    }

    const result = await response.json()

    // Add rate limit headers if available
    const rateLimitHeaders = securityCheck.rateLimitHeaders

    return successResponse(
      {
        ...result,
      },
      undefined,
      200,
      rateLimitHeaders
    )
  } catch (error) {
    logError(
      'Error processing payment request',
      error instanceof Error ? error : new Error(String(error)),
      '/api/payment/zarinpal'
    )
    return serverError('خطا در پردازش درخواست پرداخت.')
  }
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/payment/zarinpal')

