// SSRF (Server-Side Request Forgery) protection
// Validates URLs to prevent requests to internal/private IPs

/**
 * Check if an IP address is private/internal
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 private ranges
  const privateIPv4Ranges = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (localhost)
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
    /^0\.0\.0\.0$/,             // 0.0.0.0
  ]

  // IPv6 private ranges
  const privateIPv6Ranges = [
    /^::1$/,                    // ::1 (localhost)
    /^fc00:/i,                  // fc00::/7 (unique local)
    /^fe80:/i,                  // fe80::/10 (link-local)
    /^::ffff:0:0\./,            // IPv4-mapped IPv6
  ]

  // Check IPv4
  if (privateIPv4Ranges.some(range => range.test(ip))) {
    return true
  }

  // Check IPv6
  if (privateIPv6Ranges.some(range => range.test(ip))) {
    return true
  }

  return false
}

/**
 * Extract hostname from URL
 */
function extractHostname(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return null
  }
}

/**
 * Resolve hostname to IP (basic check - in production, use DNS lookup)
 * For now, we check if the hostname looks like an IP address
 */
function hostnameToIP(hostname: string): string | null {
  // Check if it's already an IP address
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
  
  if (ipv4Regex.test(hostname) || ipv6Regex.test(hostname)) {
    return hostname
  }

  // If it's a hostname, we can't resolve it here without DNS lookup
  // In production, you might want to do a DNS lookup and check the IP
  // For now, we'll check common localhost hostnames
  const localhostHostnames = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
  ]

  if (localhostHostnames.includes(hostname.toLowerCase())) {
    return '127.0.0.1'
  }

  return null
}

/**
 * Validate URL to prevent SSRF attacks
 * Returns true if URL is safe, false if it's a private/internal IP
 */
export function validateURL(url: string): { valid: boolean; reason?: string } {
  try {
    const hostname = extractHostname(url)
    
    if (!hostname) {
      return {
        valid: false,
        reason: 'Invalid URL format',
      }
    }

    // Check if hostname is an IP address
    const ip = hostnameToIP(hostname)
    
    if (ip && isPrivateIP(ip)) {
      return {
        valid: false,
        reason: 'URL points to private/internal IP address',
      }
    }

    // Additional checks for common SSRF patterns
    const suspiciousPatterns = [
      /^file:\/\//i,           // file:// protocol
      /^gopher:\/\//i,         // gopher:// protocol
      /^dict:\/\//i,           // dict:// protocol
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(url))) {
      return {
        valid: false,
        reason: 'URL uses forbidden protocol',
      }
    }

    return { valid: true }
  } catch {
    return {
      valid: false,
      reason: 'Error validating URL',
    }
  }
}

/**
 * Validate that a URL is safe for external requests
 * This should be called before making any fetch/HTTP requests to user-provided URLs
 */
export function isURLSafeForRequest(url: string): boolean {
  const validation = validateURL(url)
  return validation.valid
}

