
/* --- Components ------------------------------------------------------------------------------- */
import SecurityErrorBoundary from '@/components/security/SecurityErrorBoundary'
import { SecurityProvider } from '@/components/security/SecurityProvider'
/* --- Lib -------------------------------------------------------------------------------------- */
import { getOrCreateCSRFToken, generateNonce } from "@/lib/security/cookies";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Security Providers ------------------------------------------- */
export default async function SecurityProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const csrfToken = await getOrCreateCSRFToken() || ''
  const nonce = generateNonce()
  return (
    <SecurityErrorBoundary>
      <SecurityProvider csrfToken={csrfToken} nonce={nonce}>
        {children}
      </SecurityProvider>
    </SecurityErrorBoundary>
  )
}
