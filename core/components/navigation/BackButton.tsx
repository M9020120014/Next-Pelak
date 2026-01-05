"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useRouter } from "next/navigation"
import { UI as P } from "@/core/components/ui/Pelak"
import { ClassName as cn } from "@/core/components/ui/Pelak"
import { LANGUAGE_TYPE } from "@/project/config/site"

/* --- Types ------------------------------------------------------------------------------------ */
export interface BackButtonProps {
  pDirection?: "left" | "right"
  className?: string
  lang: LANGUAGE_TYPE
}

/* --- Functions -------------------------------------------------------------------------------- */
/* --- BackButton ------------------------------------------------------- */
export default function BackButton({
  pDirection = "left",
  className,
  lang,
}: BackButtonProps) {
  const router = useRouter()

  const translator = {
    fa: {
      back: "بازگشت",
    },
    en: {
      back: "Back",
    },
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <P.Button
      Theme="primary"
      ThemeProps="ghost"
      Size="lg"
      onClick={handleBack}
      className={cn(className)}
      aria-label="Go back"
    >
      <P.Icon
        Icon="back"
        Size="none"
        className={cn(
          pDirection === "left" && "rotate-180"
        )}
      />
      {translator[lang].back}
    </P.Button>
  )
}

