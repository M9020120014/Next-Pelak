// /components/page/DashboardClient.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'
import ConnectionError from '@/core/components/auth/ConnectionError'

interface DashboardClientProps {
  iDevice: string
  lang: string
}

export default function DashboardClient({ iDevice, lang }: DashboardClientProps) {
  const { authState, error, refreshAccessToken, logout } = useAuth(iDevice)
  const [retrying, setRetrying] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    await refreshAccessToken()
    setRetrying(false)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    setLoggingOut(false)
  }

  // Get user info from token
  const token = getAccessToken()
  const userInfo = token ? decodeTokenPayload(token) : null

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (authState === 'error' && error) {
    return (
      <ConnectionError
        message={error.message}
        onRetry={handleRetry}
        retrying={retrying}
      />
    )
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">لطفاً دوباره وارد شوید.</p>
        </div>
      </div>
    )
  }

  console.log('------ userInfo ------ ', userInfo)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loggingOut ? 'در حال خروج...' : 'خروج از حساب کاربری'}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">خوش آمدید به داشبورد</p>
          {userInfo && (
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">شماره موبایل:</span> {userInfo.mobile}
              </p>
              {userInfo.firstname && (
                <p className="text-gray-700">
                  <span className="font-semibold">نام:</span> {userInfo.firstname}
                </p>
              )}
              {userInfo.lastname && (
                <p className="text-gray-700">
                  <span className="font-semibold">نام خانوادگی:</span> {userInfo.lastname}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

