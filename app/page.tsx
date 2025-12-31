
/* --- Base ------------------------------------------------------------------------------------- */
import { Metadata } from 'next';
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE, LANGUAGE_LIST } from "@/core/config/site";
import { LANGUAGE_DATA } from "@/core/config/site";
import { BACE_SEO_LANG, HOME_SEO_LANG, ROBOTS_ON } from "@/project/data/metadata/metadata";
import { headers } from "next/headers";
import { Font } from "@/core/lib/fonts";
import Providers from "@/core/components/provider/Provider";
import Home from "@/project/pages/Home";
import { HeaderProvider } from '@/project/components/theme/header/HeaderProvider';
import Footer from '@/project/components/theme/footer/Footer';
import Navbar from '@/project/components/theme/navbar/Navbar';
/* --- Constants -------------------------------------------------------------------------------- */
const HOME_SEO = HOME_SEO_LANG(LANGUAGE.default)
export const metadata: Metadata = { ...BACE_SEO_LANG(LANGUAGE.default), ...HOME_SEO, ...ROBOTS_ON };
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Base Page ---------------------------------------------------- */
export default async function BasePage() {

  const otherLanguages = LANGUAGE_LIST.filter((l) => l !== LANGUAGE.default);
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || headersList.get('X-CSP-Nonce') || null;
  const direction = LANGUAGE_DATA.direction[LANGUAGE.default];
  const fonts = Font[direction];

  return (
    <html
      lang={LANGUAGE_DATA.lang[LANGUAGE.default]}
      dir={direction}
      className={`${fonts.text.variable} ${fonts.title.variable}`}
      suppressHydrationWarning
      {...(nonce && { nonce })}
    >
      <body className="antialiased">
        <Providers>
        <HeaderProvider lang={LANGUAGE.default}>
            <Navbar />
            <Home lang={LANGUAGE_DATA.lang[LANGUAGE.default]} otherLanguages={otherLanguages} />
            <Footer />
          </HeaderProvider>
        </Providers>
      </body>
    </html>
  )
}

