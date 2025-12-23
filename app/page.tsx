
/* --- Base ------------------------------------------------------------------------------------- */
import { Metadata } from 'next';
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE } from "@/config/site";
import { HOME_SEO_LANG, ROBOTS_ON } from "@/data/metadata/metadata";
import Link from 'next/link';
/* --- Constants -------------------------------------------------------------------------------- */
const HOME_SEO = HOME_SEO_LANG(LANGUAGE.default)
export const metadata: Metadata = { ...ROBOTS_ON, ...HOME_SEO };
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Base Page ---------------------------------------------------- */
export default function BasePage() {
  return (
    <html>
      <body>
        <div>
          <h1>Hello World</h1>
          <Link href="/fa">Home</Link>
        </div>
      </body>
    </html>
  )
}
