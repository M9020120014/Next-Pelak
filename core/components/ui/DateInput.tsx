"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useState, useEffect } from 'react'
import { ClassName as cn } from "./Pelak"
import { Input } from "./Input"
import { validateShortDate } from "@/core/lib/validation"
import { greToPer } from "@/core/lib/date"

/* --- Types ------------------------------------------------------------------------------------ */
interface DateInputProps {
  value?: string // فرمت: YYYY-MM-DD (شمسی یا میلادی)
  onChange: (date: string | null) => void // فرمت خروجی: YYYY-MM-DD (شمسی)
  placeholder?: string
  required?: boolean
  className?: string
  disabled?: boolean
  error?: string
}

/* --- DateInput Component ---------------------------------------------------------------------- */
export function DateInput({
  value,
  onChange,
  placeholder = "تاریخ تولد",
  required = false,
  className,
  disabled = false,
  error,
}: DateInputProps) {
  const [year, setYear] = useState<string>("")
  const [month, setMonth] = useState<string>("")
  const [day, setDay] = useState<string>("")
  const [localError, setLocalError] = useState<string>("")

  // Parse value when it changes (could be Persian or Gregorian)
  useEffect(() => {
    if (value) {
      // Try to parse as Persian date first
      const normalized = value.trim().replace(/\//g, '-')
      const datePart = normalized.split(/[\sT]/)[0]
      const [y, m, d] = datePart.split('-').map(Number)
      
      // Check if it's Persian (year < 2000) or Gregorian
      if (y >= 1000 && y < 2000) {
        // Persian date
        setYear(y.toString())
        setMonth(m.toString().padStart(2, '0'))
        setDay(d.toString().padStart(2, '0'))
      } else if (y >= 1000 && y < 3000) {
        // Gregorian date - convert to Persian
        const persianDate = greToPer(value)
        const persianDatePart = persianDate.split(/[\sT]/)[0]
        const [py, pm, pd] = persianDatePart.split('-').map(Number)
        setYear(py.toString())
        setMonth(pm.toString().padStart(2, '0'))
        setDay(pd.toString().padStart(2, '0'))
      }
    } else {
      setYear("")
      setMonth("")
      setDay("")
    }
  }, [value])

  const formatDate = (y: string, m: string, d: string): string | null => {
    if (!y || !m || !d) return null
    
    const yearNum = parseInt(y, 10)
    const monthNum = parseInt(m, 10)
    const dayNum = parseInt(d, 10)
    
    if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return null
    
    // Format as YYYY-MM-DD (Persian)
    return `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') // Only digits
    if (val === '' || (parseInt(val, 10) >= 1300 && parseInt(val, 10) <= 1500)) {
      setYear(val)
      const newDate = formatDate(val, month, day)
      if (newDate) {
        const validation = validateShortDate(newDate)
        if (!validation.success) {
          setLocalError(validation.message)
        } else {
          setLocalError("")
        }
        onChange(newDate)
      } else {
        onChange(null)
        setLocalError("")
      }
    }
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') // Only digits
    if (val === '' || (parseInt(val, 10) >= 1 && parseInt(val, 10) <= 12)) {
      setMonth(val)
      const newDate = formatDate(year, val, day)
      if (newDate) {
        const validation = validateShortDate(newDate)
        if (!validation.success) {
          setLocalError(validation.message)
        } else {
          setLocalError("")
        }
        onChange(newDate)
      } else {
        onChange(null)
        setLocalError("")
      }
    }
  }

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') // Only digits
    if (val === '' || (parseInt(val, 10) >= 1 && parseInt(val, 10) <= 31)) {
      setDay(val)
      const newDate = formatDate(year, month, val)
      if (newDate) {
        const validation = validateShortDate(newDate)
        if (!validation.success) {
          setLocalError(validation.message)
        } else {
          setLocalError("")
        }
        onChange(newDate)
      } else {
        onChange(null)
        setLocalError("")
      }
    }
  }

  const displayError = error || localError

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            سال
          </label>
          <Input
            type="text"
            value={year}
            onChange={handleYearChange}
            placeholder="1400"
            disabled={disabled}
            maxLength={4}
            className={cn(
              "w-full",
              required && !year && "border-red-500",
              displayError && "border-red-500"
            )}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ماه
          </label>
          <Input
            type="text"
            value={month}
            onChange={handleMonthChange}
            placeholder="01"
            disabled={disabled}
            maxLength={2}
            className={cn(
              "w-full",
              required && !month && "border-red-500",
              displayError && "border-red-500"
            )}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            روز
          </label>
          <Input
            type="text"
            value={day}
            onChange={handleDayChange}
            placeholder="01"
            disabled={disabled}
            maxLength={2}
            className={cn(
              "w-full",
              required && !day && "border-red-500",
              displayError && "border-red-500"
            )}
          />
        </div>
      </div>
      {displayError && (
        <p className="text-sm text-red-600">{displayError}</p>
      )}
    </div>
  )
}

