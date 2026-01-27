// lib/rest/rpc.ts
import { ENV } from '@/core/config/env'
import { REQUEST } from '@/core/config/security'
import { getCacheOptions } from '@/core/lib/api/cache'
import { ERROR_MESSAGES } from '@/core/lib/api/error-messages'

const POSTGREST_URL = ENV.POSTGREST_URL
const POSTGREST_SECRET = ENV.POSTGREST_SECRET
const REQUEST_TIMEOUT = REQUEST.TIMEOUT_MS

/**
 * Base AYAR response parameters
 */
type AyarParams = {
  success: boolean;
  title: string;
  message: string;
}

/**
 * AYAR parameter types - can be string, number, or boolean
 */
export type AyarParamValue = string | number | boolean

/**
 * AYAR parameters object
 */
export type AyarParamsObject = Record<string, AyarParamValue>

/**
 * AYAR response type - base params plus additional fields
 */
export type AyarResponseType = AyarParams & Record<string, AyarParamValue>

/**
 * Type guard to check if value is a valid AYAR parameter
 */
export function isAyarParamValue(value: unknown): value is AyarParamValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

/**
 * Call a PostgREST AYAR function
 * 
 * @param functionName - Name of the AYAR function to call
 * @param params - Parameters to pass to the AYAR function
 * @returns Promise resolving to AYAR response
 */
export async function postAyar(functionName: string, params: AyarParamsObject = {}): Promise<AyarResponseType> {
  try {

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      console.log(`${POSTGREST_URL}/rpc/${functionName}`)
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

      // Read response body once
      let responseData: unknown
      try {
        responseData = await response.json()
      } catch {
        // If we can't parse the response, return parse error
        return {
          success: false,
          title: ERROR_MESSAGES.PARSE_ERROR.title,
          message: ERROR_MESSAGES.PARSE_ERROR.message,
        } as AyarResponseType
      }

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage: string = ERROR_MESSAGES.SERVER_CONNECTION_ERROR.message
        if (responseData && typeof responseData === 'object') {
          const errorData = responseData as Record<string, unknown>
          if (typeof errorData.message === 'string') {
            errorMessage = errorData.message
          } else if (typeof errorData.error === 'string') {
            errorMessage = errorData.error
          } else if (typeof errorData.hint === 'string') {
            errorMessage = errorData.hint
          }
        }
        
        return { 
          success: false, 
          title: ERROR_MESSAGES.SERVER_CONNECTION_ERROR.title, 
          message: errorMessage
        } as AyarResponseType;
      }

      try {
        const data = responseData as AyarResponseType;

        if (!data.success) {
          return {
            success: false,
            title: data.title,
            message: data.message,
          } as AyarResponseType;
        }

        return data as AyarResponseType;

      } catch {
        return {
          success: false,
          title: ERROR_MESSAGES.PARSE_ERROR.title,
          message: ERROR_MESSAGES.PARSE_ERROR.message,
        } as AyarResponseType;
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Check if it's a timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          title: ERROR_MESSAGES.REQUEST_TIMEOUT.title,
          message: ERROR_MESSAGES.REQUEST_TIMEOUT.message,
        } as AyarResponseType;
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
      } as AyarResponseType;
    }
    
    return { 
      success: false, 
      title: ERROR_MESSAGES.ERROR_OCCURRED.title, 
      message: ERROR_MESSAGES.ERROR_OCCURRED.message 
    } as AyarResponseType;
  }
}