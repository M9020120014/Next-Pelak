"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useState } from "react"
import { ThemeInputConfig, SizeRoundedConfig, ThemeFocusConfig, SizeButtonConfig} from "./Pelak"
import { Input } from "./Input"
import { Button } from "./Button"
import { Icon } from "./Icon"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- InputSecret -------------------------------------------------------- */
export function InputSecret({
  ThemeProps = ThemeInputConfig.DefaultProps,
  Theme = ThemeInputConfig.Default,
  Rounded = SizeRoundedConfig.Default,
  Focus = ThemeFocusConfig.Default,
  Size = SizeButtonConfig.Default,
  className,
  ...props
}: React.ComponentProps<"input"> & {
  ThemeProps?: keyof typeof ThemeInputConfig.Props
  Theme?: keyof typeof ThemeInputConfig.Props[typeof ThemeInputConfig.DefaultProps]["Items"]
  Rounded?: keyof typeof SizeRoundedConfig.Items
  Focus?: keyof typeof ThemeFocusConfig.Items
  Size?: keyof typeof SizeButtonConfig.Items
}) {
  const [showPassword, setShowPassword] = useState(false)

  /* --- Run ------------------------ */
  return (
    <div className="relative">
      <Input
        ThemeProps={ThemeProps}
        Theme={Theme}
        Rounded={Rounded}
        Focus={Focus}
        Size={Size}
        type={showPassword ? "text" : "password"}
        className={className}
        {...props}
      />
      <Button
        ThemeProps="ghost"
        Theme="light"
        Size={Size}
        type="button"
        className="absolute top-0 bottom-0 ltr:right-0 rtl:left-0"
        onClick={() => setShowPassword(!showPassword)}
      >
        <Icon Icon={showPassword ? "EyeOff" : "Eye"} Stroke="md" />
      </Button>
    </div>
  )
}

