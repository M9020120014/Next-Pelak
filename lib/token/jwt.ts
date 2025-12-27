// /lib/token/jwt.ts
import { createHmac } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "";

// هدر JWT (HS256)
const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

// ساخت payload با exp = ۵ دقیقه
export function generateAccessToken(user: {
  id: number;
  mobile: string;
  firstname: string | null;
  lastname: string | null;
}): string {
  const payload = {
    user_id: user.id,
    mobile: user.mobile,
    firstname: user.firstname,
    lastname: user.lastname,
    role: "user",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 300, // ۵ دقیقه
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const unsignedToken = `${header}.${encodedPayload}`;

  // امضای HMAC-SHA256
  const signature = createHmac("sha256", JWT_SECRET)
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
    const [headerB64, payloadB64, signatureB64] = token.split(".");

    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const unsignedToken = `${headerB64}.${payloadB64}`;

    const expectedSignature = createHmac("sha256", JWT_SECRET)
      .update(unsignedToken)
      .digest("base64url");

    if (signatureB64 !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

    // چک انقضا
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}