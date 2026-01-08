"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link"
/* --- Components ------------------------------------------------------------------------------- */
import { SvgLogoType } from "@/project/components/media/svg"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/project/config/site"

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

