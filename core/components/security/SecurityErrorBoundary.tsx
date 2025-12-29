'use client'
/* --- Base ------------------------------------------------------------------------------------- */
import React from 'react'
/* --- Lib -------------------------------------------------------------------------------------- */
import { SubmitLogClient } from '@/core/lib/log/logger'
/* --- Types ------------------------------------------------------------------------------------ */
export default class SecurityErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error) {
    // Don't call async functions here - move to componentDidCatch
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to security monitoring service
    // Don't expose sensitive error details to client
    const details = {
      message: error.message,
      name: 'SecurityErrorBoundary',
      stack: errorInfo.componentStack || "undefined",
    }

    // Log to server
    SubmitLogClient(
      'error',
      'components/security/SecurityErrorBoundary',
      'Security Error Caught',
      details
    ).catch(() => {
      // Silently fail if logging fails
    })
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
