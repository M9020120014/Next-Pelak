"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn, RoundedConfig } from "./Pelak"

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Card ------------------------------------------------------- */
function Card({
  className,
  Rounded = RoundedConfig.Default,
  ...props
}: React.ComponentProps<"div"> & {
  Rounded?: keyof typeof RoundedConfig.Items
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-Background border border-Border shadow-sm",
        (Rounded !== "none") && RoundedConfig.Items[Rounded],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-lg leading-none font-semibold text-Text", className)}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("text-Mid", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
}

