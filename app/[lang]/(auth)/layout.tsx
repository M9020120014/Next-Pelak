/* --- Base ------------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-Background lg:pt-034-7">
      <P.Container className="border border-Border rounded-md">
        {children}
      </P.Container>
    </main>
  )
}