/**
 * Unit tests for API security middleware
 * Run with: npm test
 */
import { NextRequest } from 'next/server'
import { validateAPIRequest } from './api-middleware'

// Mock dependencies
jest.mock('./cookies')
jest.mock('./request-limits')
jest.mock('./rate-limit')
jest.mock('./ip-filter')
jest.mock('./audit-log')
jest.mock('@/core/lib/utils/async')

import { validateCSRFToken } from './cookies'
import { validateRequestSize } from './request-limits'
import { checkRateLimit, getClientIdentifier } from './rate-limit'
import { checkIPFilter } from './ip-filter'

describe('API Security Middleware', () => {
  const mockRequest = (options: { method?: string; headers?: Record<string, string> } = {}): NextRequest => {
    const url = 'http://localhost:3000/api/test'
    return new NextRequest(url, {
      method: options.method || 'POST',
      headers: {
        'content-type': 'application/json',
        ...options.headers,
      },
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mocks - all checks pass
    ;(checkIPFilter as jest.Mock).mockReturnValue({ allowed: true })
    ;(validateRequestSize as jest.Mock).mockResolvedValue({ valid: true })
    ;(getClientIdentifier as jest.Mock).mockReturnValue('test-client')
    ;(checkRateLimit as jest.Mock).mockResolvedValue({
      allowed: true,
      remaining: 10,
      resetTime: Date.now() + 60000,
    })
    ;(validateCSRFToken as jest.Mock).mockResolvedValue(true)
  })

  describe('IP Filtering', () => {
    it('should reject request from blocked IP', async () => {
      ;(checkIPFilter as jest.Mock).mockReturnValue({
        allowed: false,
        reason: 'IP blocked',
      })

      const request = mockRequest()
      const result = await validateAPIRequest(request, false)

      expect(result.valid).toBe(false)
      expect(result.response?.status).toBe(403)
    })

    it('should allow request from allowed IP', async () => {
      ;(checkIPFilter as jest.Mock).mockReturnValue({ allowed: true })

      const request = mockRequest()
      const result = await validateAPIRequest(request, false)

      expect(result.valid).toBe(true)
    })
  })

  describe('Request Size Validation', () => {
    it('should reject request that is too large', async () => {
      ;(validateRequestSize as jest.Mock).mockResolvedValue({
        valid: false,
      })

      const request = mockRequest()
      const result = await validateAPIRequest(request, false)

      expect(result.valid).toBe(false)
      expect(result.response?.status).toBe(413)
    })

    it('should allow request with valid size', async () => {
      ;(validateRequestSize as jest.Mock).mockResolvedValue({ valid: true })

      const request = mockRequest()
      const result = await validateAPIRequest(request, false)

      expect(result.valid).toBe(true)
    })
  })

  describe('Rate Limiting', () => {
    it('should reject request when rate limit exceeded', async () => {
      ;(checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
      })

      const request = mockRequest()
      const result = await validateAPIRequest(request, false, {
        maxRequests: 10,
        windowMs: 60000,
      })

      expect(result.valid).toBe(false)
      expect(result.response?.status).toBe(429)
      expect(result.response?.headers.get('X-RateLimit-Limit')).toBe('10')
    })

    it('should allow request within rate limit', async () => {
      ;(checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetTime: Date.now() + 60000,
      })

      const request = mockRequest()
      const result = await validateAPIRequest(request, false, {
        maxRequests: 10,
        windowMs: 60000,
      })

      expect(result.valid).toBe(true)
      expect(result.rateLimitHeaders?.['X-RateLimit-Remaining']).toBe('5')
    })

    it('should skip rate limiting when config not provided', async () => {
      const request = mockRequest()
      const result = await validateAPIRequest(request, false)

      expect(result.valid).toBe(true)
      expect(checkRateLimit).not.toHaveBeenCalled()
    })
  })

  describe('CSRF Validation', () => {
    it('should reject POST request without CSRF token', async () => {
      ;(validateCSRFToken as jest.Mock).mockResolvedValue(false)

      const request = mockRequest()
      const result = await validateAPIRequest(request, true)

      expect(result.valid).toBe(false)
      expect(result.response?.status).toBe(403)
    })

    it('should reject POST request with invalid CSRF token', async () => {
      ;(validateCSRFToken as jest.Mock).mockResolvedValue(false)

      const request = mockRequest({
        headers: {
          'x-csrf-token': 'invalid-token',
        },
      })
      const result = await validateAPIRequest(request, true)

      expect(result.valid).toBe(false)
      expect(result.response?.status).toBe(403)
    })

    it('should allow POST request with valid CSRF token', async () => {
      ;(validateCSRFToken as jest.Mock).mockResolvedValue(true)

      const request = mockRequest({
        headers: {
          'x-csrf-token': 'valid-token',
        },
      })
      const result = await validateAPIRequest(request, true)

      expect(result.valid).toBe(true)
    })

    it('should skip CSRF validation for GET requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      })
      const result = await validateAPIRequest(request, true)

      expect(result.valid).toBe(true)
      expect(validateCSRFToken).not.toHaveBeenCalled()
    })

    it('should skip CSRF validation when requireCSRF is false', async () => {
      const request = mockRequest()
      const result = await validateAPIRequest(request, false)

      expect(result.valid).toBe(true)
      expect(validateCSRFToken).not.toHaveBeenCalled()
    })
  })

  describe('Complete Flow', () => {
    it('should pass all security checks', async () => {
      const request = mockRequest({
        headers: {
          'x-csrf-token': 'valid-token',
        },
      })

      const result = await validateAPIRequest(request, true, {
        maxRequests: 10,
        windowMs: 60000,
      })

      expect(result.valid).toBe(true)
      expect(checkIPFilter).toHaveBeenCalled()
      expect(validateRequestSize).toHaveBeenCalled()
      expect(checkRateLimit).toHaveBeenCalled()
      expect(validateCSRFToken).toHaveBeenCalled()
    })

    it('should fail on first security check failure', async () => {
      ;(checkIPFilter as jest.Mock).mockReturnValue({
        allowed: false,
        reason: 'IP blocked',
      })

      const request = mockRequest()
      const result = await validateAPIRequest(request, true, {
        maxRequests: 10,
        windowMs: 60000,
      })

      expect(result.valid).toBe(false)
      // Should not proceed to other checks
      expect(validateRequestSize).not.toHaveBeenCalled()
      expect(checkRateLimit).not.toHaveBeenCalled()
      expect(validateCSRFToken).not.toHaveBeenCalled()
    })
  })
})

