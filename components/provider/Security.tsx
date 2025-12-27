
/* --- Components ------------------------------------------------------------------------------- */
import SecurityErrorBoundary from '@/components/security/SecurityErrorBoundary'
import { SecurityProvider } from '@/components/security/SecurityProvider'
/* --- Lib -------------------------------------------------------------------------------------- */
import { getOrCreateCSRFToken } from "@/lib/security/cookies";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Security Providers ------------------------------------------- */
export default async function SecurityProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const csrfToken = await getOrCreateCSRFToken() || ''
  return (
    <SecurityErrorBoundary>
      <SecurityProvider csrfToken={csrfToken}>
        {children}
      </SecurityProvider>
    </SecurityErrorBoundary>
  )
}
