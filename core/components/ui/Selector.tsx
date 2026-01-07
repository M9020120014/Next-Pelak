"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useState, useEffect, useRef, useCallback } from 'react'
import { ClassName as cn } from "./Pelak"
import { Input } from "./Input"
import { Button } from "./Button"
import * as Dialog from "./Dialog"
import { Icon } from "./Icon"
import { Skeleton } from "./Skeleton"

/* --- Types ------------------------------------------------------------------------------------ */
interface SelectorOption {
  id: number
  title: string
  type?: number
  selectorid?: number | null
  txt?: string | null
  num?: number | null
}

interface SelectorProps {
  type: string // نوع selector (مثل "province", "city")
  parentId?: number // برای selectorهای وابسته (مثل شهر بر اساس استان)
  value?: number // مقدار انتخاب شده
  onChange: (id: number | null) => void
  placeholder?: string
  required?: boolean
  searchable?: boolean // پیش‌فرض: true
  className?: string
  disabled?: boolean
  isLoading?: boolean // نمایش اسکلتون به جای selector
}

/* --- Selector Component ----------------------------------------------------------------------- */
export function Selector({
  type,
  parentId,
  value,
  onChange,
  placeholder = "انتخاب کنید...",
  required = false,
  searchable = true,
  className,
  disabled = false,
  isLoading = false,
}: SelectorProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<SelectorOption[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOption, setSelectedOption] = useState<SelectorOption | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const prevParentIdRef = useRef<number | undefined>(parentId)

  const fetchOptions = useCallback(async () => {
    if (disabled) return

    setLoading(true)
    try {
      const params = new URLSearchParams({ type })
      if (parentId) {
        params.append("parentId", parentId.toString())
      }

      const response = await fetch(`/api/selectors?${params.toString()}`)
      const data = await response.json()

      if (data.success && data.selectors) {
        setOptions(data.selectors)
      } else {
        setOptions([])
      }
    } catch (error) {
      console.error("Error fetching selectors:", error)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [type, parentId, disabled])

  // Fetch options when dialog opens
  useEffect(() => {
    if (open && !disabled && !isLoading) {
      fetchOptions()
    }
  }, [open, disabled, isLoading, fetchOptions])

  // Reset options when parentId changes (for dependent selectors like city)
  useEffect(() => {
    if (!isLoading && prevParentIdRef.current !== parentId && parentId !== undefined && !disabled && !open) {
      setOptions([])
      setSelectedOption(null)
      prevParentIdRef.current = parentId
      // Fetch new options if value exists
      if (value) {
        fetchOptions()
      }
    } else {
      prevParentIdRef.current = parentId
    }
  }, [isLoading, parentId, disabled, open, value, fetchOptions])

  // Fetch options when value exists but options are empty (for initial load)
  useEffect(() => {
    if (!isLoading && value && options.length === 0 && !disabled && !open) {
      // Only fetch if parentId is available for dependent selectors (or not needed)
      if (parentId === undefined || parentId !== null) {
        fetchOptions()
      }
    }
  }, [isLoading, value, options.length, disabled, open, parentId, fetchOptions])

  // Fetch options when isLoading changes from true to false (for initial load)
  useEffect(() => {
    if (!isLoading && !disabled && options.length === 0 && !open) {
      // Only fetch if parentId is available for dependent selectors (or not needed)
      if (parentId === undefined || parentId !== null) {
        fetchOptions()
      }
    }
  }, [isLoading, disabled, options.length, open, parentId, fetchOptions])

  // Fetch options immediately when value exists but selectedOption is not set (priority fetch)
  useEffect(() => {
    if (!isLoading && value && !selectedOption && options.length === 0 && !disabled && !open && !loading) {
      // Only fetch if parentId is available for dependent selectors (or not needed)
      if (parentId === undefined || parentId !== null) {
        fetchOptions()
      }
    }
  }, [isLoading, value, selectedOption, options.length, disabled, open, loading, parentId, fetchOptions])

  // Set selected option when value or options change
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find((opt) => opt.id === value)
      setSelectedOption(option || null)
    } else if (!value) {
      setSelectedOption(null)
    }
  }, [value, options])

  // Track if we're still loading the selected value
  const isLoadingValue = value !== undefined && value !== null && !selectedOption && (options.length === 0 || loading)

  const filteredOptions = searchable && searchQuery
    ? options.filter((option) =>
      option.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : options

  const handleSelect = (option: SelectorOption) => {
    setSelectedOption(option)
    onChange(option.id)
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOption(null)
    onChange(null)
  }

  // Focus search input when dialog opens
  useEffect(() => {
    if (open && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [open, searchable])

  // Show skeleton if isLoading is true OR if value exists but selectedOption is not set yet
  const shouldShowSkeleton = isLoading || isLoadingValue

  if (shouldShowSkeleton) {
    return (
      <div className={cn("relative", className)}>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Dialog.Dialog open={open} onOpenChange={setOpen}>
        <div className="relative">
          <Dialog.DialogTrigger asChild>
            <Button
              type="button"
              disabled={disabled}
              className={cn(
                "w-full justify-between text-left font-normal",
                "bg-Lightness border border-Border",
                "hover:bg-Background hover:border-Mid",
                "transition-colors",
                !selectedOption && "text-Mid",
                selectedOption && "text-Text font-medium",
                required && !selectedOption && "border-red-500",
                selectedOption && !disabled && "pr-8",
                disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <span className="truncate">
                {selectedOption ? selectedOption.title : placeholder}
              </span>
              <Icon
                Icon="back"
                Stroke="sm"
                className={cn(
                  "size-012-3 transition-transform text-Mid",
                  open ? "-rotate-90" : "rotate-90"
                )}
              />
            </Button>
          </Dialog.DialogTrigger>
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute end-040-8 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-gray-100 z-10"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Icon Icon="xClose" Stroke="sm" />
            </button>
          )}
        </div>
        <Dialog.DialogContent className="max-w-md">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>انتخاب</Dialog.DialogTitle>
          </Dialog.DialogHeader>
          {searchable && (
            <div className="px-1">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="جستجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-Mid">در حال بارگذاری...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-8 text-center text-Mid">
                {searchQuery ? "نتیجه‌ای یافت نشد" : "گزینه‌ای موجود نیست"}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredOptions.map((option) => (
                  <Button
                    Theme="light"
                    disabled={selectedOption?.id === option.id}
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className='w-full'
                  >
                    {option.title}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  )
}

