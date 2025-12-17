
/* --- Base ------------------------------------------------------------------------------------- */
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { BACE_SEO, ROBOTS_OFF, SITE_VIEWPORT } from "@/data/metadata";
/* --- Constants -------------------------------------------------------------------------------- */
export const metadata: Metadata = { ...ROBOTS_OFF, ...BACE_SEO };
export const viewport: Viewport = SITE_VIEWPORT;
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Base Layout -------------------------------------------------- */
export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children
}
