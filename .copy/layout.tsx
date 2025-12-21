
/* --- Base ------------------------------------------------------------------------------------- */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
/* --- Lib -------------------------------------------------------------------------------------- */
import { textFont, titleFont } from "@/libs/fonts";
/* --- Lib -------------------------------------------------------------------------------------- */
import Providers from "@/components/Providers";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE, LANGUAGE_LIST } from "@/configs/site";
import { BACE_SEO_LANG } from "@/data/metadata";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Get Lang from Params ----------------------------------------- */
// async function getLang({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
//   const { lang } = await params;
//   if (!Object.keys(LANGUAGE.lang).includes(lang)) {
//     notFound();
//   } else {
//     return lang as keyof typeof LANGUAGE.lang;
//   }
// }
/* --- Lang Metadata ------------------------------------------------ */
// export async function generateMetadata({
//   params
// }: Readonly<{
//   params: Promise<{ lang: string }>;
// }>): Promise<Metadata> {
//   const { lang } = await params;
//   if (Object.keys(LANGUAGE.lang).includes(lang)) {
//     const trueLang = lang as keyof typeof LANGUAGE.lang;
//     return BACE_SEO_LANG(trueLang);
//   } else {
//     return BACE_SEO_LANG(LANGUAGE_LIST.default);
//   }
// }
/* --- Lang Layout -------------------------------------------------- */
export default async function LangLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!Object.keys(LANGUAGE.lang).includes(lang)) {
    notFound();
  }
  const trueLang = lang as keyof typeof LANGUAGE.lang;

  return (
    <html
      lang={LANGUAGE.lang[trueLang]}
      dir={LANGUAGE.direction[trueLang]}
      className={textFont.variable + " " + titleFont.variable}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Providers LANG={trueLang}>
          {children}
        </Providers>
      </body>
    </html>
  );
}



