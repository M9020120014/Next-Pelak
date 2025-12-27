// Security utility functions

/**
 * Extract client IP address from request headers
 * Checks multiple headers in order of preference for accurate IP detection
 * behind proxies/load balancers
 * 
 * Security Note: In production, ensure your reverse proxy/load balancer sets
 * these headers correctly. Only trust IPs from known proxies to prevent IP spoofing.
 * 
 * @param request - The incoming request
 * @param _trustedProxies - Optional array of trusted proxy IPs (for future enhancement)
 */
export function getClientIP(request: Request, _trustedProxies?: string[]): string {
  // Priority order: Cloudflare > X-Real-IP > X-Forwarded-For (first IP)
  // Cloudflare IP is most reliable when using Cloudflare
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }
  
  // X-Real-IP is typically set by nginx and other reverse proxies
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  
  // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
  // Take the first IP which is the original client IP
  // Security: In production, validate that the last proxy is trusted
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim()
    // Basic IP format validation (IPv4 or IPv6)
    if (isValidIPFormat(firstIp)) {
      return firstIp
    }
  }
  
  // Fallback: try to get IP from connection (if available in Node.js)
  // Note: This won't work in serverless environments
  return 'unknown'
}

/**
 * Basic IP format validation
 * Validates IPv4 and IPv6 formats
 */
function isValidIPFormat(ip: string): boolean {
  // IPv4: xxx.xxx.xxx.xxx (1-3 digits per octet)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  // IPv6: simplified check (full validation is complex)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

