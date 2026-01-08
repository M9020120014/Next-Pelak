"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useState, useEffect, useMemo, useRef, startTransition } from 'react'
import { ClassName as cn } from "./Pelak"
import { Input } from "./Input"
import { Button } from "./Button"
import { Icon } from "./Icon"
import * as Dialog from "./Dialog"
import { Skeleton } from "./Skeleton"
import { isJalaliLeapYear, greToPer, perToGre } from "@/core/lib/date"
import { validateShortDate } from "@/core/lib/validation"

/* --- Constants -------------------------------------------------------------------------------- */
const PERSIAN_MONTHS = [
  '', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

const PERSIAN_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

/* --- Types ------------------------------------------------------------------------------------ */
interface DatePickerProps {
  value?: string // فرمت: YYYY-MM-DD (شمسی)
  onChange: (date: string | null) => void // فرمت خروجی: YYYY-MM-DD (شمسی)
  mode?: 'popup' | 'inline'
  placeholder?: string
  required?: boolean
  className?: string
  disabled?: boolean
  error?: string
  isLoading?: boolean // نمایش اسکلتون به جای date picker
}

/* --- Helper Functions ------------------------------------------------------------------------ */
const getDaysInMonth = (year: number, month: number): number => {
  const leap = isJalaliLeapYear(year)
  const daysInMonth = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, leap ? 30 : 29]
  return daysInMonth[month]
}

const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const getFirstDayOfMonth = (year: number, month: number): number => {
  // Convert Persian date to Gregorian to get accurate weekday
  const persianDate = formatDate(year, month, 1)
  const gregorianDate = perToGre(persianDate)
  const gregorianDatePart = gregorianDate.split(/[\sT]/)[0]
  const [gy, gm, gd] = gregorianDatePart.split('-').map(Number)
  
  // Calculate weekday using JavaScript Date
  // Note: JavaScript Date uses 0 = Sunday, but Persian calendar starts with Saturday
  const date = new Date(gy, gm - 1, gd)
  let weekday = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Convert to Persian weekday (0 = Saturday, 1 = Sunday, ..., 6 = Friday)
  weekday = (weekday + 1) % 7
  
  return weekday
}

const parseDate = (dateStr: string | undefined): { year: number; month: number; day: number } | null => {
  if (!dateStr) return null
  
  const normalized = dateStr.trim().replace(/\//g, '-')
  const datePart = normalized.split(/[\sT]/)[0]
  const parts = datePart.split('-').map(Number)
  
  if (parts.length !== 3 || parts.some(isNaN)) return null
  
  const [y, m, d] = parts
  
  // Check if it's Persian date (year < 2000)
  if (y >= 1000 && y < 2000) {
    return { year: y, month: m, day: d }
  }
  
  // If Gregorian, convert to Persian
  if (y >= 1000 && y < 3000) {
    const persianDate = greToPer(dateStr)
    const persianDatePart = persianDate.split(/[\sT]/)[0]
    const [py, pm, pd] = persianDatePart.split('-').map(Number)
    return { year: py, month: pm, day: pd }
  }
  
  return null
}

/* --- Calendar Component (shadcn-style) -------------------------------------------------------- */
interface CalendarProps {
  year: number
  month: number
  selectedDate: { year: number; month: number; day: number } | null
  onDateSelect: (year: number, month: number, day: number) => void
}

function Calendar({ year, month, selectedDate, onDateSelect }: CalendarProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  
  const days = useMemo(() => {
    const daysArray: (number | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day)
    }
    
    return daysArray
  }, [daysInMonth, firstDay])
  
  const isSelected = (day: number | null) => {
    if (!day || !selectedDate) return false
    return selectedDate.year === year && 
           selectedDate.month === month && 
           selectedDate.day === day
  }
  
  return (
    <div className="p-3">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {PERSIAN_WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-Mid text-sm font-medium text-center py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isDaySelected = isSelected(day)
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => day && onDateSelect(year, month, day)}
              disabled={!day}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors mx-auto",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary focus-visible:ring-offset-2",
                !day && "cursor-default opacity-0 pointer-events-none",
                day && !isDaySelected && "text-Text hover:bg-Background hover:text-Text",
                day && isDaySelected && "bg-Primary text-PrimaryForeground hover:bg-PrimaryDark hover:text-PrimaryForeground focus:bg-Primary",
                day && !isDaySelected && "hover:bg-Background"
              )}
            >
              {day || ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* --- CalendarHeader Component --------------------------------------------------------------- */
interface CalendarHeaderProps {
  year: number
  month: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
}

function CalendarHeader({
  year,
  month,
  onYearChange,
  onMonthChange,
}: CalendarHeaderProps) {
  // Generate year options (1300 to 1400)
  const yearOptions = useMemo(() => {
    const years: { value: string; label: string }[] = []
    for (let y = 1300; y <= 1400; y++) {
      years.push({ value: y.toString(), label: y.toString() })
    }
    return years
  }, [])
  
  // Generate month options
  const monthOptions = useMemo(() => {
    return PERSIAN_MONTHS.slice(1).map((monthName, index) => ({
      value: (index + 1).toString(),
      label: monthName
    }))
  }, [])
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10)
    if (!isNaN(newYear)) {
      onYearChange(newYear)
    }
  }
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10)
    if (!isNaN(newMonth)) {
      onMonthChange(newMonth)
    }
  }
  
  return (
    <div className="flex items-center justify-center gap-2 px-3 pt-4">
      <div className="relative">
        <select
          value={year.toString()}
          onChange={handleYearChange}
          className={cn(
            "h-8 w-20 rounded-md border border-Border bg-White px-2 py-1 text-sm font-semibold text-Text",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary focus-visible:ring-offset-2",
            "cursor-pointer appearance-none"
          )}
        >
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon 
            Icon="back" 
            Stroke="sm" 
            className={cn("size-4 text-Mid", "rotate-90")}
          />
        </div>
      </div>
      
      <div className="relative">
        <select
          value={month.toString()}
          onChange={handleMonthChange}
          className={cn(
            "h-8 rounded-md border border-Border bg-White px-2 py-1 text-sm font-semibold text-Text",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary focus-visible:ring-offset-2",
            "cursor-pointer appearance-none min-w-[110px]"
          )}
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon 
            Icon="back" 
            Stroke="sm" 
            className={cn("size-4 text-Mid", "rotate-90")}
          />
        </div>
      </div>
    </div>
  )
}

/* --- DatePicker Component --------------------------------------------------------------------- */
export function DatePicker({
  value,
  onChange,
  mode = 'popup',
  placeholder = "تاریخ را انتخاب کنید",
  required = false,
  className,
  disabled = false,
  error,
  isLoading = false,
}: DatePickerProps) {
  // All hooks must be called before any early returns
  const parsedDate = parseDate(value)
  const currentDate = parsedDate || { year: 1403, month: 1, day: 1 }
  
  const [open, setOpen] = useState(false)
  const [localError, setLocalError] = useState<string>("")
  const [displayYear, setDisplayYear] = useState(currentDate.year)
  const [displayMonth, setDisplayMonth] = useState(currentDate.month)
  
  // Update display when dialog opens - show selected date if exists, otherwise keep current view
  // This allows users to navigate to different months/years even when a date is selected
  useEffect(() => {
    if (open) {
      if (parsedDate) {
        // When dialog opens with a selected date, navigate to that date's month/year
        startTransition(() => {
          setDisplayYear(parsedDate.year)
          setDisplayMonth(parsedDate.month)
        })
      }
      // If no date selected, keep the current displayYear/displayMonth (user can navigate freely)
    }
  }, [open]) // Only update when dialog opens/closes, not when parsedDate changes
  
  // Update display when value prop changes from outside (parent component changes the value)
  const prevValueRef = useRef(value)
  useEffect(() => {
    if (prevValueRef.current !== value && parsedDate) {
      // Value changed from outside, update display to show the new date
      startTransition(() => {
        setDisplayYear(parsedDate.year)
        setDisplayMonth(parsedDate.month)
      })
    }
    prevValueRef.current = value
  }, [value, parsedDate])
  
  // Show skeleton if isLoading is true
  if (isLoading) {
    return (
      <div className={cn("relative", className)}>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    )
  }
  
  const handleDateSelect = (year: number, month: number, day: number) => {
    const dateStr = formatDate(year, month, day)
    const validation = validateShortDate(dateStr)
    
    if (validation.success) {
      setLocalError("")
      onChange(dateStr)
      if (mode === 'popup') {
        setOpen(false)
      }
    } else {
      setLocalError(validation.message)
    }
  }
  
  const handleYearChange = (year: number) => {
    setDisplayYear(year)
  }
  
  const handleMonthChange = (month: number) => {
    setDisplayMonth(month)
  }
  
  const handleClear = () => {
    setLocalError("")
    onChange(null)
    if (mode === 'popup') {
      setOpen(false)
    }
  }
  
  const formatDisplayDate = () => {
    if (!parsedDate) return ""
    return `${parsedDate.year}/${String(parsedDate.month).padStart(2, '0')}/${String(parsedDate.day).padStart(2, '0')}`
  }
  
  const displayError = error || localError
  
  const calendarContent = (
    <div className={cn("", mode === 'popup' && "min-w-[320px]")}>
      <CalendarHeader
        year={displayYear}
        month={displayMonth}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
      />
      <Calendar
        year={displayYear}
        month={displayMonth}
        selectedDate={parsedDate}
        onDateSelect={handleDateSelect}
      />
      {(parsedDate || displayError) && (
        <div className="flex items-center justify-between px-3 pb-3 pt-2 border-t border-Border">
          {parsedDate && (
            <Button
              type="button"
              onClick={handleClear}
              className="text-sm h-7"
              Size="sm"
              ThemeProps="ghost"
              Theme="light"
            >
              پاک کردن
            </Button>
          )}
          {displayError && (
            <p className="text-sm text-Error">{displayError}</p>
          )}
          {!parsedDate && !displayError && <div />}
        </div>
      )}
    </div>
  )
  
  if (mode === 'inline') {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="rounded-lg border border-Border bg-White shadow-sm">
          {calendarContent}
        </div>
      </div>
    )
  }
  
  // Popup mode
  return (
    <div className={cn("relative", className)}>
      <Dialog.Dialog open={open} onOpenChange={setOpen}>
        <Dialog.DialogTrigger asChild>
          <div className="relative">
            <Input
              type="text"
              value={formatDisplayDate()}
              placeholder={placeholder}
              disabled={disabled}
              readOnly
              className={cn(
                "w-full cursor-pointer",
                required && !parsedDate && "border-Error",
                displayError && "border-Error",
                !disabled && "pe-10"
              )}
            />
            {!disabled && (
              <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon Icon="calendar" Stroke="sm" className="size-5 text-Mid" />
              </div>
            )}
          </div>
        </Dialog.DialogTrigger>
        <Dialog.DialogContent className="max-w-sm p-0">
          <Dialog.DialogTitle className="sr-only">انتخاب تاریخ</Dialog.DialogTitle>
          <div className="rounded-lg border border-Border bg-White shadow-sm">
            {calendarContent}
          </div>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  )
}
