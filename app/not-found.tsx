
/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link";
/* --- Lib -------------------------------------------------------------------------------------- */
import { textFont, titleFont } from "@/libs/fonts";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE } from "@/configs/site";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Root Layout -------------------------------------------------- */
export default function NotFound() {
  return (
    <html
      lang={LANGUAGE.data.lang[LANGUAGE.default]}
      dir={LANGUAGE.data.direction[LANGUAGE.default]}
      className={textFont.variable + " " + titleFont.variable}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
          <h1>404</h1>
          <p>Page not found</p>
          <Link href="/">Go to home</Link>
        </main>
      </body>
    </html>
  );
}
