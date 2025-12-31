"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn, SvgStrokeSizeConfig, SvgSizeConfig } from './Pelak';
import { Svg } from './icons/Icons';
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Icon --------------------------------------------------------- */
export function Icon({
  Size = SvgStrokeSizeConfig.Default,
  Icon = "default",
  Stroke = SvgStrokeSizeConfig.Default,
  BackColor = "currentColor",
  active = false,
  activeFit = false,
  className,
  ...props
}: React.ComponentProps<"svg"> & {
  Icon?: keyof typeof Svg
  Size?: keyof typeof SvgSizeConfig.Items
  Stroke?: keyof typeof SvgStrokeSizeConfig.Items
  BackColor?: string
  active?: boolean
  activeFit?: boolean
}) {
  /* --- Run ------------------------- */
  return (
    <svg
      data-slot="icon"
      className={cn(className, SvgSizeConfig.Items[Size])}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 50 50"
      {...props}
    >
      {(active || activeFit) &&
        <g fill={BackColor} stroke={BackColor} strokeWidth={active ? 12 : 0} opacity={SvgStrokeSizeConfig.Base}>
          {Svg[Icon].active}
        </g>
      }
      <g strokeWidth={SvgStrokeSizeConfig.Items[Stroke]} fill="none" stroke="currentColor">
        {Svg[Icon].shape}
      </g>
    </svg>
  )
}