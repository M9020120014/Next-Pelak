"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { ClassName as cn } from "@/core/components/ui/Pelak"
import BackButton from "@/core/components/navigation/BackButton"
import { SvgLogoType } from "@/project/components/media/svg"
import { LANGUAGE_DATA, LANGUAGE_TYPE } from "@/core/config/site"

/* --- Types ------------------------------------------------------------------------------------ */
export interface HeaderItemProps {
  pCenter?: React.ReactNode
  pRight?: React.ReactNode
  pLeft?: React.ReactNode
}

/* --- Constants -------------------------------------------------------------------------------- */
const HeaderContext = createContext<{
  setHeader: (config: Partial<HeaderItemProps>) => void
  resetHeader: () => void
}>({
  setHeader: () => { },
  resetHeader: () => { },
})

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Header Provider ---------------------------------------------- */
export function HeaderProvider({ children, lang }: { children: React.ReactNode, lang: LANGUAGE_TYPE }) {
  /* --- Hooks ---------------------- */
  const direction = LANGUAGE_DATA.direction[lang]

  const DEFAULT_HEADER: HeaderItemProps = useMemo(
    () => ({
      pCenter: <SvgLogoType className="text-Primary max-h-10" />,
      pRight: <BackButton pDirection={direction === "rtl" ? "right" : "left"} lang={lang} />,
      pLeft: "",
    }),
    [direction, lang]
  )

  const [config, setConfig] = useState<HeaderItemProps>(DEFAULT_HEADER)

  const setHeader = useCallback(
    (newConfig: Partial<HeaderItemProps>) => {
      setConfig((prev) => ({ ...prev, ...newConfig }))
    },
    []
  )

  const resetHeader = useCallback(() => {
    setConfig(DEFAULT_HEADER)
  }, [DEFAULT_HEADER])

  const value = useMemo(
    () => ({ setHeader, resetHeader }),
    [setHeader, resetHeader]
  )

  /* --- Run ------------------------ */
  return (
    <HeaderContext.Provider value={value}>
      {/* --- Header -------------- */}
      <header
        data-slot="header"
        className={cn(
          "sticky top-0 z-99999 w-full border-b border-Border bg-Background"
        )}
      >
        <div className={cn(
          "lg:max-w-7xl mx-auto flex h-14 lg:h-056-M items-center justify-between px-4 lg:px-012-3"
        )}>
          {/* Left Section */}
          <div className="flex items-center justify-start flex-1">
            {config.pRight}
          </div>

          {/* Center Section */}
          <div className="flex items-center justify-center flex-1">
            {config.pCenter}
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-end flex-1">
            {config.pLeft}
          </div>
        </div>
      </header>
      {/* --- Body ----------------- */}
      {children}
    </HeaderContext.Provider>
  )
}

/* --- Header Hook -------------------------------------------------- */
export const useHeader = () => useContext(HeaderContext)

