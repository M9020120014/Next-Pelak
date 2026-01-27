"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn, ThemeInputConfig, SizeRoundedConfig, ThemeFocusConfig, SizeButtonConfig } from "./Pelak"

/* --- Types ------------------------------------------------------------------------------------ */
interface TextareaFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  rows?: number
  disabled?: boolean
  className?: string
}

/* --- TextareaField Component ----------------------------------------------------------------- */
export function TextareaField({
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 5,
  disabled = false,
  className,
}: TextareaFieldProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      aria-invalid={!!error}
      className={cn(
        ThemeInputConfig.Base,
        ThemeInputConfig.Props[ThemeInputConfig.DefaultProps].Base,
        ThemeInputConfig.Props[ThemeInputConfig.DefaultProps].Items[ThemeInputConfig.Default],
        ThemeFocusConfig.Base,
        ThemeFocusConfig.Items[ThemeFocusConfig.Default],
        SizeRoundedConfig.Items[SizeRoundedConfig.Default],
        SizeButtonConfig.Items[SizeButtonConfig.Default],
        "resize-none h-072-9",
        error && "border-red-500 focus-visible:border-red-600 focus-visible:ring-red-500/40",
        required && !value && !error && "border-red-500",
        className
      )}
    />
  )
}

