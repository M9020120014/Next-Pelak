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
                "relative flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors",
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
  onPreviousMonth: () => void
  onNextMonth: () => void
  onPreviousYear: () => void
  onNextYear: () => void
  onYearSelect?: (year: number) => void
}

function CalendarHeader({
  year,
  month,
  onPreviousMonth,
  onNextMonth,
  onPreviousYear,
  onNextYear,
  onYearSelect,
}: CalendarHeaderProps) {
  const [showYearInput, setShowYearInput] = useState(false)
  const [yearInput, setYearInput] = useState(year.toString())
  const yearInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    setYearInput(year.toString())
  }, [year])
  
  useEffect(() => {
    if (showYearInput && yearInputRef.current) {
      yearInputRef.current.select()
    }
  }, [showYearInput])
  
  const handleYearSubmit = () => {
    const newYear = parseInt(yearInput, 10)
    if (!isNaN(newYear) && newYear >= 1300 && newYear <= 1500) {
      onYearSelect?.(newYear)
      setShowYearInput(false)
    } else {
      // Reset to current year if invalid
      setYearInput(year.toString())
      setShowYearInput(false)
    }
  }
  
  const handleYearInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '')
    // Allow typing up to 4 digits without restriction
    if (val === '' || val.length <= 4) {
      setYearInput(val)
    }
  }
  
  return (
    <div className="flex items-center justify-between px-3 pt-4">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          onClick={onPreviousYear}
          className="h-7 w-7 p-0"
          Size="sm"
          ThemeProps="ghost"
          Theme="light"
        >
          <Icon Icon="back" Stroke="sm" className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={onPreviousMonth}
          className="h-7 w-7 p-0"
          Size="sm"
          ThemeProps="ghost"
          Theme="light"
        >
          <Icon Icon="back" Stroke="sm" className="h-4 w-4 rotate-90" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        {showYearInput ? (
          <input
            ref={yearInputRef}
            type="text"
            value={yearInput}
            onChange={handleYearInputChange}
            onBlur={handleYearSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleYearSubmit()
              } else if (e.key === 'Escape') {
                setShowYearInput(false)
                setYearInput(year.toString())
              }
            }}
            className="w-20 h-7 text-center font-semibold rounded-md border border-Border bg-White px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary focus-visible:ring-offset-2"
            autoFocus
            maxLength={4}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowYearInput(true)}
            className="px-2 py-1 text-sm font-semibold text-Text hover:bg-Background rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary focus-visible:ring-offset-2"
          >
            {year}
          </button>
        )}
        <span className="text-sm font-semibold text-Text min-w-[80px] text-center">{PERSIAN_MONTHS[month]}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          type="button"
          onClick={onNextMonth}
          className="h-7 w-7 p-0"
          Size="sm"
          ThemeProps="ghost"
          Theme="light"
        >
          <Icon Icon="back" Stroke="sm" className="h-4 w-4 -rotate-90" />
        </Button>
        <Button
          type="button"
          onClick={onNextYear}
          className="h-7 w-7 p-0"
          Size="sm"
          ThemeProps="ghost"
          Theme="light"
        >
          <Icon Icon="back" Stroke="sm" className="h-4 w-4 rotate-180" />
        </Button>
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
  
  // Update display when value changes
  // Use startTransition to prevent cascading renders
  useEffect(() => {
    if (parsedDate) {
      startTransition(() => {
        setDisplayYear(parsedDate.year)
        setDisplayMonth(parsedDate.month)
      })
    }
  }, [parsedDate])
  
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
  
  const handlePreviousMonth = () => {
    if (displayMonth === 1) {
      setDisplayMonth(12)
      setDisplayYear(displayYear - 1)
    } else {
      setDisplayMonth(displayMonth - 1)
    }
  }
  
  const handleNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayMonth(1)
      setDisplayYear(displayYear + 1)
    } else {
      setDisplayMonth(displayMonth + 1)
    }
  }
  
  const handlePreviousYear = () => {
    setDisplayYear(displayYear - 1)
  }
  
  const handleNextYear = () => {
    setDisplayYear(displayYear + 1)
  }
  
  const handleYearSelect = (year: number) => {
    setDisplayYear(year)
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
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onPreviousYear={handlePreviousYear}
        onNextYear={handleNextYear}
        onYearSelect={handleYearSelect}
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
                !disabled && "pr-10"
              )}
            />
            {!disabled && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon Icon="calendar" Stroke="sm" className="size-5 text-Mid" />
              </div>
            )}
          </div>
        </Dialog.DialogTrigger>
        <Dialog.DialogContent className="max-w-sm p-0">
          <div className="rounded-lg border border-Border bg-White shadow-sm">
            {calendarContent}
          </div>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  )
}
