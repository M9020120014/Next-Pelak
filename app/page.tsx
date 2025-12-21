
/* --- Base ------------------------------------------------------------------------------------- */
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE } from "@/config/site";
import { HOME_SEO_LANG, ROBOTS_ON } from "@/data/metadata";
/* --- Constants -------------------------------------------------------------------------------- */
const HOME_SEO = HOME_SEO_LANG(LANGUAGE.default)
export const metadata: Metadata = { ...ROBOTS_ON, ...HOME_SEO };
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Base Page ---------------------------------------------------- */
export default function BasePage() {
redirect("/"+LANGUAGE.default);
}
