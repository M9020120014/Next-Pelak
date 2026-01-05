// Write operation guard - Two-step verification for database write operations
// Step 1: Verify iDevice has refresh token
// Step 2: Execute write operation

import { NextRequest, NextResponse } from 'next/server'
import { callRpc } from '@/core/lib/rest/rpc'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import { validateDeviceId } from '@/core/lib/validation'
import { invalidInputError, unauthorizedError } from '@/core/lib/api/response'
import { ERROR_MESSAGES } from '@/core/lib/api/error-messages'

/**
 * Verify that iDevice has a valid refresh token
 * This is Step 1 of the two-step verification process
 * 
 * @param idevice - The device identifier to check
 * @returns Object with valid flag and optional error response
 */
export async function verifyIDeviceRefreshToken(
  idevice: string
): Promise<{ valid: boolean; response?: NextResponse }> {
  // Validate idevice format
  const deviceValidation = validateDeviceId(idevice)
  if (!deviceValidation.success) {
    return {
      valid: false,
      response: invalidInputError(deviceValidation.message || 'شناسه دستگاه نامعتبر است.'),
    }
  }

  // Check if idevice has refresh token in database
  const result = await callRpc('pelak_auth_checkrefreshtoken', {
    p_idevice: idevice,
  })

  // Check if the result indicates a valid token
  const isValid = result.success && (result as Record<string, unknown>).valid === true

  if (!isValid) {
    return {
      valid: false,
      response: unauthorizedError(
        ERROR_MESSAGES.IDEVICE_REFRESH_TOKEN_REQUIRED.message
      ),
    }
  }

  return {
    valid: true,
  }
}

/**
 * Extract iDevice from request body or cookie
 * Note: This function expects the body to be already parsed or will use cookie as fallback
 * 
 * @param body - Optional parsed request body object
 * @returns iDevice string or null if not found
 */
export async function extractIDevice(
  body?: Record<string, unknown>
): Promise<string | null> {
  // Try to get from request body first if provided
  if (body && typeof body === 'object' && 'iDevice' in body) {
    const idevice = body.iDevice
    if (typeof idevice === 'string' && idevice.length > 0) {
      return idevice
    }
  }

  // Fallback to cookie
  const idevice = await getIDeviceToken()
  if (idevice && idevice !== 'unknown') {
    return idevice
  }

  return null
}

/**
 * Guard write operations with two-step verification
 * Step 1: Verify iDevice has refresh token
 * Step 2: Execute the write operation
 * 
 * @param body - Parsed request body (optional, for extracting iDevice)
 * @param operation - The write operation to execute after verification
 * @returns Response from operation or error response
 * 
 * @example
 * ```ts
 * async function POSTHandler(request: NextRequest) {
 *   const body = await request.json()
 *   return guardWriteOperation(body, async () => {
 *     // Your write operation here
 *     const result = await callRpc("pelak_comment_create", {...})
 *     return successResponse({...})
 *   })
 * }
 * ```
 */
export async function guardWriteOperation(
  body: Record<string, unknown> | undefined,
  operation: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Step 1: Extract and verify iDevice refresh token
  const idevice = await extractIDevice(body)

  if (!idevice) {
    return invalidInputError('شناسه دستگاه الزامی است.')
  }

  const verification = await verifyIDeviceRefreshToken(idevice)
  if (!verification.valid) {
    return verification.response!
  }

  // Step 2: Execute write operation
  return operation()
}

