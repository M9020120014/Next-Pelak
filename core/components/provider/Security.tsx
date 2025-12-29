
/* --- Components ------------------------------------------------------------------------------- */
import SecurityErrorBoundary from '@/core/components/security/SecurityErrorBoundary'
import { SecurityProvider } from '@/core/components/security/SecurityProvider'
import PostHogProvider from './PostHogProvider'
/* --- Lib -------------------------------------------------------------------------------------- */
import { getOrCreateCSRFToken } from "@/core/lib/security/cookies";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Security Providers ------------------------------------------- */
export default async function SecurityProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const csrfToken = await getOrCreateCSRFToken() || ''
  return (
    <SecurityErrorBoundary>
      <SecurityProvider csrfToken={csrfToken}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </SecurityProvider>
    </SecurityErrorBoundary>
  )
}
