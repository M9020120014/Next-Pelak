'use client'
/* --- Base ------------------------------------------------------------------------------------- */
import { createContext, useContext } from 'react'
/* --- Lib -------------------------------------------------------------------------------------- */
import { SubmitLogClient } from '@/core/lib/log/logger'
/* --- Types ------------------------------------------------------------------------------------ */
interface SecurityContextType {
  csrfToken: string
  reportSecurityIssue: (issue: string) => void
}
/* --- Constants -------------------------------------------------------------------------------- */
const SecurityContext = createContext<SecurityContextType | null>(null)
/* --- Functions -------------------------------------------------------------------------------- */
export function SecurityProvider({
  children,
  csrfToken
}: {
  children: React.ReactNode
  csrfToken: string
}) {
  const reportSecurityIssue = (issue: string) => {
    const error = { issue }
    SubmitLogClient(
      'security',
      'components/providers/SecurityProvider',
      'Security Issue Reported',
      error,
      csrfToken
    ).catch(() => {
      // Silently fail if logging fails
    })
  }

  return (
    <SecurityContext.Provider value={{ csrfToken, reportSecurityIssue }}>
      {children}
    </SecurityContext.Provider>
  )
}

export const useSecurity = () => {
  const context = useContext(SecurityContext)
  if (!context) throw new Error('useSecurity must be used within SecurityProvider')
  return context
}
