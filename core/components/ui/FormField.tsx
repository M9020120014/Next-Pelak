"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { ClassName as cn } from "./Pelak"

/* --- Types ------------------------------------------------------------------------------------ */
interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

/* --- FormField Component --------------------------------------------------------------------- */
export function FormField({
  label,
  required = false,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-semibold text-Text">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}

