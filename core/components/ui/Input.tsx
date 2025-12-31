"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn, ThemeInputConfig, RoundedConfig, FocusConfig, SizeConfig } from "./Pelak"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Input -------------------------------------------------------- */
export function Input({
  ThemeProps = ThemeInputConfig.DefaultProps,
  Theme = ThemeInputConfig.Default,
  Rounded = RoundedConfig.Default,
  Focus = FocusConfig.Default,
  Size = SizeConfig.Default,
  className,
  type,
  ...props
}: React.ComponentProps<"input"> & {
  ThemeProps?: keyof typeof ThemeInputConfig.Props
  Theme?: keyof typeof ThemeInputConfig.Props[typeof ThemeInputConfig.DefaultProps]["Items"]
  Rounded?: keyof typeof RoundedConfig.Items
  Focus?: keyof typeof FocusConfig.Items
  Size?: keyof typeof SizeConfig.Items
}) {
  /* --- Run ------------------------ */
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        (Theme !== "none") && ThemeInputConfig.Base,
        ThemeInputConfig.Props[ThemeProps].Items[Theme],
        (Focus !== "none") && FocusConfig.Base,
        FocusConfig.Items[Focus],
        (Rounded !== "none") && RoundedConfig.Items[Rounded],
        (Size !== "none") && SizeConfig.Items[Size],
        className
      )}
      {...props}
    />
  )
}