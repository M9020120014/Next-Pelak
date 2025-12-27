// Authorization utilities for role-based access control (RBAC)

import { verifyAccessToken } from '@/lib/token/jwt'

export type UserRole = 'user' | 'admin' | 'moderator'

export type AuthorizationResult = {
  allowed: boolean
  reason?: string
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

