
/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
/* --- Lib -------------------------------------------------------------------------------------- */
import { getJsonLd } from "@/libs/schema";
/* --- Data ------------------------------------------------------------------------------------- */
import { HOME_SEO, ROBOTS_ON } from "@/data/metadata";
/* --- Constants -------------------------------------------------------------------------------- */
export const metadata: Metadata = { ...ROBOTS_ON, ...HOME_SEO };
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Home Page -------------------------------------------------- */
export default function HomePage() {
  return (
    <>
      {/* --- Schema-DTS ----------- */}
      <Script
        id="structured-data" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getJsonLd()) }}
      />
      {/* --- Main Content --------- */}
      <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
        <h1 className="text-Mid">Next PELAK Design System</h1>
        <Link href="/fa">فارسی</Link>
        <Link href="/en">English</Link>
      </main>
    </>
  );
}
