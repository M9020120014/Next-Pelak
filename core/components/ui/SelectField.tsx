"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn, ThemeInputConfig, SizeRoundedConfig, ThemeFocusConfig, SizeButtonConfig } from "./Pelak"
import { Icon } from "./Icon"

/* --- Types ------------------------------------------------------------------------------------ */
interface SelectFieldOption {
  value: string
  label: string
}

interface SelectFieldProps {
  value: string | null
  onChange: (value: string | null) => void
  options: SelectFieldOption[]
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  className?: string
}

/* --- SelectField Component -------------------------------------------------------------------- */
export function SelectField({
  value,
  onChange,
  options,
  placeholder = "انتخاب کنید...",
  required = false,
  error,
  disabled = false,
  className,
}: SelectFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === "" ? null : e.target.value
    onChange(newValue)
  }

  return (
    <div className={cn("relative", className)}>
      <select
        value={value || ""}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        className={cn(
          ThemeInputConfig.Base,
          ThemeInputConfig.Props[ThemeInputConfig.DefaultProps].Base,
          ThemeInputConfig.Props[ThemeInputConfig.DefaultProps].Items[ThemeInputConfig.Default],
          ThemeFocusConfig.Base,
          ThemeFocusConfig.Items[ThemeFocusConfig.Default],
          SizeRoundedConfig.Items[SizeRoundedConfig.Default],
          SizeButtonConfig.Items[SizeButtonConfig.Default],
          "appearance-none cursor-pointer",
          "bg-Lightness border border-Border",
          "text-Text",
          value ? "text-Text" : "text-Mid",
          error && "border-red-500 focus-visible:border-red-600 focus-visible:ring-red-500/40",
          required && !value && !error && "border-red-500",
          disabled && "cursor-not-allowed opacity-40",
          className
        )}
      >
        <option value="" disabled={required}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute end-012-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Icon 
          Icon="back" 
          Stroke="sm" 
          className={cn(
            "size-4 text-Mid",
            "rotate-90",
            disabled && "opacity-40"
          )} 
        />
      </div>
    </div>
  )
}

