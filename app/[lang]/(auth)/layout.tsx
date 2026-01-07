/* --- Base ------------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-Background pt-008-2 lg:pt-040-8 min-h-screen">
      <P.Container className="border border-Border rounded-md">
        {children}
      </P.Container>
    </main>
  )
}