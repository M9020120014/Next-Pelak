
/* --- Lib -------------------------------------------------------------------------------------- */
import { textFont, titleFont } from "@/libs/fonts";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE } from "@/configs/site";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Root Layout -------------------------------------------------- */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={LANGUAGE.data.lang[LANGUAGE.default]}
      dir={LANGUAGE.data.direction[LANGUAGE.default]}
      className={textFont.variable + " " + titleFont.variable}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
