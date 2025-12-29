
/* --- Base ------------------------------------------------------------------------------------- */
import { ThemeProvider } from "next-themes";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Providers ---------------------------------------------------- */
export default function Providers({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ThemeProvider themes={["light", "dark"]} attribute="class" storageKey="theme-settings" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
    </>
  );
}

