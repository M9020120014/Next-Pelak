"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn, BaseFlexConfig, SizePaddingConfig, SizeGapsConfig, SizeMaxWidthConfig } from "./Pelak"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Container ------------------------------------------------------- */
export function Container({
  Flex = BaseFlexConfig.Default,
  MaxWidth = SizeMaxWidthConfig.Default,
  Padding = SizePaddingConfig.Default,
  Gaps = SizeGapsConfig.Default,
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  Flex?: keyof typeof BaseFlexConfig.Items
  MaxWidth?: keyof typeof SizeMaxWidthConfig.Items
  Padding?: keyof typeof SizePaddingConfig.Items
  Gaps?: keyof typeof SizeGapsConfig.Items
  children?: React.ReactNode
}) {
  /* --- Run ------------------------ */
  return (

    <section
      className={cn(
        (Flex !== "none") && BaseFlexConfig.Base + " " + BaseFlexConfig.Items[Flex],
        (MaxWidth !== "none") && SizeMaxWidthConfig.Base + " " + SizeMaxWidthConfig.Items[MaxWidth],
        (Padding !== "none") && SizePaddingConfig.Items[Padding],
        (Padding !== "none") && SizeGapsConfig.Items[Gaps][Padding],
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

