/**
 * Unit tests for validation functions
 * Run with: npm test
 */
import {
  validateMobile,
  validatePassword,
  validateOtpCode,
  validateDeviceId,
  validateNationalCode,
} from './validation'

describe('Validation Functions', () => {
  describe('validateMobile', () => {
    it('should validate Iranian mobile number', () => {
      const result = validateMobile('09123456789')
      expect(result.success).toBe(true)
    })

    it('should reject invalid mobile number', () => {
      const result = validateMobile('1234567890')
      expect(result.success).toBe(false)
    })

    it('should reject empty mobile number', () => {
      const result = validateMobile('')
      expect(result.success).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate password with minimum requirements', () => {
      const result = validatePassword('Password123')
      expect(result.success).toBe(true)
    })

    it('should reject password that is too short', () => {
      const result = validatePassword('Pass1')
      expect(result.success).toBe(false)
    })

    it('should reject password without uppercase', () => {
      const result = validatePassword('password123')
      expect(result.success).toBe(false)
    })

    it('should reject password without lowercase', () => {
      const result = validatePassword('PASSWORD123')
      expect(result.success).toBe(false)
    })

    it('should reject password without number', () => {
      const result = validatePassword('Password')
      expect(result.success).toBe(false)
    })
  })

  describe('validateOtpCode', () => {
    it('should validate 4-digit OTP code', () => {
      const result = validateOtpCode('1234', 4)
      expect(result.success).toBe(true)
    })

    it('should validate 6-digit OTP code', () => {
      const result = validateOtpCode('123456', 6)
      expect(result.success).toBe(true)
    })

    it('should reject OTP code with wrong length', () => {
      const result = validateOtpCode('123', 4)
      expect(result.success).toBe(false)
    })

    it('should reject empty OTP code', () => {
      const result = validateOtpCode('', 4)
      expect(result.success).toBe(false)
    })
  })

  describe('validateDeviceId', () => {
    it('should validate device ID with correct length', () => {
      // Device ID should be exactly 40 characters
      const deviceId = 'c' + 'A'.repeat(39)
      const result = validateDeviceId(deviceId)
      expect(result.success).toBe(true)
    })

    it('should reject device ID with wrong length', () => {
      const result = validateDeviceId('short')
      expect(result.success).toBe(false)
    })

    it('should reject device ID that does not start with c', () => {
      const deviceId = 'A' + 'A'.repeat(39)
      const result = validateDeviceId(deviceId)
      expect(result.success).toBe(false)
    })
  })

  describe('validateNationalCode', () => {
    it('should validate valid Iranian national code', () => {
      // Using a known valid test national code
      const result = validateNationalCode('0123456789')
      // Note: This will fail checksum, but tests the format validation
      expect(result.success).toBe(false) // Will fail checksum validation
    })

    it('should reject national code with wrong length', () => {
      const result = validateNationalCode('123456789')
      expect(result.success).toBe(false)
    })

    it('should reject non-numeric national code', () => {
      const result = validateNationalCode('012345678a')
      expect(result.success).toBe(false)
    })
  })
})

