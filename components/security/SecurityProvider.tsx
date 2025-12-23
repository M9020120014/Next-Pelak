'use client'

import { createContext, useContext } from 'react'
/* --- Lib -------------------------------------------------------------------------------------- */
import { SubmitLogClient } from '@/lib/log/logger'

interface SecurityContextType {
  csrfToken: string
  nonce: string
  reportSecurityIssue: (issue: string) => void
}

const SecurityContext = createContext<SecurityContextType | null>(null)

export function SecurityProvider({ 
  children,
  csrfToken,
  nonce
}: { 
  children: React.ReactNode
  csrfToken: string
  nonce: string
}) {
  const reportSecurityIssue = (issue: string) => {
    // Report to security monitoring service
    const error = new Error(`Security Issue: ${issue}`)
    error.name = 'SecurityIssue'
    // Log to server
    SubmitLogClient(
      'security',
      'components/providers/SecurityProvider',
      'Security Issue Reported',
      error
    ).catch(() => {
      // Silently fail if logging fails
    })
  }

  return (
    <SecurityContext.Provider value={{ csrfToken, nonce, reportSecurityIssue }}>
      {children}
    </SecurityContext.Provider>
  )
}

export const useSecurity = () => {
  const context = useContext(SecurityContext)
  if (!context) throw new Error('useSecurity must be used within SecurityProvider')
  return context
}
