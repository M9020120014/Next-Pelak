"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useState, useEffect, useRef } from 'react'
import { ClassName as cn } from "./Pelak"
import { Input } from "./Input"
import { Button } from "./Button"
import * as Dialog from "./Dialog"
import { Icon } from "./Icon"

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
}: SelectorProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<SelectorOption[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOption, setSelectedOption] = useState<SelectorOption | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch options when dialog opens or parentId changes
  useEffect(() => {
    if (open && !disabled) {
      fetchOptions()
    }
  }, [open, parentId, type, disabled])

  // Set selected option when value changes
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find((opt) => opt.id === value)
      setSelectedOption(option || null)
    } else {
      setSelectedOption(null)
    }
  }, [value, options])

  const fetchOptions = async () => {
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
  }

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

  return (
    <div className={cn("relative", className)}>
      <Dialog.Dialog open={open} onOpenChange={setOpen}>
        <div className="relative">
          <Dialog.DialogTrigger asChild>
            <Button
              type="button"
              disabled={disabled}
              className={cn(
                "w-full justify-between text-left font-normal border border-gray-300 bg-white hover:bg-gray-50",
                !selectedOption && "text-Mid",
                required && !selectedOption && "border-red-500",
                selectedOption && !disabled && "pr-8"
              )}
            >
              <span className="truncate">
                {selectedOption ? selectedOption.title : placeholder}
              </span>
              <Icon
                Icon="back"
                Stroke="sm"
                className={cn(
                  "size-4 transition-transform",
                  open ? "rotate-90" : "-rotate-90"
                )}
              />
            </Button>
          </Dialog.DialogTrigger>
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-gray-100 z-10"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Icon Icon="xClose" Stroke="sm" className="size-3" />
            </button>
          )}
        </div>
        <Dialog.DialogContent className="max-w-md">
          <Dialog.DialogHeader>
            <Dialog.DialogTitle>انتخاب {type}</Dialog.DialogTitle>
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
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full text-right px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors",
                      selectedOption?.id === option.id && "bg-indigo-50 text-indigo-700"
                    )}
                  >
                    {option.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  )
}

