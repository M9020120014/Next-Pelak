"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn, ThemeInputConfig, SizeRoundedConfig, ThemeFocusConfig, SizeButtonConfig } from "./Pelak"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Input -------------------------------------------------------- */
export function Input({
  ThemeProps = ThemeInputConfig.DefaultProps,
  Theme = ThemeInputConfig.Default,
  Rounded = SizeRoundedConfig.Default,
  Focus = ThemeFocusConfig.Default,
  Size = SizeButtonConfig.Default,
  className,
  type,
  ...props
}: React.ComponentProps<"input"> & {
  ThemeProps?: keyof typeof ThemeInputConfig.Props
  Theme?: keyof typeof ThemeInputConfig.Props[typeof ThemeInputConfig.DefaultProps]["Items"]
  Rounded?: keyof typeof SizeRoundedConfig.Items
  Focus?: keyof typeof ThemeFocusConfig.Items
  Size?: keyof typeof SizeButtonConfig.Items
}) {
  /* --- Run ------------------------ */
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        (Theme !== "none") && ThemeInputConfig.Base,
        ThemeInputConfig.Props[ThemeProps].Items[Theme],
        (Focus !== "none") && ThemeFocusConfig.Base,
        ThemeFocusConfig.Items[Focus],
        (Rounded !== "none") && SizeRoundedConfig.Items[Rounded],
        (Size !== "none") && SizeButtonConfig.Items[Size],
        className
      )}
      {...props}
    />
  )
}