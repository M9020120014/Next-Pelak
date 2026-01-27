"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { Slot, ClassName as cn, ThemeButtonConfig, SizeRoundedConfig, ThemeFocusConfig, SizeButtonConfig } from "./Pelak"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Button ------------------------------------------------------- */
export function Button({
  ThemeProps = ThemeButtonConfig.DefaultProps,
  Theme = ThemeButtonConfig.Default,
  Rounded = SizeRoundedConfig.Default,
  Focus = ThemeFocusConfig.Default,
  Size = SizeButtonConfig.Default,
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  ThemeProps?: keyof typeof ThemeButtonConfig.Props
  Theme?: keyof typeof ThemeButtonConfig.Props[typeof ThemeButtonConfig.DefaultProps]["Items"]
  Rounded?: keyof typeof SizeRoundedConfig.Items
  Focus?: keyof typeof ThemeFocusConfig.Items
  Size?: keyof typeof SizeButtonConfig.Items
  asChild?: boolean
}) {

  const Comp = asChild ? Slot : "button"

  /* --- Run ------------------------ */
  return (
    <Comp
      data-slot="button"
      className={cn(
        (Theme !== "none") && ThemeButtonConfig.Base,
        (Theme !== "none") && ThemeButtonConfig.Props[ThemeProps].Base,
        ThemeButtonConfig.Props[ThemeProps].Items[Theme],
        (Focus !== "none") && ThemeFocusConfig.Base,
        ThemeFocusConfig.Items[Focus],
        (Rounded !== "none") && SizeRoundedConfig.Items[Rounded],
        (Size !== "none") && SizeButtonConfig.Items[Size],
        className,
      )}
      {...props}
    />
  )
}