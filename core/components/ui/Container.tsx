"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn, PaddingConfig, GapsConfig } from "./Pelak"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Container ------------------------------------------------------- */
export function Container({
  Padding = PaddingConfig.Default,
  Gaps = GapsConfig.Default,
  SectionClassName,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  Padding?: keyof typeof PaddingConfig.Items
  Gaps?: keyof typeof GapsConfig.Items
  SectionClassName?: string
  children?: React.ReactNode
}) {
  /* --- Run ------------------------ */
  return (

    <section
      className={cn(
        "max-w-7xl mx-auto flex flex-col",
        (Padding !== "none") && PaddingConfig.Items[Padding],
        GapsConfig.Items[Gaps][Padding],
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

