// lib/rest/rpc.ts
import { ENV } from '@/core/config/env'
import { REQUEST } from '@/core/config/security'
import { validateURL } from '@/core/lib/security/ssrf-protection'
import { getCacheOptions } from '@/core/lib/api/cache'
import { ERROR_MESSAGES } from '@/core/lib/api/error-messages'

const POSTGREST_URL = ENV.POSTGREST_URL
const POSTGREST_SECRET = ENV.POSTGREST_SECRET
const REQUEST_TIMEOUT = REQUEST.TIMEOUT_MS

/**
 * Base RPC response parameters
 */
type RpcParams = {
  success: boolean;
  title: string;
  message: string;
}

/**
 * RPC parameter types - can be string, number, or boolean
 */
export type RpcParamValue = string | number | boolean

/**
 * RPC parameters object
 */
export type RpcParamsObject = Record<string, RpcParamValue>

/**
 * RPC response type - base params plus additional fields
 */
export type RpcResponseType = RpcParams & Record<string, RpcParamValue>

/**
 * Type guard to check if value is a valid RPC parameter
 */
export function isRpcParamValue(value: unknown): value is RpcParamValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

/**
 * Type guard to check if object is valid RPC params
 */
export function isRpcParamsObject(obj: unknown): obj is RpcParamsObject {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }
  return Object.values(obj).every(isRpcParamValue)
}

/**
 * Type guard to check if RPC response contains user data
 * Handles null/undefined values for optional fields
 */
export function isUserRpcResponse(response: RpcResponseType): response is RpcResponseType & {
  user_id: number
  mobile: string
  firstname: string | null | undefined
  lastname: string | null | undefined
  refresh_token?: string
} {
  return (
    response.success === true &&
    typeof response.user_id === 'number' &&
    typeof response.mobile === 'string' &&
    (response.firstname === null || response.firstname === undefined || typeof response.firstname === 'string') &&
    (response.lastname === null || response.lastname === undefined || typeof response.lastname === 'string')
  )
}

/**
 * Type guard to check if RPC response contains refresh token
 */
export function hasRefreshToken(response: RpcResponseType): response is RpcResponseType & {
  refresh_token: string
} {
  return typeof response.refresh_token === 'string' && response.refresh_token.length > 0
}

/**
 * Safely extract user data from RPC response
 * Uses type guards to ensure type safety without type assertions
 * 
 * @param response - RPC response from backend
 * @returns User data object with id, mobile, firstname, lastname, or null if invalid
 * 
 * @example
 * ```ts
 * const result = await callRpc("auth_login", { p_mobile: "09123456789", p_password: "..." })
 * const userData = extractUserData(result)
 * if (userData) {
 *   // Type-safe access to userData.id, userData.mobile, etc.
 * }
 * ```
 */
export function extractUserData(response: RpcResponseType): {
  id: number
  mobile: string
  firstname: string | null
  lastname: string | null
} | null {
  if (!response.success) {
    return null
  }
  
  if (
    typeof response.user_id === 'number' &&
    typeof response.mobile === 'string'
  ) {
    return {
      id: response.user_id,
      mobile: response.mobile,
      firstname: (typeof response.firstname === 'string' ? response.firstname : null),
      lastname: (typeof response.lastname === 'string' ? response.lastname : null),
    }
  }
  
  return null
}

/**
 * Call a PostgREST RPC function
 * 
 * @param functionName - Name of the RPC function to call
 * @param params - Parameters to pass to the RPC function
 * @returns Promise resolving to RPC response
 */
export async function callRpc(functionName: string, params: RpcParamsObject = {}): Promise<RpcResponseType> {
  try {
    // SSRF protection: validate PostgREST URL
    if (POSTGREST_URL) {
      const urlValidation = validateURL(POSTGREST_URL)
      if (!urlValidation.valid) {
        return {
          success: false,
          title: ERROR_MESSAGES.CONFIG_ERROR.title,
          message: ERROR_MESSAGES.CONFIG_ERROR.message,
        } as RpcResponseType
      }
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(`${POSTGREST_URL}/rpc/${functionName}`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + POSTGREST_SECRET
        },
        body: JSON.stringify(params),
        cache: getCacheOptions(functionName), // Use cache strategy based on function name
        signal: controller.signal,
      });

      clearTimeout(timeoutId)

      if (!response.ok) {
        return { 
          success: false, 
          title: ERROR_MESSAGES.SERVER_CONNECTION_ERROR.title, 
          message: ERROR_MESSAGES.SERVER_CONNECTION_ERROR.message 
        } as RpcResponseType;
      }

      try {
        const data = await response.json();

        if (!data.success) {
          return {
            success: false,
            title: data.title,
            message: data.message,
          } as RpcResponseType;
        }

        return data as RpcResponseType;

      } catch {
        return {
          success: false,
          title: ERROR_MESSAGES.PARSE_ERROR.title,
          message: ERROR_MESSAGES.PARSE_ERROR.message,
        } as RpcResponseType;
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          title: ERROR_MESSAGES.REQUEST_TIMEOUT.title,
          message: ERROR_MESSAGES.REQUEST_TIMEOUT.message,
        } as RpcResponseType;
      }
      
      throw error
    }

  } catch (error) {
    // Handle timeout or other errors
    if (error instanceof Error && error.name === 'AbortError') {
      return { 
        success: false, 
        title: ERROR_MESSAGES.REQUEST_TIMEOUT.title, 
        message: ERROR_MESSAGES.REQUEST_TIMEOUT.message 
      } as RpcResponseType;
    }
    
    return { 
      success: false, 
      title: ERROR_MESSAGES.ERROR_OCCURRED.title, 
      message: ERROR_MESSAGES.ERROR_OCCURRED.message 
    } as RpcResponseType;
  }
}