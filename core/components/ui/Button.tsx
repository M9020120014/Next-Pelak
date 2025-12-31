"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { Slot, ClassName as cn, ThemeButtonConfig, RoundedConfig, FocusConfig, SizeConfig } from "./Pelak"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Button ------------------------------------------------------- */
export function Button({
  ThemeProps = ThemeButtonConfig.DefaultProps,
  Theme = ThemeButtonConfig.Default,
  Rounded = RoundedConfig.Default,
  Focus = FocusConfig.Default,
  Size = SizeConfig.Default,
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  ThemeProps?: keyof typeof ThemeButtonConfig.Props
  Theme?: keyof typeof ThemeButtonConfig.Props[typeof ThemeButtonConfig.DefaultProps]["Items"]
  Rounded?: keyof typeof RoundedConfig.Items
  Focus?: keyof typeof FocusConfig.Items
  Size?: keyof typeof SizeConfig.Items
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
        (Focus !== "none") && FocusConfig.Base,
        FocusConfig.Items[Focus],
        (Rounded !== "none") && RoundedConfig.Items[Rounded],
        (Size !== "none") && SizeConfig.Items[Size],
        className,
      )}
      {...props}
    />
  )
}