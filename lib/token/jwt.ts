// /lib/token/jwt.ts
import { createHmac, timingSafeEqual } from "crypto";
import { TOKEN } from "@/config/security";
import { ENV } from "@/config/env";

/**
 * Get JWT secret with runtime validation
 */
function getJWTSecret(): string {
  if (!ENV.JWT_SECRET || ENV.JWT_SECRET.length < TOKEN.JWT_MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET environment variable must be set and at least ${TOKEN.JWT_MIN_SECRET_LENGTH} characters long`);
  }
  return ENV.JWT_SECRET;
}

// هدر JWT (HS256)
const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

// ساخت payload با exp = ۵ دقیقه
export function generateAccessToken(user: {
  id: number;
  mobile: string;
  firstname: string | null;
  lastname: string | null;
}): string {
  const SECRET = getJWTSecret();
  
  const payload = {
    user_id: user.id,
    mobile: user.mobile,
    firstname: user.firstname,
    lastname: user.lastname,
    role: "user",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN.ACCESS_TOKEN_EXPIRY,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const unsignedToken = `${header}.${encodedPayload}`;

  // امضای HMAC-SHA256
  const signature = createHmac("sha256", SECRET)
    .update(unsignedToken)
    .digest("base64url");

  return `${unsignedToken}.${signature}`;
}

export function verifyAccessToken(token: string): {
  user_id: number;
  mobile: string;
  firstname: string | null;
  lastname: string | null;
  role: string;
  iat: number;
  exp: number;
} | null {
  try {
    const SECRET = getJWTSecret();
    
    // Validate token structure: must have exactly 3 parts separated by dots
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [headerB64, payloadB64, signatureB64] = parts;
    
    if (!headerB64 || !payloadB64 || !signatureB64) return null;
    
    // Validate base64url format (basic check)
    const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
    if (!base64UrlRegex.test(headerB64) || !base64UrlRegex.test(payloadB64) || !base64UrlRegex.test(signatureB64)) {
      return null;
    }

    const unsignedToken = `${headerB64}.${payloadB64}`;

    const expectedSignature = createHmac("sha256", SECRET)
      .update(unsignedToken)
      .digest("base64url");

    // Use timing-safe comparison to prevent timing attacks
    if (signatureB64.length !== expectedSignature.length) return null;
    
    // Timing-safe comparison using crypto.timingSafeEqual
    const signatureBuffer = Buffer.from(signatureB64, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

    // Validate payload structure
    if (!payload || typeof payload !== 'object') return null;
    if (typeof payload.user_id !== 'number' || typeof payload.mobile !== 'string') return null;
    if (typeof payload.exp !== 'number' || typeof payload.iat !== 'number') return null;

    // چک انقضا
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Decode JWT token payload without verifying signature (server-side only)
 * For client-side use, import from '@/lib/token/jwt-client' instead
 * 
 * @deprecated Use decodeTokenPayload from '@/lib/token/jwt-client' in client components
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
    
    // Decode base64url (Node.js only)
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    
    // Validate payload structure
    if (!payload || typeof payload !== 'object') return null;
    if (typeof payload.user_id !== 'number' || typeof payload.mobile !== 'string') return null;
    if (typeof payload.exp !== 'number' || typeof payload.iat !== 'number') return null;
    
    return payload;
  } catch {
    return null;
  }
}