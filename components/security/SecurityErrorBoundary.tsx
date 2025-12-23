'use client'
/* --- Base ------------------------------------------------------------------------------------- */
import React from 'react'
/* --- Lib -------------------------------------------------------------------------------------- */
import { SubmitLogClient, SubmitLogServer } from '@/lib/log/logger'

export default class SecurityErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(error: Error) {
    // Don't call async functions here - move to componentDidCatch
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to security monitoring service
    // Don't expose sensitive error details to client
    const securityError = new Error(`Security Error: ${error.message}`)
    securityError.name = 'SecurityErrorBoundary'
    securityError.stack = errorInfo.componentStack || undefined
    
    // Log to server (both client and server side)
    SubmitLogClient(
      'error',
      'components/Providers/SecurityErrorBoundary',
      'Security Error Caught',
      securityError
    ).catch(() => {
      // Silently fail if logging fails
    })
    
    // Also log server-side if available
    if (typeof window === 'undefined') {
      SubmitLogServer(
        'error',
        'components/Providers/SecurityErrorBoundary',
        'Security Error Caught',
        securityError
      ).catch(() => {
        // Silently fail if logging fails
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">خطای امنیتی</h1>
            <p className="text-gray-600 mb-4">یک خطای امنیتی رخ داده است.</p>
            <p className="text-sm text-gray-500">
              لطفاً صفحه را رفرش کنید یا با پشتیبانی تماس بگیرید.
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
