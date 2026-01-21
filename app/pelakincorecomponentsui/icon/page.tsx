"use client"

import { UI as P } from "@/core/components/ui/Pelak"
import Link from "next/link"
import { Svg } from "@/core/components/ui/icons/Icons"

const iconList = [
  "default", "home", "category", "dashboard", "missions", "donate", 
  "menu", "xClose", "plus", "minus", "Eye", "EyeOff", "calendar", "back"
] as const

export default function IconUiPage() {
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
            <h1 className="text-4xl font-bold text-Text">Icon</h1>
            <p className="text-Mid text-lg mt-2">
              کامپوننت Icon برای نمایش آیکون‌های SVG استفاده می‌شود.
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
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Icon</code>
                  <span className="text-Mid">: نام آیکون</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">default</code>, <code className="bg-Background px-1 rounded">home</code>, <code className="bg-Background px-1 rounded">category</code>, <code className="bg-Background px-1 rounded">dashboard</code>, <code className="bg-Background px-1 rounded">missions</code>, <code className="bg-Background px-1 rounded">donate</code>, <code className="bg-Background px-1 rounded">menu</code>, <code className="bg-Background px-1 rounded">xClose</code>, <code className="bg-Background px-1 rounded">plus</code>, <code className="bg-Background px-1 rounded">minus</code>, <code className="bg-Background px-1 rounded">Eye</code>, <code className="bg-Background px-1 rounded">EyeOff</code>, <code className="bg-Background px-1 rounded">calendar</code>, <code className="bg-Background px-1 rounded">back</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">default</code>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Size</code>
                  <span className="text-Mid">: اندازه آیکون</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">xs</code>, <code className="bg-Background px-1 rounded">sm</code>, <code className="bg-Background px-1 rounded">md</code>, <code className="bg-Background px-1 rounded">lg</code>, <code className="bg-Background px-1 rounded">xl</code>, <code className="bg-Background px-1 rounded">none</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">sm</code>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Stroke</code>
                  <span className="text-Mid">: ضخامت خط</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">xs</code>, <code className="bg-Background px-1 rounded">sm</code>, <code className="bg-Background px-1 rounded">md</code>, <code className="bg-Background px-1 rounded">lg</code>, <code className="bg-Background px-1 rounded">xl</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">md</code>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">BackColor</code>
                  <span className="text-Mid">: رنگ پس‌زمینه - پیش‌فرض: currentColor</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">active</code>
                  <span className="text-Mid">: نمایش حالت فعال</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">activeFit</code>
                  <span className="text-Mid">: نمایش حالت فعال با fit</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <P.Separator />

        {/* Usage Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-Text">نمونه‌های استفاده</h2>

          {/* All Icons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">لیست تمام آیکون‌ها</h3>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {iconList.map((icon) => (
                  <div key={icon} className="flex flex-col items-center gap-2 p-3 bg-Background rounded">
                    <P.Icon Icon={icon as keyof typeof Svg} />
                    <span className="text-xs text-Mid text-center">{icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">اندازه‌های مختلف</h3>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Size="xs" />
                  <span className="text-xs text-Mid">xs</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Size="sm" />
                  <span className="text-xs text-Mid">sm</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Size="md" />
                  <span className="text-xs text-Mid">md</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Size="lg" />
                  <span className="text-xs text-Mid">lg</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Size="xl" />
                  <span className="text-xs text-Mid">xl</span>
                </div>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Icon Icon="home" Size="xs" />
<P.Icon Icon="home" Size="sm" />
<P.Icon Icon="home" Size="md" />
<P.Icon Icon="home" Size="lg" />
<P.Icon Icon="home" Size="xl" />`}
              </pre>
            </div>
          </div>

          {/* Stroke Variants */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">ضخامت خط</h3>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Stroke="xs" />
                  <span className="text-xs text-Mid">xs</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Stroke="sm" />
                  <span className="text-xs text-Mid">sm</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Stroke="md" />
                  <span className="text-xs text-Mid">md</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Stroke="lg" />
                  <span className="text-xs text-Mid">lg</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" Stroke="xl" />
                  <span className="text-xs text-Mid">xl</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active States */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">حالت فعال</h3>
            <div className="bg-Lightness p-4 rounded-lg">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" />
                  <span className="text-xs text-Mid">عادی</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" active />
                  <span className="text-xs text-Mid">active</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <P.Icon Icon="home" activeFit />
                  <span className="text-xs text-Mid">activeFit</span>
                </div>
              </div>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`<P.Icon Icon="home" />
<P.Icon Icon="home" active />
<P.Icon Icon="home" activeFit />`}
              </pre>
            </div>
          </div>

          {/* Usage in Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">استفاده در دکمه‌ها</h3>
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
        </section>

        <P.Separator />

        {/* Best Practices */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-Text">بهترین روش‌ها</h2>
          <div className="bg-Lightness p-6 rounded-lg space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-Text">✅ انجام دهید:</h3>
              <ul className="list-disc list-inside space-y-1 text-Mid">
                <li>از Size مناسب برای فضای موجود استفاده کنید</li>
                <li>از Stroke مناسب برای وضوح آیکون استفاده کنید</li>
                <li>از active برای نمایش حالت فعال استفاده کنید</li>
                <li>از className برای استایل‌دهی اضافی استفاده کنید</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-Text">❌ انجام ندهید:</h3>
              <ul className="list-disc list-inside space-y-1 text-Mid">
                <li>از آیکون‌های خیلی بزرگ یا خیلی کوچک استفاده نکنید</li>
                <li>از Stroke خیلی ضخیم برای آیکون‌های کوچک استفاده نکنید</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </P.Container>
  )
}
