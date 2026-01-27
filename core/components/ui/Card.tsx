"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import {
  ClassName as cn,
  SizeRoundedConfig,
  SizePaddingConfig,
  SizeBorderConfig,
  ThemeBorderConfig,
  ThemeBackgroundConfig
} from "./Pelak"

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Card ------------------------------------------------------- */
export function Card({
  className,
  Background = ThemeBackgroundConfig.Default,
  Rounded = SizeRoundedConfig.Default,
  Border = SizeBorderConfig.Default,
  BorderColor = ThemeBorderConfig.Default,
  ...props
}: React.ComponentProps<"div"> & {
  Background?: keyof typeof ThemeBackgroundConfig.Items
  Rounded?: keyof typeof SizeRoundedConfig.Items
  Border?: keyof typeof SizeBorderConfig.Items.all
  BorderColor?: keyof typeof ThemeBorderConfig.Items
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        (Background !== "none") && ThemeBackgroundConfig.Items[Background],
        (Rounded !== "none") && SizeRoundedConfig.Items[Rounded],
        (Border !== "none") && SizeBorderConfig.Items.all[Border],
        (BorderColor !== "none") && ThemeBorderConfig.Items[BorderColor],
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  Padding = SizePaddingConfig.Default,
  Border = SizeBorderConfig.Default,
  BorderColor = ThemeBorderConfig.Default,
  ...props
}: React.ComponentProps<"div"> & {
  Padding?: keyof typeof SizePaddingConfig.Items
  Border?: keyof typeof SizeBorderConfig.Items.bottom
  BorderColor?: keyof typeof ThemeBorderConfig.Items
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col",
        (Border !== "none") && SizeBorderConfig.Items.bottom[Border],
        (BorderColor !== "none") && ThemeBorderConfig.Items[BorderColor],
        (Padding !== "none") && SizePaddingConfig.Items[Padding],
        className
      )}
      {...props}
    />
  )
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-lg leading-none text-Text", 
        className
      )}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "text-sm text-Mid",
        className
      )}
      {...props}
    />
  )
}

export function CardContent({
  className,
  Padding = SizePaddingConfig.Default,
  ...props
}: React.ComponentProps<"div"> & {
  Padding?: keyof typeof SizePaddingConfig.Items
}) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "text-Mid",
        (Padding !== "none") && SizePaddingConfig.Items[Padding],
        className
      )}
      {...props}
    />
  )
}

export function CardFooter({
  className,
  Padding = SizePaddingConfig.Default,
  Border = SizeBorderConfig.Default,
  BorderColor = ThemeBorderConfig.Default,
  ...props
}: React.ComponentProps<"div"> & {
  Padding?: keyof typeof SizePaddingConfig.Items
  Border?: keyof typeof SizeBorderConfig.Items.top
  BorderColor?: keyof typeof ThemeBorderConfig.Items
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center",
        (Border !== "none") && SizeBorderConfig.Items.top[Border],
        (BorderColor !== "none") && ThemeBorderConfig.Items[BorderColor],
        (Padding !== "none") && SizePaddingConfig.Items[Padding],
        className
      )}
      {...props}
    />
  )
}