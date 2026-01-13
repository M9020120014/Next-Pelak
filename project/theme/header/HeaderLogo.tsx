"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link"
/* --- Components ------------------------------------------------------------------------------- */
import { SvgLogoType } from "@/site/media/svg"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/core/config/lang"

export default function HeaderLogo({ lang }: { lang: LANGUAGE_TYPE }) {
  return (
    <>
      <Link
        href={lang === "fa" ? "/" : `/${lang}`}
        className="flex justify-center"
      >
        <SvgLogoType className="text-Primary max-h-10 w-full h-full" />
      </Link>
    </>
  )
}

