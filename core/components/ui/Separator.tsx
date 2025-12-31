"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn } from "./Pelak"

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Separator ------------------------------------------------------- */
function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="separator"
      className={cn(
        "bg-Border shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
}

export { Separator }

