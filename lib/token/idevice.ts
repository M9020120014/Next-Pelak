
/* --- Base ------------------------------------------------------------------------------------- */
import { cookies } from "next/headers";
import crypto from "crypto";
/* --- Lib -------------------------------------------------------------------------------------- */
import { SubmitLogServer } from '@/lib/log/logger'
import { COOKIE, TOKEN } from '@/config/security'
import { ENV } from '@/config/env'
import { runAsync } from '@/lib/utils/async'
/* --- Constants -------------------------------------------------------------------------------- */
const IDEVICE_STORAGE_KEY = ENV.IDEVICE_STORAGE_KEY
/* --- Functions -------------------------------------------------------------------------------- */

export async function getOrCreateIDeviceToken(userAgent?: string): Promise<string> {
  const cookieStore = await cookies();
  const existingIDevice = await getIDeviceToken()
  if (!existingIDevice || existingIDevice === "unknown" || existingIDevice.length !== TOKEN.DEVICE_ID_LENGTH) {
    const idevice = generateIDeviceToken(userAgent || "server-generated");
    cookieStore.set(IDEVICE_STORAGE_KEY, idevice, {
      ...COOKIE.IDEVICE,
    })
    return idevice;
  }
  return existingIDevice;
}

/* --- Get iDevice -------------------------------------------------- */
export async function getIDeviceToken(): Promise<string> {
  const cookieStore = await cookies();
  const idevice = cookieStore.get(IDEVICE_STORAGE_KEY)?.value;
  return idevice || 'unknown';
}
/* --- Call iDevice ------------------------------------------------- */
export function generateIDeviceToken(userAgent: string = "unknown"): string {
  try {
    return encodeTimestamp() + parseDeviceInfo(userAgent)
  } catch {
    return "unknown"
  }
}

/* --- encode Timestamp --------------------------------------------- */
export function encodeTimestamp(timestamp: number = Date.now()): string {
  const TIMESTAMP_ENCODE = 'ZABCDEFGHI' // 0-9
  const date = new Date(timestamp)
  const year = date.getFullYear().toString().split('').map(Number)
  const month = (date.getMonth() + 1).toString().padStart(2, '0').split('').map(Number)
  const day = date.getDate().toString().padStart(2, '0').split('').map(Number)
  const hours = date.getHours().toString().padStart(2, '0').split('').map(Number)
  const minutes = date.getMinutes().toString().padStart(2, '0').split('').map(Number)
  // Use cryptographically secure random bytes instead of Math.random()
  const randomBytes = crypto.randomBytes(6)
  // Convert to hex first, then take first 10 characters and convert to uppercase
  const random = randomBytes.toString('hex').substring(0, 10).toUpperCase()
  return "c" + TIMESTAMP_ENCODE[(hours[0] + hours[1]) % 10] + hours[0].toString() + hours[1].toString() + TIMESTAMP_ENCODE[(minutes[0] + minutes[1]) % 10] + minutes[0].toString() + minutes[1].toString() + TIMESTAMP_ENCODE[(year[0] + year[1]) % 10] + year[0].toString() + year[1].toString() + TIMESTAMP_ENCODE[(year[2] + year[3]) % 10] + year[2].toString() + year[3].toString() + TIMESTAMP_ENCODE[(month[0] + month[1]) % 10] + month[0].toString() + month[1].toString() + TIMESTAMP_ENCODE[(day[0] + day[1]) % 10] + day[0].toString() + day[1].toString() + "X" + random + "X"
}

/* --- parse Device Info -------------------------------------------- */
function parseDeviceInfo(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  let os = '-'
  let osVersion = '---'
  let browser = '-'
  let browserVersion = '---'
  let deviceType = '-'

  // Detect OS
  if (ua.includes('android')) {
    os = 'A'
    const androidMatch = userAgent.match(/Android\s+([\d.]+)/i)
    if (androidMatch) {
      osVersion = normalizeVersion(androidMatch[1])
    }
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'I'
    const iosMatch = userAgent.match(/OS\s+([\d_]+)/i)
    if (iosMatch) {
      osVersion = normalizeVersion(iosMatch[1].replace(/_/g, '.'))
    }
  } else if (ua.includes('windows')) {
    os = 'W'
    if (ua.includes('windows nt 10')) {
      osVersion = '010'
    } else if (ua.includes('windows nt 6.3')) {
      osVersion = '081'
    } else if (ua.includes('windows nt 6.2')) {
      osVersion = '080'
    } else if (ua.includes('windows nt 6.1')) {
      osVersion = '070'
    } else {
      // Try to extract version number
      const winMatch = userAgent.match(/Windows NT\s+([\d.]+)/i)
      if (winMatch) {
        osVersion = normalizeVersion(winMatch[1])
      }
    }
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    os = 'M'
    const macMatch = userAgent.match(/Mac OS X\s+([\d_]+)/i)
    if (macMatch) {
      osVersion = normalizeVersion(macMatch[1].replace(/_/g, '.'))
    }
  } else if (ua.includes('linux')) {
    os = 'L'
    osVersion = '---'
  }

  // Detect device type
  if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'T'
  } else if (ua.includes('mobile') || (ua.includes('android') && !ua.includes('tablet'))) {
    deviceType = 'M'
  } else {
    deviceType = 'D'
  }

  // Detect browser
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'C'
    const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/i)
    if (chromeMatch) {
      browserVersion = normalizeVersion(chromeMatch[1])
    }
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'S'
    const safariMatch = userAgent.match(/Version\/([\d.]+)/i)
    if (safariMatch) {
      browserVersion = normalizeVersion(safariMatch[1])
    }
  } else if (ua.includes('firefox')) {
    browser = 'F'
    const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/i)
    if (firefoxMatch) {
      browserVersion = normalizeVersion(firefoxMatch[1])
    }
  } else if (ua.includes('edg')) {
    browser = 'E'
    const edgeMatch = userAgent.match(/Edg\/([\d.]+)/i)
    if (edgeMatch) {
      browserVersion = normalizeVersion(edgeMatch[1])
    }
  }

  // Ensure exactly 9 characters: os(1) + osVersion(3) + browser(1) + browserVersion(3) + deviceType(1)
  const result = os + osVersion + browser + browserVersion + deviceType

  // Validate length (should always be 9)
  if (result.length !== 9) {
    runAsync(async () => {
      const warningError: Record<string, string> = {
        title: "ParseDeviceInfoWarning",
        message: "Expected 9 characters, got " + result.length + ": " + result,
        os,
        osVersion,
        browser,
        browserVersion,
        deviceType,
      }
      await SubmitLogServer(
        'warning',
        'lib/token/idevice',
        'parseDeviceInfo validation failed',
        warningError)
    })
    // Fallback to ensure 9 characters
    return (os + osVersion.padEnd(3, '-') + browser + browserVersion.padEnd(3, '-') + deviceType).substring(0, 9)
  }

  return result
}

/* --- Helper: Normalize version to 3 characters -------------------- */
function normalizeVersion(version: string | null | undefined): string {
  if (!version) return '---'
  // Remove dots and other non-numeric characters, keep only digits
  const digits = version.replace(/[^\d]/g, '')
  if (!digits) return '---'
  // Take first 3 digits and pad with zeros if needed
  return digits.substring(0, 3).padStart(3, '0')
}