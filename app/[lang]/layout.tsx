
/* --- Base ------------------------------------------------------------------------------------- */
import { notFound } from "next/navigation";
/* --- Lib -------------------------------------------------------------------------------------- */
import { textFont, titleFont } from "@/libs/fonts";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE, type LANG } from "@/configs/site";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Lang Layout -------------------------------------------------- */
export default async function LangLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: LANG }>;
}>) {
  const { lang } = await params;
  console.log("lang: ",lang);
  // if (lang == LANG) {
  //   notFound();
  // }
  return (
    <html
      lang={LANGUAGE.data.lang[lang]}
      dir={LANGUAGE.data.direction[lang]}
      className={textFont.variable + " " + titleFont.variable}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
