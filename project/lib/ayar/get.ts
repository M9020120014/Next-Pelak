// lib/rest/rpc.ts
import { ENV } from '@/core/config/env'
import { REQUEST } from '@/core/config/security'
import { ERROR_MESSAGES } from '@/core/lib/api/error-messages'

const AYAR_API_BASE_URL = ENV.AYAR_API_BASE_URL
const AYAR_COMPANY_TOKEN = ENV.AYAR_COMPANY_TOKEN
const REQUEST_TIMEOUT = REQUEST.TIMEOUT_MS

/**
 * AYAR parameter types - can be string, number, or boolean
 */
export type AyarParamValue = string | number | boolean | object

/**
 * AYAR response type - base params plus additional fields
 */
export type AyarResponseType = Record<string, AyarParamValue>

/**
 * Call a PostgREST AYAR function
 * 
 * @param functionName - Name of the AYAR function to call
 * @param params - Parameters to pass to the AYAR function
 * @returns Promise resolving to AYAR response
 */
export async function getAyar(functionName: string): Promise<AyarResponseType> {
  try {

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(`${AYAR_API_BASE_URL}/api/${functionName}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-Client-Token': AYAR_COMPANY_TOKEN
        },
        cache: 'no-store',
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