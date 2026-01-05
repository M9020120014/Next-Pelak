export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-Background pt-008-2 lg:pt-040-8 min-h-screen">
      {children}
    </main>
  )
}