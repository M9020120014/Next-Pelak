"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn } from "./Pelak"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Skeleton ------------------------------------------------------- */
function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse bg-Mid/20 rounded",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

