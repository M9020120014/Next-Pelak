/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next";
import { headers } from "next/headers";
import { defaultTextFont, defaultTitleFont } from "@/lib/asset/fonts";
/* --- Components ------------------------------------------------------------------------------- */
import Providers from "@/components/provider/Provider";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE_DATA, LANG_PARAMS, LANG_CHILDREN_PARAMS, LANG } from "@/config/site";
import { BACE_SEO_LANG } from "@/data/metadata/metadata";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Locale Layout Metadata --------------------------------------- */
export async function generateMetadata({ params }: LANG_PARAMS): Promise<Metadata> {
  const { lang } = await LANG(params);
  return BACE_SEO_LANG(lang);
};
/* --- Locale Layout ------------------------------------------------ */
export default async function LocaleLayout({ children, params }: LANG_CHILDREN_PARAMS) {
  const { lang } = await LANG(params);
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || headersList.get('X-CSP-Nonce') || null;
  
  return (
    <html
      lang={LANGUAGE_DATA.lang[lang]}
      dir={LANGUAGE_DATA.direction[lang]}
      className={defaultTextFont.variable + " " + defaultTitleFont.variable}
      suppressHydrationWarning
      {...(nonce && { nonce })}
    >
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}