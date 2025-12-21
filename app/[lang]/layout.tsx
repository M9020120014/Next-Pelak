/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next";
import { textFont, titleFont } from "@/lib/fonts";
import { notFound } from "next/navigation";
/* --- Components ------------------------------------------------------------------------------- */
import Providers from "@/components/Providers";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE, LANGUAGE_DATA, LANG_CHECK } from "@/config/site";
import { BACE_SEO_LANG } from "@/data/metadata";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Locale Layout Metadata --------------------------------------- */
export async function generateMetadata({
  params
}: Readonly<{
  params: Promise<{ lang: string }>;
}>): Promise<Metadata> {
  const { lang } = await params;
  console.log("---LAYOUT_M---",lang);
  if (LANG_CHECK(lang)) {
    return BACE_SEO_LANG(lang);
  }else{
    return BACE_SEO_LANG(LANGUAGE.default);
  }
};
/* --- Locale Layout ------------------------------------------------ */
export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  console.log("---LAYOUT_P:0---",lang);
  if (!LANG_CHECK(lang)) {
    console.log("---LAYOUT_P:nf---",lang);
    notFound();
  }
  console.log("---LAYOUT_P:1---",lang);
  return (
    <html
      lang={LANGUAGE_DATA.lang[lang]}
      dir={LANGUAGE_DATA.direction[lang]}
      className={textFont.variable + " " + titleFont.variable}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <Providers LANG={lang}>
          {children}
        </Providers>
      </body>
    </html>
  );
}