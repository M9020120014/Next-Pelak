"use client"

import { UI as P } from "@/core/components/ui/Pelak"
import Link from "next/link"

const categories = [
  "Layout",
  "Form",
  "Display",
  "Overlay",
  "Feedback"
] as const

const components: {
  name: string
  description: string
  href: string
  category: typeof categories[number]
}[] = [
    {
      name: "Container",
      description: "کامپوننت Container برای ایجاد بخش‌های محتوا با padding و gap قابل تنظیم استفاده می‌شود.",
      href: "/pelakincorecomponentsui/container",
      category: "Layout"
    },
    {
      name: "Button",
      description: "کامپوننت Button برای ایجاد دکمه‌های قابل کلیک با تم‌ها و اندازه‌های مختلف استفاده می‌شود.",
      href: "/pelakincorecomponentsui/button",
      category: "Form"
    },
    {
      name: "Input",
      description: "کامپوننت Input برای دریافت ورودی متنی از کاربر استفاده می‌شود.",
      href: "/pelakincorecomponentsui/input",
      category: "Form"
    },
    {
      name: "InputSecret",
      description: "کامپوننت InputSecret برای دریافت رمز عبور با قابلیت نمایش/مخفی کردن استفاده می‌شود.",
      href: "/pelakincorecomponentsui/input-secret",
      category: "Form"
    },
    {
      name: "Icon",
      description: "کامپوننت Icon برای نمایش آیکون‌های SVG استفاده می‌شود.",
      href: "/pelakincorecomponentsui/icon",
      category: "Display"
    },
    {
      name: "Card",
      description: "کامپوننت Card برای نمایش محتوا در قالب کارت استفاده می‌شود.",
      href: "/pelakincorecomponentsui/card",
      category: "Display"
    },
    {
      name: "Dialog",
      description: "کامپوننت Dialog برای نمایش پنجره‌های مودال استفاده می‌شود.",
      href: "/pelakincorecomponentsui/dialog",
      category: "Overlay"
    },
    {
      name: "Separator",
      description: "کامپوننت Separator برای ایجاد خط جداکننده استفاده می‌شود.",
      href: "/pelakincorecomponentsui/separator",
      category: "Layout"
    },
    {
      name: "Skeleton",
      description: "کامپوننت Skeleton برای نمایش حالت بارگذاری استفاده می‌شود.",
      href: "/pelakincorecomponentsui/skeleton",
      category: "Feedback"
    },
    {
      name: "Selector",
      description: "کامپوننت Selector برای انتخاب از لیست گزینه‌های وابسته به API استفاده می‌شود.",
      href: "/pelakincorecomponentsui/selector",
      category: "Form"
    },
    {
      name: "DateInput",
      description: "کامپوننت DateInput برای دریافت تاریخ شمسی با سه فیلد جداگانه استفاده می‌شود.",
      href: "/pelakincorecomponentsui/date-input",
      category: "Form"
    },
    {
      name: "DatePicker",
      description: "کامپوننت DatePicker برای انتخاب تاریخ شمسی با تقویم استفاده می‌شود.",
      href: "/pelakincorecomponentsui/date-picker",
      category: "Form"
    },
    {
      name: "FormField",
      description: "کامپوننت FormField برای ساختاردهی فیلدهای فرم با label و error استفاده می‌شود.",
      href: "/pelakincorecomponentsui/form-field",
      category: "Form"
    },
    {
      name: "TextareaField",
      description: "کامپوننت TextareaField برای دریافت ورودی متنی چندخطی استفاده می‌شود.",
      href: "/pelakincorecomponentsui/textarea-field",
      category: "Form"
    },
    {
      name: "SelectField",
      description: "کامپوننت SelectField برای انتخاب از لیست گزینه‌های استاتیک استفاده می‌شود.",
      href: "/pelakincorecomponentsui/select-field",
      category: "Form"
    },
    {
      name: "AspectRatio",
      description: "کامپوننت AspectRatio برای حفظ نسبت ابعاد المان‌ها استفاده می‌شود.",
      href: "/pelakincorecomponentsui/aspect-ratio",
      category: "Layout"
    },
  ]


export default function PelakUiPage() {
  return (
    <P.Container className="py-056-M">
      <div className="space-y-056-M">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-Text">مستندات کامپوننت‌های UI Pelak</h1>
          <p className="text-Mid text-lg">
            راهنمای کامل استفاده از تمام کامپوننت‌های رابط کاربری کتابخانه Pelak
          </p>
        </div>

        <P.Separator />

        {/* Components Grid */}
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryComponents = components.filter(c => c.category === category)
            if (categoryComponents.length === 0) return null

            return (
              <section key={category} className="space-y-4">
                <h2 className="text-2xl font-bold text-Text">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryComponents.map((component) => (
                    <Link
                      key={component.name}
                      href={component.href}
                      className="group"
                    >
                      <P.Card className="h-full transition-all hover:shadow-md hover:border-Primary/50">
                        <P.CardHeader>
                          <P.CardTitle className="group-hover:text-Primary transition-colors">
                            {component.name}
                          </P.CardTitle>
                          <P.CardDescription className="line-clamp-2">
                            {component.description}
                          </P.CardDescription>
                        </P.CardHeader>
                        <P.CardFooter>
                          <P.Button ThemeProps="ghost" Theme="primary" Size="sm" className="w-full">
                            مشاهده مستندات
                            <P.Icon Icon="back" Stroke="sm" className="size-4 rotate-180" />
                          </P.Button>
                        </P.CardFooter>
                      </P.Card>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <P.Separator />

        {/* Footer */}
        <div className="text-center text-Mid py-8">
          <p>مستندات کامل کامپوننت‌های UI Pelak</p>
          <p className="text-sm mt-2">نسخه 1.0.0</p>
        </div>
      </div>
    </P.Container>
  )
}
