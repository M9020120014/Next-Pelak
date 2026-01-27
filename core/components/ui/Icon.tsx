"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn, SizeSvgStrokeConfig, SizeSvgConfig } from './Pelak';
import { Svg } from './icons/Icons';
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Icon --------------------------------------------------------- */
export function Icon({
  Size = SizeSvgStrokeConfig.Default,
  Icon = "default",
  Stroke = SizeSvgStrokeConfig.Default,
  BackColor = "currentColor",
  active = false,
  activeFit = false,
  className,
  ...props
}: React.ComponentProps<"svg"> & {
  Icon?: keyof typeof Svg
  Size?: keyof typeof SizeSvgConfig.Items
  Stroke?: keyof typeof SizeSvgStrokeConfig.Items
  BackColor?: string
  active?: boolean
  activeFit?: boolean
}) {
  /* --- Run ------------------------- */
  return (
    <svg
      data-slot="icon"
      className={cn(className, SizeSvgConfig.Items[Size])}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 50 50"
      {...props}
    >
      {(active || activeFit) &&
        <g fill={BackColor} stroke={BackColor} strokeWidth={active ? 12 : 0} opacity={SizeSvgStrokeConfig.Base}>
          {Svg[Icon].active}
        </g>
      }
      <g strokeWidth={SizeSvgStrokeConfig.Items[Stroke]} fill="none" stroke="currentColor">
        {Svg[Icon].shape}
      </g>
    </svg>
  )
}