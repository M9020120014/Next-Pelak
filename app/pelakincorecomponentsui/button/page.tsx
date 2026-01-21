"use client"

import { UI as P } from "@/core/components/ui/Pelak"
import Link from "next/link"
import { useState } from "react"

export default function ButtonUiPage() {
  const [buttonState, setButtonState] = useState(false)

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
            <h1 className="text-4xl font-bold text-Text">Button</h1>
            <p className="text-Mid text-lg mt-2">
              کامپوننت Button برای ایجاد دکمه‌های قابل کلیک با تم‌ها و اندازه‌های مختلف استفاده می‌شود.
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
                  <span className="text-Mid">: نوع تم دکمه</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">default</code>, <code className="bg-Background px-1 rounded">outline</code>, <code className="bg-Background px-1 rounded">ghost</code>, <code className="bg-Background px-1 rounded">link</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">default</code>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Theme</code>
                  <span className="text-Mid">: رنگ تم دکمه</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">primary</code>, <code className="bg-Background px-1 rounded">secondary</code>, <code className="bg-Background px-1 rounded">third</code>, <code className="bg-Background px-1 rounded">success</code>, <code className="bg-Background px-1 rounded">error</code>, <code className="bg-Background px-1 rounded">warning</code>, <code className="bg-Background px-1 rounded">dark</code>, <code className="bg-Background px-1 rounded">light</code>, <code className="bg-Background px-1 rounded">black</code>, <code className="bg-Background px-1 rounded">white</code>, <code className="bg-Background px-1 rounded">none</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">dark</code>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Rounded</code>
                  <span className="text-Mid">: گردی گوشه‌ها</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">xs</code>, <code className="bg-Background px-1 rounded">sm</code>, <code className="bg-Background px-1 rounded">md</code>, <code className="bg-Background px-1 rounded">lg</code>, <code className="bg-Background px-1 rounded">xl</code>, <code className="bg-Background px-1 rounded">full</code>, <code className="bg-Background px-1 rounded">none</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">sm</code>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Size</code>
                  <span className="text-Mid">: اندازه دکمه</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">sm</code>, <code className="bg-Background px-1 rounded">md</code>, <code className="bg-Background px-1 rounded">lg</code>, <code className="bg-Background px-1 rounded">smIcon</code>, <code className="bg-Background px-1 rounded">mdIcon</code>, <code className="bg-Background px-1 rounded">lgIcon</code>, <code className="bg-Background px-1 rounded">none</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">md</code>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Focus</code>
                  <span className="text-Mid">: استایل فوکوس</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">primary</code>, <code className="bg-Background px-1 rounded">secondary</code>, <code className="bg-Background px-1 rounded">third</code>, <code className="bg-Background px-1 rounded">success</code>, <code className="bg-Background px-1 rounded">error</code>, <code className="bg-Background px-1 rounded">warning</code>, <code className="bg-Background px-1 rounded">none</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">secondary</code>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">asChild</code>
                  <span className="text-Mid">: استفاده به عنوان Slot</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  نوع: <code className="bg-Background px-1 rounded">boolean</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">false</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        <P.Separator />

        {/* Usage Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-Text">نمونه‌های استفاده</h2>

          {/* Theme Variants - Default */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">تم‌های مختلف (Default)</h3>
            <p className="text-Mid">
              دکمه‌ها با تم default و رنگ‌های مختلف:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <P.Button Theme="primary">Primary</P.Button>
                <P.Button Theme="secondary">Secondary</P.Button>
                <P.Button Theme="third">Third</P.Button>
                <P.Button Theme="success">Success</P.Button>
                <P.Button Theme="error">Error</P.Button>
                <P.Button Theme="warning">Warning</P.Button>
                <P.Button Theme="dark">Dark</P.Button>
                <P.Button Theme="light">Light</P.Button>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Button Theme="primary">Primary</P.Button>
<P.Button Theme="secondary">Secondary</P.Button>
<P.Button Theme="success">Success</P.Button>`}
              </pre>
            </div>
          </div>

          {/* Outline Variants */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">تم Outline</h3>
            <p className="text-Mid">
              دکمه‌های outline با حاشیه و پس‌زمینه شفاف:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <P.Button ThemeProps="outline" Theme="primary">Primary</P.Button>
                <P.Button ThemeProps="outline" Theme="secondary">Secondary</P.Button>
                <P.Button ThemeProps="outline" Theme="success">Success</P.Button>
                <P.Button ThemeProps="outline" Theme="error">Error</P.Button>
                <P.Button ThemeProps="outline" Theme="warning">Warning</P.Button>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Button ThemeProps="outline" Theme="primary">Primary</P.Button>
<P.Button ThemeProps="outline" Theme="secondary">Secondary</P.Button>`}
              </pre>
            </div>
          </div>

          {/* Ghost Variants */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">تم Ghost</h3>
            <p className="text-Mid">
              دکمه‌های ghost بدون حاشیه و پس‌زمینه:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <P.Button ThemeProps="ghost" Theme="primary">Primary</P.Button>
                <P.Button ThemeProps="ghost" Theme="secondary">Secondary</P.Button>
                <P.Button ThemeProps="ghost" Theme="success">Success</P.Button>
                <P.Button ThemeProps="ghost" Theme="error">Error</P.Button>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Button ThemeProps="ghost" Theme="primary">Primary</P.Button>
<P.Button ThemeProps="ghost" Theme="secondary">Secondary</P.Button>`}
              </pre>
            </div>
          </div>

          {/* Link Variants */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">تم Link</h3>
            <p className="text-Mid">
              دکمه‌های link به صورت لینک نمایش داده می‌شوند:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <P.Button ThemeProps="link" Theme="primary">لینک Primary</P.Button>
                <P.Button ThemeProps="link" Theme="secondary">لینک Secondary</P.Button>
                <P.Button ThemeProps="link" Theme="success">لینک Success</P.Button>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Button ThemeProps="link" Theme="primary">لینک Primary</P.Button>
<P.Button ThemeProps="link" Theme="secondary">لینک Secondary</P.Button>`}
              </pre>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">اندازه‌های مختلف</h3>
            <p className="text-Mid">
              دکمه‌ها در اندازه‌های مختلف:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <P.Button Size="sm">Small</P.Button>
                <P.Button Size="md">Medium</P.Button>
                <P.Button Size="lg">Large</P.Button>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Button Size="sm">Small</P.Button>
<P.Button Size="md">Medium</P.Button>
<P.Button Size="lg">Large</P.Button>`}
              </pre>
            </div>
          </div>

          {/* Rounded Variants */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">گردی گوشه‌ها</h3>
            <p className="text-Mid">
              دکمه‌ها با گردی گوشه‌های مختلف:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <P.Button Rounded="xs">XS</P.Button>
                <P.Button Rounded="sm">SM</P.Button>
                <P.Button Rounded="md">MD</P.Button>
                <P.Button Rounded="lg">LG</P.Button>
                <P.Button Rounded="xl">XL</P.Button>
                <P.Button Rounded="full">Full</P.Button>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Button Rounded="xs">XS</P.Button>
<P.Button Rounded="sm">SM</P.Button>
<P.Button Rounded="full">Full</P.Button>`}
              </pre>
            </div>
          </div>

          {/* States */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">حالت‌های مختلف</h3>
            <p className="text-Mid">
              دکمه‌ها در حالت‌های مختلف:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <P.Button>عادی</P.Button>
                <P.Button disabled>غیرفعال</P.Button>
                <P.Button onClick={() => setButtonState(!buttonState)}>
                  {buttonState ? "کلیک شده" : "کلیک کنید"}
                </P.Button>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Button>عادی</P.Button>
<P.Button disabled>غیرفعال</P.Button>
<P.Button onClick={() => handleClick()}>کلیک کنید</P.Button>`}
              </pre>
            </div>
          </div>

          {/* With Icons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">دکمه با آیکون</h3>
            <p className="text-Mid">
              دکمه‌ها می‌توانند شامل آیکون باشند:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <P.Button>
                  <P.Icon Icon="home" Stroke="sm" className="size-4" />
                  خانه
                </P.Button>
                <P.Button ThemeProps="outline">
                  <P.Icon Icon="category" Stroke="sm" className="size-4" />
                  دسته‌بندی
                </P.Button>
                <P.Button Size="smIcon">
                  <P.Icon Icon="dashboard" Stroke="sm" />
                </P.Button>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Button>
  <P.Icon Icon="home" Stroke="sm" className="size-4" />
  خانه
</P.Button>
<P.Button Size="smIcon">
  <P.Icon Icon="dashboard" Stroke="sm" />
</P.Button>`}
              </pre>
            </div>
          </div>

          {/* As Child */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">استفاده با asChild</h3>
            <p className="text-Mid">
              استفاده از asChild برای ترکیب با المان‌های دیگر مثل Link:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap gap-2">
                <P.Button asChild>
                  <Link href="/">دکمه با Link</Link>
                </P.Button>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Button asChild>
  <Link href="/">دکمه با Link</Link>
</P.Button>`}
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
                <li>از Theme مناسب برای هر عمل استفاده کنید (primary برای اقدامات اصلی، error برای حذف)</li>
                <li>از Size مناسب برای فضای موجود استفاده کنید</li>
                <li>از disabled برای دکمه‌های غیرفعال استفاده کنید</li>
                <li>از asChild برای ترکیب با Link استفاده کنید</li>
                <li>از آیکون‌ها برای بهبود UX استفاده کنید</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-Text">❌ انجام ندهید:</h3>
              <ul className="list-disc list-inside space-y-1 text-Mid">
                <li>از Theme های مختلف به صورت تصادفی استفاده نکنید</li>
                <li>دکمه‌ها را خیلی کوچک یا خیلی بزرگ نکنید</li>
                <li>از disabled به جای پنهان کردن دکمه استفاده کنید</li>
                <li>از دکمه‌های تو در تو استفاده نکنید</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </P.Container>
  )
}
