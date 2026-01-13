/* --- Logger Utilities ---------------------------------------------------------------------------- */
/* Safe logging utilities that use console in development and logger service in production */

/* --- Base ------------------------------------------------------------------------------------- */
import { IS_DEVELOPMENT } from '@/core/config/base'
import { SubmitLogServer } from './logger'

/**
 * Safe log function that uses console in development and logger service in production
 * @param level - Log level ('log', 'error', 'warn', 'info')
 * @param message - Log message
 * @param details - Optional details object
 * @param location - Optional location/file name
 */
export function safeLog(
  level: 'log' | 'error' | 'warn' | 'info',
  message: string,
  details?: Record<string, unknown>,
  location?: string
): void {
  if (IS_DEVELOPMENT) {
    // In development, use console for immediate feedback
    const logMethod = console[level] || console.log
    if (details) {
      logMethod(`[${location || 'App'}] ${message}`, details)
    } else {
      logMethod(`[${location || 'App'}] ${message}`)
    }
  } else {
    // In production, use logger service (non-blocking)
    // Convert level to log type
    const logType = level === 'error' ? 'error' : level === 'warn' ? 'warning' : 'info'
    
    // Use SubmitLogServer for production logging
    // This is non-blocking and handles errors gracefully
    void SubmitLogServer(
      logType,
      location || 'unknown',
      message,
      details ? (details as Record<string, string>) : {}
    )
  }
}

/**
 * Log info message
 */
export function logInfo(message: string, details?: Record<string, unknown>, location?: string): void {
  safeLog('log', message, details, location)
}

/**
 * Log error message
 * @param message - Error message
 * @param error - Error object or details object
 * @param location - Optional location/file name
 * @param additionalDetails - Optional additional details to include
 */
export function logError(
  message: string, 
  error?: unknown, 
  location?: string,
  additionalDetails?: Record<string, unknown>
): void {
  const details: Record<string, unknown> = {}
  
  if (error instanceof Error) {
    details.error = error.message
    details.stack = error.stack
  } else if (error && typeof error === 'object') {
    // If error is an object (but not Error), merge it as details
    Object.assign(details, error)
  } else if (error) {
    details.error = String(error)
  }
  
  // Merge additional details if provided
  if (additionalDetails) {
    Object.assign(details, additionalDetails)
  }
  
  safeLog('error', message, details, location)
}

/**
 * Log warning message
 */
export function logWarn(message: string, details?: Record<string, unknown>, location?: string): void {
  safeLog('warn', message, details, location)
}

