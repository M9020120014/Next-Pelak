import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./core/config/security";
import { IS_PRODUCTION } from "./core/config/base";
import { ENV } from "./core/config/env";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // CSP will be set dynamically in proxy with nonce
          // HSTS - HTTP Strict Transport Security (only in production)
          ...(IS_PRODUCTION ? [{
            key: 'Strict-Transport-Security',
            value: [
              `max-age=${SECURITY_HEADERS.HSTS.maxAge}`,
              SECURITY_HEADERS.HSTS.includeSubDomains ? 'includeSubDomains' : '',
              SECURITY_HEADERS.HSTS.preload ? 'preload' : ''
            ].filter(Boolean).join('; ')
          }] : []),
          // X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // X-DNS-Prefetch-Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off'
          },
          // X-XSS-Protection (for older browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Cross-Origin-Opener-Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          // Cross-Origin-Resource-Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          // X-Permitted-Cross-Domain-Policies
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          },
          // Expect-CT (Certificate Transparency)
          {
            key: 'Expect-CT',
            value: 'max-age=86400, enforce'
          }
        ]
      }
    ]
  },
  // Additional Security Configs
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // S3 Storage Configuration
    remotePatterns: (() => {
      const sssObject = ENV.SSS_OBJECT;
      const patterns: Array<{ protocol: 'http' | 'https'; hostname: string; pathname: string }> = [];
      
      if (sssObject && sssObject.startsWith('http')) {
        try {
          const url = new URL(sssObject);
          patterns.push({
            protocol: url.protocol === 'https:' ? 'https' : 'http',
            hostname: url.hostname,
            pathname: '/**',
          });
        } catch (_error) {
          console.warn('Invalid SSS_OBJECT URL:', sssObject);
        }
      }
      
      return patterns;
    })(),
  },
  // Performance optimizations
  experimental: {
    // optimizeCss: true, // Disabled - requires 'critters' package
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
}

export default nextConfig;
