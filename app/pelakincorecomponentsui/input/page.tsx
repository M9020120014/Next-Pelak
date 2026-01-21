"use client"

import { UI as P } from "@/core/components/ui/Pelak"
import Link from "next/link"
import { useState } from "react"

export default function InputUiPage() {
  const [inputValue, setInputValue] = useState("")

  return (
    <P.Container className="py-056-M">
      <div className="space-y-056-M">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/pelakincorecomponentsui" className="inline-flex items-center gap-2 text-Mid hover:text-Text transition-colors">
            <P.Icon Icon="back" Stroke="sm" className="size-4 rotate-90" />
            بازگشت به لیست کامپوننت‌ها
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-Text">Input</h1>
            <p className="text-Mid text-lg mt-2">
              کامپوننت Input برای دریافت ورودی متنی از کاربر استفاده می‌شود.
            </p>
          </div>
        </div>

        <P.Separator />

        {/* API Reference */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-Text">مرجع API</h2>
          
          <div className="bg-Lightness p-6 rounded-lg space-y-4">
            <div>
              <h3 className="font-semibold text-Text mb-2">پارامترها:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">ThemeProps</code>
                  <span className="text-Mid">: نوع تم - پیش‌فرض: default</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Theme</code>
                  <span className="text-Mid">: رنگ تم - پیش‌فرض: default</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Rounded</code>
                  <span className="text-Mid">: گردی گوشه‌ها - پیش‌فرض: sm</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Size</code>
                  <span className="text-Mid">: اندازه - پیش‌فرض: md</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Focus</code>
                  <span className="text-Mid">: استایل فوکوس - پیش‌فرض: secondary</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">type</code>
                  <span className="text-Mid">: نوع input (text, email, number, tel, password, ...)</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">value</code>
                  <span className="text-Mid">: مقدار input</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">onChange</code>
                  <span className="text-Mid">: تابع تغییر مقدار</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">placeholder</code>
                  <span className="text-Mid">: متن placeholder</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">disabled</code>
                  <span className="text-Mid">: غیرفعال کردن input</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">readOnly</code>
                  <span className="text-Mid">: فقط خواندنی</span>
                </div>
                
                <div className="mt-4 text-Mid">
                  همه props استاندارد HTML input پشتیبانی می‌شود
                </div>
              </div>
            </div>
          </div>
        </section>

        <P.Separator />

        {/* Usage Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-Text">نمونه‌های استفاده</h2>

          {/* Basic Usage */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">استفاده پایه</h3>
            <div className="bg-Lightness p-4 rounded-lg">
              <P.Input 
                type="text" 
                placeholder="متن خود را وارد کنید..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Input 
  type="text" 
  placeholder="متن خود را وارد کنید..."
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
/>`}
              </pre>
            </div>
          </div>

          {/* Input Types */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">انواع مختلف Input</h3>
            <div className="bg-Lightness p-4 rounded-lg space-y-2">
              <P.Input type="text" placeholder="متن" />
              <P.Input type="email" placeholder="ایمیل" />
              <P.Input type="number" placeholder="عدد" />
              <P.Input type="tel" placeholder="تلفن" />
              <P.Input type="password" placeholder="رمز عبور" />
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Input type="text" placeholder="متن" />
<P.Input type="email" placeholder="ایمیل" />
<P.Input type="number" placeholder="عدد" />
<P.Input type="tel" placeholder="تلفن" />`}
              </pre>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">اندازه‌های مختلف</h3>
            <div className="bg-Lightness p-4 rounded-lg space-y-2">
              <P.Input Size="sm" placeholder="Small" />
              <P.Input Size="md" placeholder="Medium" />
              <P.Input Size="lg" placeholder="Large" />
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Input Size="sm" placeholder="Small" />
<P.Input Size="md" placeholder="Medium" />
<P.Input Size="lg" placeholder="Large" />`}
              </pre>
            </div>
          </div>

          {/* States */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">حالت‌های مختلف</h3>
            <div className="bg-Lightness p-4 rounded-lg space-y-2">
              <P.Input placeholder="عادی" />
              <P.Input disabled placeholder="غیرفعال" />
              <P.Input readOnly value="فقط خواندنی" />
              <P.Input placeholder="با خطا" className="border-red-500" />
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Input placeholder="عادی" />
<P.Input disabled placeholder="غیرفعال" />
<P.Input readOnly value="فقط خواندنی" />
<P.Input placeholder="با خطا" className="border-red-500" />`}
              </pre>
            </div>
          </div>

          {/* Rounded Variants */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">گردی گوشه‌ها</h3>
            <div className="bg-Lightness p-4 rounded-lg space-y-2">
              <P.Input Rounded="xs" placeholder="XS" />
              <P.Input Rounded="sm" placeholder="SM" />
              <P.Input Rounded="md" placeholder="MD" />
              <P.Input Rounded="lg" placeholder="LG" />
              <P.Input Rounded="full" placeholder="Full" />
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Input Rounded="xs" placeholder="XS" />
<P.Input Rounded="sm" placeholder="SM" />
<P.Input Rounded="full" placeholder="Full" />`}
              </pre>
            </div>
          </div>
        </section>

        <P.Separator />

        {/* Best Practices */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-Text">بهترین روش‌ها</h2>
          <div className="bg-Lightness p-6 rounded-lg space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-Text">✅ انجام دهید:</h3>
              <ul className="list-disc list-inside space-y-1 text-Mid">
                <li>از type مناسب برای هر فیلد استفاده کنید</li>
                <li>از placeholder برای راهنمایی کاربر استفاده کنید</li>
                <li>از disabled برای فیلدهای غیرفعال استفاده کنید</li>
                <li>از readOnly برای فیلدهای فقط خواندنی استفاده کنید</li>
                <li>از value و onChange برای کنترل state استفاده کنید</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-Text">❌ انجام ندهید:</h3>
              <ul className="list-disc list-inside space-y-1 text-Mid">
                <li>از type=&quot;text&quot; برای همه فیلدها استفاده نکنید</li>
                <li>placeholder را به عنوان label استفاده نکنید</li>
                <li>فیلدهای required را بدون label رها نکنید</li>
                <li>از disabled به جای readOnly برای فیلدهای فقط خواندنی استفاده نکنید</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </P.Container>
  )
}
