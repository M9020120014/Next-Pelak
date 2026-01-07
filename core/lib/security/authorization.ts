// Authorization utilities for role-based access control (RBAC)

import { NextRequest } from 'next/server'
import { verifyAccessToken, generateAccessToken } from '@/core/lib/token/jwt'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import { getRefreshTokenCookie, validateRefreshTokenFormat } from '@/core/lib/token/auth-cookie'
import { callRpc, extractUserData, hasRefreshToken } from '@/core/lib/rest/rpc'
import { getClientIP } from '@/core/lib/security/utils'
import { validateDeviceId } from '@/core/lib/validation'

export type UserRole = 'user' | 'admin' | 'moderator'

export type AuthorizationResult = {
  allowed: boolean
  reason?: string
}

export type AuthorizationWithRefreshResult = {
  allowed: boolean
  reason?: string
  newAccessToken?: string
  newRefreshToken?: string
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string | undefined, requiredRole: UserRole): boolean {
  if (!userRole) {
    return false
  }

  // Role hierarchy: admin > moderator > user
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    moderator: 2,
    admin: 3,
  }

  const userRoleLevel = roleHierarchy[userRole as UserRole] || 0
  const requiredRoleLevel = roleHierarchy[requiredRole]

  return userRoleLevel >= requiredRoleLevel
}

/**
 * Check if user is authenticated and has required role
 */
export function checkAuthorization(
  accessToken: string | null,
  requiredRole: UserRole = 'user'
): AuthorizationResult {
  if (!accessToken) {
    return {
      allowed: false,
      reason: 'Access token is required',
    }
  }

  const payload = verifyAccessToken(accessToken)
  
  if (!payload) {
    return {
      allowed: false,
      reason: 'Invalid or expired access token',
    }
  }

  const userRole = payload.role as UserRole
  
  if (!hasRole(userRole, requiredRole)) {
    return {
      allowed: false,
      reason: `Insufficient permissions. Required role: ${requiredRole}`,
    }
  }

  return {
    allowed: true,
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(accessToken: string | null): boolean {
  const result = checkAuthorization(accessToken, 'admin')
  return result.allowed
}

/**
 * Check if user is moderator or admin
 */
export function isModeratorOrAdmin(accessToken: string | null): boolean {
  const result = checkAuthorization(accessToken, 'moderator')
  return result.allowed
}

/**
 * Helper function to refresh access token if expired and refresh token exists
 * @param request - The incoming request
 * @param iDevice - Device identifier
 * @returns Object with new access token and optional new refresh token, or null if refresh failed
 */
async function refreshAccessTokenIfNeeded(
  request: NextRequest,
  iDevice: string
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  // Get refresh token from cookie
  const refreshToken = await getRefreshTokenCookie()
  
  if (!refreshToken || !validateRefreshTokenFormat(refreshToken)) {
    return null
  }

  // Validate device ID
  const deviceValidation = validateDeviceId(iDevice)
  if (!deviceValidation.success) {
    return null
  }

  // Extract client IP for tracking
  const clientIP = getClientIP(request)

  try {
    // Call refresh token RPC function
    const result = await callRpc("pelak_auth_refreshtoken", {
      p_refreshtoken: refreshToken,
      p_idevice: iDevice,
      p_ip: clientIP,
    })

    if (!result.success) {
      return null
    }

    const userData = extractUserData(result)
    if (!userData) {
      return null
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: userData.id,
      mobile: userData.mobile,
      firstname: userData.firstname ?? null,
      lastname: userData.lastname ?? null,
      email: userData.email ?? null,
      profileimage: userData.profileimage ? String(userData.profileimage) : null,
      profileurl: userData.profileurl ?? null,
    })

    // Check if refresh token was rotated (new refresh token returned)
    const newRefreshToken = hasRefreshToken(result) ? result.refreshtoken : undefined

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }
  } catch {
    return null
  }
}

/**
 * Check authorization with refresh token validation in database
 * This function:
 * 1. Validates access token
 * 2. Checks if refresh token exists in database for the iDevice
 * 3. If access token expired and refresh token exists, auto-refreshes access token
 * 4. Returns authorization result with optional new access token
 * 
 * @param request - The incoming request
 * @param accessToken - Access token from Authorization header
 * @param requiredRole - Required role for access (default: 'user')
 * @returns Authorization result with optional new access token
 */
export async function checkAuthorizationWithRefresh(
  request: NextRequest,
  accessToken: string | null,
  requiredRole: UserRole = 'user'
): Promise<AuthorizationWithRefreshResult> {
  // Get iDevice from cookie
  const iDevice = await getIDeviceToken()
  
  if (!iDevice || iDevice === 'unknown') {
    return {
      allowed: false,
      reason: 'Device identifier not found',
    }
  }

  // Validate device ID format
  const deviceValidation = validateDeviceId(iDevice)
  if (!deviceValidation.success) {
    return {
      allowed: false,
      reason: 'Invalid device identifier',
    }
  }

  // Check if refresh token exists in database for this iDevice
  const refreshTokenCheck = await callRpc('pelak_auth_checkrefreshtoken', {
    p_idevice: iDevice,
  })

  const hasRefreshToken = refreshTokenCheck.success && (refreshTokenCheck as Record<string, unknown>).valid === true

  if (!hasRefreshToken) {
    return {
      allowed: false,
      reason: 'Refresh token not found in database. Please login again.',
    }
  }

  // If no access token provided, try to refresh
  if (!accessToken) {
    const refreshResult = await refreshAccessTokenIfNeeded(request, iDevice)
    if (!refreshResult) {
      return {
        allowed: false,
        reason: 'Access token required and refresh failed',
      }
    }
    return {
      allowed: true,
      newAccessToken: refreshResult.accessToken,
      newRefreshToken: refreshResult.refreshToken,
    }
  }

  // Verify access token
  const payload = verifyAccessToken(accessToken)
  
  // If access token is expired, try to refresh
  if (!payload) {
    const refreshResult = await refreshAccessTokenIfNeeded(request, iDevice)
    if (!refreshResult) {
      return {
        allowed: false,
        reason: 'Invalid or expired access token and refresh failed',
      }
    }
    
    // Verify the new token to get payload for role check
    const newPayload = verifyAccessToken(refreshResult.accessToken)
    if (!newPayload) {
      return {
        allowed: false,
        reason: 'Failed to verify refreshed access token',
      }
    }

    const userRole = newPayload.role as UserRole
    if (!hasRole(userRole, requiredRole)) {
      return {
        allowed: false,
        reason: `Insufficient permissions. Required role: ${requiredRole}`,
      }
    }

    return {
      allowed: true,
      newAccessToken: refreshResult.accessToken,
      newRefreshToken: refreshResult.refreshToken,
    }
  }

  // Access token is valid, check role
  const userRole = payload.role as UserRole
  
  if (!hasRole(userRole, requiredRole)) {
    return {
      allowed: false,
      reason: `Insufficient permissions. Required role: ${requiredRole}`,
    }
  }

  return {
    allowed: true,
  }
}

