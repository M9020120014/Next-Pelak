// /lib/token/jwt-client.ts
// Client-side JWT utilities (browser only)
// This file should NOT import server-only modules like 'crypto'

'use client'

/**
 * Decode base64url string (browser compatible)
 * Uses browser's native atob function
 */
function decodeBase64Url(str: string): string {
  // Replace URL-safe characters with standard base64 characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  
  // Decode using browser's atob
  try {
    return atob(base64);
  } catch {
    return '';
  }
}

/**
 * Decode JWT token payload without verifying signature (client-side only)
 * This is used for checking expiration on client-side without full verification
 * WARNING: Do NOT use this for security checks - use verifyAccessToken() on server instead
 * 
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeTokenPayload(token: string): {
  user_id: number;
  mobile: string;
  firstname: string | null;
  lastname: string | null;
  role: string;
  iat: number;
  exp: number;
} | null {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payloadB64 = parts[1];
    if (!payloadB64) return null;
    
    // Validate base64url format (basic check)
    const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
    if (!base64UrlRegex.test(payloadB64)) {
      return null;
    }
    
    // Decode base64url (browser compatible)
    const decoded = decodeBase64Url(payloadB64);
    if (!decoded) return null;
    
    const payload = JSON.parse(decoded);
    
    // Validate payload structure
    if (!payload || typeof payload !== 'object') return null;
    if (typeof payload.user_id !== 'number' || typeof payload.mobile !== 'string') return null;
    if (typeof payload.exp !== 'number' || typeof payload.iat !== 'number') return null;
    
    return payload;
  } catch {
    return null;
  }
}

