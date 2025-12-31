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
      data-slot="container"
      className={cn(
        "bg-Background",
        (Padding !== "none") && PaddingConfig.Items[Padding][0],
        SectionClassName
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto",
          (Padding !== "none") && PaddingConfig.Items[Padding][1],
          (Gaps !== "none") && GapsConfig.Items[Gaps],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </section>
  )
}

