/**
 * Unit tests for login API route
 * Run with: npm test
 */
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock all dependencies
jest.mock('@/core/lib/rest/rpc')
jest.mock('@/core/lib/token/auth-cookie')
jest.mock('@/core/lib/token/jwt')
jest.mock('@/core/lib/security/api-middleware')
jest.mock('@/core/lib/security/request-limits')
jest.mock('@/core/lib/validation')
jest.mock('@/core/lib/security/audit-log')
jest.mock('@/core/lib/security/brute-force')
jest.mock('@/core/lib/hooks')
jest.mock('@/core/lib/performance/monitoring')
jest.mock('@/core/lib/log/logger-utils')

import { callRpc, extractUserData, hasRefreshToken } from '@/core/lib/rest/rpc'
import { setRefreshTokenInResponse } from '@/core/lib/token/auth-cookie'
import { generateAccessToken } from '@/core/lib/token/jwt'
import { validateAPIRequest } from '@/core/lib/security/api-middleware'
import { sanitizeMobile, sanitizePassword } from '@/core/lib/security/request-limits'
import { validateMobile, validatePassword } from '@/core/lib/validation'
import { checkBruteForce, recordFailedAttempt } from '@/core/lib/security/brute-force'
import { hookRegistry } from '@/core/lib/hooks'

describe('Login API Route', () => {
  const createRequest = (body: Record<string, unknown>): NextRequest => {
    return new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default successful mocks
    ;(validateAPIRequest as jest.Mock).mockResolvedValue({
      valid: true,
      rateLimitHeaders: {},
    })
    ;(sanitizeMobile as jest.Mock).mockImplementation((val) => val)
    ;(sanitizePassword as jest.Mock).mockImplementation((val) => val)
    ;(validateMobile as jest.Mock).mockReturnValue({ success: true })
    ;(validatePassword as jest.Mock).mockReturnValue({ success: true })
    ;(checkBruteForce as jest.Mock).mockResolvedValue({ allowed: true })
    ;(callRpc as jest.Mock).mockResolvedValue({
      success: true,
      user_id: 1,
      mobile: '09123456789',
      firstname: 'Test',
      lastname: 'User',
      refresh_token: 'refresh-token-123',
    })
    ;(extractUserData as jest.Mock).mockReturnValue({
      id: 1,
      mobile: '09123456789',
      firstname: 'Test',
      lastname: 'User',
    })
    ;(hasRefreshToken as unknown as jest.Mock).mockReturnValue(true)
    ;(generateAccessToken as jest.Mock).mockReturnValue('access-token-123')
    ;(setRefreshTokenInResponse as jest.Mock).mockImplementation((res) => res)
  })

  describe('Input Validation', () => {
    it('should reject request with missing mobile', async () => {
      const request = createRequest({
        password: 'Password123',
        iDevice: 'device-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('موبایل')
    })

    it('should reject request with missing password', async () => {
      const request = createRequest({
        mobile: '09123456789',
        iDevice: 'device-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('رمز عبور')
    })

    it('should reject request with missing iDevice', async () => {
      const request = createRequest({
        mobile: '09123456789',
        password: 'Password123',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('دستگاه')
    })

    it('should reject invalid mobile number', async () => {
      ;(validateMobile as jest.Mock).mockReturnValue({
        success: false,
        message: 'Invalid mobile',
      })

      const request = createRequest({
        mobile: '123',
        password: 'Password123',
        iDevice: 'device-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should reject invalid password', async () => {
      ;(validatePassword as jest.Mock).mockReturnValue({
        success: false,
        message: 'Invalid password',
      })

      const request = createRequest({
        mobile: '09123456789',
        password: 'weak',
        iDevice: 'device-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('Security Checks', () => {
    it('should reject request failing API security validation', async () => {
      ;(validateAPIRequest as jest.Mock).mockResolvedValue({
        valid: false,
        response: new Response(
          JSON.stringify({ success: false, message: 'Security check failed' }),
          { status: 403 }
        ),
      })

      const request = createRequest({
        mobile: '09123456789',
        password: 'Password123',
        iDevice: 'device-id',
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
    })

    it('should reject request when brute force protection triggers', async () => {
      ;(checkBruteForce as jest.Mock).mockResolvedValue({
        allowed: false,
        reason: 'Account locked',
      })

      const request = createRequest({
        mobile: '09123456789',
        password: 'Password123',
        iDevice: 'device-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
    })
  })

  describe('Authentication', () => {
    it('should reject invalid credentials', async () => {
      ;(callRpc as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Invalid credentials',
      })

      const request = createRequest({
        mobile: '09123456789',
        password: 'WrongPassword123',
        iDevice: 'device-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(recordFailedAttempt).toHaveBeenCalled()
    })

    it('should return access token on successful login', async () => {
      const request = createRequest({
        mobile: '09123456789',
        password: 'Password123',
        iDevice: 'device-id',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.access_token).toBe('access-token-123')
      expect(generateAccessToken).toHaveBeenCalled()
    })

    it('should set refresh token cookie when available', async () => {
      const request = createRequest({
        mobile: '09123456789',
        password: 'Password123',
        iDevice: 'device-id',
      })

      await POST(request)

      expect(setRefreshTokenInResponse).toHaveBeenCalled()
    })

    it('should execute after-login hooks on success', async () => {
      const request = createRequest({
        mobile: '09123456789',
        password: 'Password123',
        iDevice: 'device-id',
      })

      await POST(request)

      // Hook execution is non-blocking, so we check if it was called
      // Note: Actual execution happens asynchronously via runAsync
      expect(hookRegistry.execute).toHaveBeenCalledWith('auth:after-login', expect.any(Object))
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize mobile number', async () => {
      ;(sanitizeMobile as jest.Mock).mockReturnValue('09123456789')

      const request = createRequest({
        mobile: '0912 345 6789',
        password: 'Password123',
        iDevice: 'device-id',
      })

      await POST(request)

      expect(sanitizeMobile).toHaveBeenCalled()
    })

    it('should sanitize password', async () => {
      ;(sanitizePassword as jest.Mock).mockReturnValue('Password123')

      const request = createRequest({
        mobile: '09123456789',
        password: 'Password123',
        iDevice: 'device-id',
      })

      await POST(request)

      expect(sanitizePassword).toHaveBeenCalled()
    })
  })
})

