"use client"

import { UI as P } from "@/core/components/ui/Pelak"
import Link from "next/link"
import { useState } from "react"

export default function InputSecretUiPage() {
  const [secretValue, setSecretValue] = useState("")

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
            <h1 className="text-4xl font-bold text-Text">InputSecret</h1>
            <p className="text-Mid text-lg mt-2">
              کامپوننت InputSecret برای دریافت رمز عبور با قابلیت نمایش/مخفی کردن استفاده می‌شود.
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
              <p className="text-Mid mb-4">
                InputSecret تمام پارامترهای Input را دارد به علاوه:
              </p>
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
                
                <div className="mt-4 p-3 bg-Primary/10 rounded text-Mid text-sm">
                  <strong>نکته:</strong> InputSecret به صورت خودکار دکمه نمایش/مخفی کردن رمز را اضافه می‌کند و نیازی به تنظیم type=&quot;password&quot; نیست.
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
              <P.InputSecret 
                placeholder="رمز عبور"
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
              />
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.InputSecret 
  placeholder="رمز عبور"
  value={secretValue}
  onChange={(e) => setSecretValue(e.target.value)}
/>`}
              </pre>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">اندازه‌های مختلف</h3>
            <div className="bg-Lightness p-4 rounded-lg space-y-2">
              <P.InputSecret Size="sm" placeholder="Small" />
              <P.InputSecret Size="md" placeholder="Medium" />
              <P.InputSecret Size="lg" placeholder="Large" />
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.InputSecret Size="sm" placeholder="Small" />
<P.InputSecret Size="md" placeholder="Medium" />
<P.InputSecret Size="lg" placeholder="Large" />`}
              </pre>
            </div>
          </div>

          {/* States */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">حالت‌های مختلف</h3>
            <div className="bg-Lightness p-4 rounded-lg space-y-2">
              <P.InputSecret placeholder="عادی" />
              <P.InputSecret disabled placeholder="غیرفعال" />
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.InputSecret placeholder="عادی" />
<P.InputSecret disabled placeholder="غیرفعال" />`}
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
                <li>از InputSecret برای فیلدهای رمز عبور استفاده کنید</li>
                <li>از placeholder مناسب استفاده کنید</li>
                <li>از disabled برای فیلدهای غیرفعال استفاده کنید</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-Text">❌ انجام ندهید:</h3>
              <ul className="list-disc list-inside space-y-1 text-Mid">
                <li>از InputSecret برای فیلدهای غیر رمز عبور استفاده نکنید</li>
                <li>type را به صورت دستی تنظیم نکنید (به صورت خودکار password است)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </P.Container>
  )
}
