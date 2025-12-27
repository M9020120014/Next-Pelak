/**
 * Unit tests for RPC utility functions
 * Run with: npm test
 */
import {
  isRpcParamValue,
  isRpcParamsObject,
  extractUserData,
  hasRefreshToken,
} from './rest/rpc'
import type { RpcResponseType } from './rest/rpc'

describe('RPC Utility Functions', () => {
  describe('isRpcParamValue', () => {
    it('should validate string values', () => {
      expect(isRpcParamValue('test')).toBe(true)
    })

    it('should validate number values', () => {
      expect(isRpcParamValue(123)).toBe(true)
    })

    it('should validate boolean values', () => {
      expect(isRpcParamValue(true)).toBe(true)
    })

    it('should reject null values', () => {
      expect(isRpcParamValue(null)).toBe(false)
    })

    it('should reject object values', () => {
      expect(isRpcParamValue({})).toBe(false)
    })
  })

  describe('isRpcParamsObject', () => {
    it('should validate valid RPC params object', () => {
      const params = {
        p_mobile: '09123456789',
        p_id: 123,
        p_active: true,
      }
      expect(isRpcParamsObject(params)).toBe(true)
    })

    it('should reject object with invalid values', () => {
      const params = {
        p_mobile: '09123456789',
        p_data: { nested: 'object' },
      }
      expect(isRpcParamsObject(params)).toBe(false)
    })

    it('should reject null', () => {
      expect(isRpcParamsObject(null)).toBe(false)
    })
  })

  describe('extractUserData', () => {
    it('should extract user data from valid response', () => {
      const response: RpcResponseType = {
        success: true,
        title: 'Success',
        message: 'OK',
        user_id: 1,
        mobile: '09123456789',
        firstname: 'John',
        lastname: 'Doe',
      }
      const userData = extractUserData(response)
      expect(userData).not.toBeNull()
      expect(userData?.id).toBe(1)
      expect(userData?.mobile).toBe('09123456789')
    })

    it('should return null for unsuccessful response', () => {
      const response: RpcResponseType = {
        success: false,
        title: 'Error',
        message: 'Failed',
      }
      const userData = extractUserData(response)
      expect(userData).toBeNull()
    })

    it('should return null for response without user_id', () => {
      const response: RpcResponseType = {
        success: true,
        title: 'Success',
        message: 'OK',
        mobile: '09123456789',
      }
      const userData = extractUserData(response)
      expect(userData).toBeNull()
    })
  })

  describe('hasRefreshToken', () => {
    it('should detect refresh token in response', () => {
      const response: RpcResponseType = {
        success: true,
        title: 'Success',
        message: 'OK',
        refresh_token: 'valid-token-string',
      }
      expect(hasRefreshToken(response)).toBe(true)
    })

    it('should reject empty refresh token', () => {
      const response: RpcResponseType = {
        success: true,
        title: 'Success',
        message: 'OK',
        refresh_token: '',
      }
      expect(hasRefreshToken(response)).toBe(false)
    })

    it('should reject response without refresh token', () => {
      const response: RpcResponseType = {
        success: true,
        title: 'Success',
        message: 'OK',
      }
      expect(hasRefreshToken(response)).toBe(false)
    })
  })
})

