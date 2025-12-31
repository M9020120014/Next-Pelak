/**
 * Unit tests for brute force protection
 * Run with: npm test
 */
import { checkBruteForce, recordFailedAttempt } from './brute-force'

// Mock rate-limit module
jest.mock('./rate-limit')
import { checkRateLimit } from './rate-limit'

describe('Brute Force Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('checkBruteForce', () => {
    it('should allow login when within rate limit', async () => {
      ;(checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        remaining: 3,
        resetTime: Date.now() + 60000,
      })

      const result = await checkBruteForce('09123456789')

      expect(result.allowed).toBe(true)
      expect(result.remainingAttempts).toBe(3)
      expect(result.lockoutTime).toBeUndefined()
    })

    it('should block login when rate limit exceeded', async () => {
      const resetTime = Date.now() + 900000 // 15 minutes
      ;(checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime,
      })

      const result = await checkBruteForce('09123456789')

      expect(result.allowed).toBe(false)
      expect(result.remainingAttempts).toBe(0)
      expect(result.lockoutTime).toBe(resetTime)
      expect(result.reason).toContain('locked')
    })

    it('should use correct key format for mobile number', async () => {
      ;(checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        remaining: 5,
        resetTime: Date.now() + 60000,
      })

      await checkBruteForce('09123456789')

      expect(checkRateLimit).toHaveBeenCalledWith(
        'brute_force:09123456789',
        expect.any(Number),
        expect.any(Number)
      )
    })
  })

  describe('recordFailedAttempt', () => {
    it('should record failed attempt', async () => {
      ;(checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: Date.now() + 60000,
      })

      await recordFailedAttempt('09123456789')

      expect(checkRateLimit).toHaveBeenCalledWith(
        'brute_force:09123456789',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should use correct key format', async () => {
      ;(checkRateLimit as jest.Mock).mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: Date.now() + 60000,
      })

      await recordFailedAttempt('09123456789')

      expect(checkRateLimit).toHaveBeenCalledWith(
        'brute_force:09123456789',
        expect.any(Number),
        expect.any(Number)
      )
    })
  })
})

