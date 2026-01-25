"use client"

import { UI as P } from "@/core/components/ui/Pelak"

export default function ContainerUiPage() {
  return (
    <>
      <P.Container className="py-056-M">
        {/* Header */}

        <div>
          <h1>Container</h1>
          <p>
            کامپوننت Container برای ایجاد بخش‌های محتوا که مقادیری به صورت پیشفرض دارد و قابل تنظیم استفاده می‌شود.
          </p>
          <p>
            این کامپوننت در اصل از دو المان تشکیل شده است: یک <code className="bg-Background px-1 rounded">&lt;section&gt;</code> بیرونی که padding خارجی را مدیریت می‌کند و یک <code className="bg-Background px-1 rounded">&lt;div&gt;</code> داخلی که با <code className="bg-Background px-1 rounded">max-w-7xl mx-auto</code> عرض را محدود می‌کند و با <code className="bg-Background px-1 rounded">flex flex-col</code> المان‌های فرزند را به صورت عمودی چیدمان می‌کند. padding داخلی و gap بین المان‌های فرزند نیز در div داخلی اعمال می‌شود.
          </p>
        </div>

      </P.Container>
      <div className="bg-Background">

        <P.Container Padding="none" SectionClassName="bg-Primary/20" className="bg-Secondary/20 h-[80px]">
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Padding="none"
          </div>
        </P.Container>

        <div className="h-012-3" />

        <P.Container Padding="xs" SectionClassName="bg-Primary/20" className="bg-Secondary/20 h-[80px]">
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Padding="xs"
          </div>
        </P.Container>

        <div className="h-012-3" />

        <P.Container Padding="sm" SectionClassName="bg-Primary/20" className="bg-Secondary/20 h-[80px]">
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Padding="sm"
          </div>
        </P.Container>

        <div className="h-012-3" />

        <P.Container SectionClassName="bg-Primary/20" className="bg-Secondary/20 h-[80px]">
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Padding="md" پیشفرض
          </div>
        </P.Container>

        <div className="h-012-3" />

        <P.Container Padding="lg" SectionClassName="bg-Primary/20" className="bg-Secondary/20 h-[80px]">
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Padding="lg"
          </div>
        </P.Container>

        <div className="h-012-3" />

        <P.Container Padding="xl" SectionClassName="bg-Primary/20" className="bg-Secondary/20 h-[80px]">
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Padding="xl"
          </div>
        </P.Container>

        <div className="h-012-3" />

        <P.Container SectionClassName="bg-Primary/20" className="bg-Secondary/20 h-[180px]">
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Padding="md" پیشفرض
          </div>
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Gaps="md" پیشفرض
          </div>
        </P.Container>

        <div className="h-012-3" />

        <P.Container Gaps="lg" SectionClassName="bg-Primary/20" className="bg-Secondary/20 h-[180px]">
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Padding="md" پیشفرض
          </div>
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Gaps="lg"
          </div>
        </P.Container>

        <div className="h-012-3" />

        <P.Container Gaps="xl" SectionClassName="bg-Primary/20" className="bg-Secondary/20 h-[180px]">
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Padding="md" پیشفرض
          </div>
          <div className="bg-Background/80 w-full h-full flex justify-center items-center">
            Gaps="xl"
          </div>
        </P.Container>


      </div>
      <P.Container className="py-056-M">

        {/* API Reference */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-Text">مرجع API</h2>

          <div className="bg-Lightness p-6 rounded-lg space-y-4">
            <div>
              <h3 className="font-semibold text-Text mb-2">پارامترها:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Padding</code>
                  <span className="text-Mid">: تنظیم padding برای section و div داخلی</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">xs</code>, <code className="bg-Background px-1 rounded">sm</code>, <code className="bg-Background px-1 rounded">md</code>, <code className="bg-Background px-1 rounded">lg</code>, <code className="bg-Background px-1 rounded">xl</code>, <code className="bg-Background px-1 rounded">none</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">md</code>
                </div>

                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">Gaps</code>
                  <span className="text-Mid">: تنظیم فاصله بین المان‌های فرزند</span>
                </div>
                <div className="rtl:pr-4 ltr:pl-4 text-Mid">
                  مقادیر ممکن: <code className="bg-Background px-1 rounded">md</code>, <code className="bg-Background px-1 rounded">lg</code>, <code className="bg-Background px-1 rounded">xl</code>
                  <br />
                  پیش‌فرض: <code className="bg-Background px-1 rounded">md</code>
                </div>

                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">SectionClassName</code>
                  <span className="text-Mid">: کلاس‌های اضافی برای element section</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">className</code>
                  <span className="text-Mid">: کلاس‌های اضافی برای div داخلی</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <code className="bg-Background px-2 py-1 rounded font-mono text-Primary">children</code>
                  <span className="text-Mid">: محتوای Container</span>
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
            <p className="text-Mid">
              ساده‌ترین استفاده از Container بدون تنظیمات خاص:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <P.Container className="bg-Panel/30">
                <div className="bg-Background p-4 rounded text-center">
                  محتوای داخل Container
                </div>
              </P.Container>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`<P.Container>
  <div>محتوای داخل Container</div>
</P.Container>`}
              </pre>
            </div>
          </div>

          {/* Padding Variants */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">انواع Padding</h3>
            <p className="text-Mid">
              Container از padding های مختلف پشتیبانی می‌کند:
            </p>
            <div className="space-y-4">
              {(["xs", "sm", "md", "lg", "xl"] as const).map((padding) => (
                <div key={padding} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="bg-Background px-2 py-1 rounded text-sm">Padding=&quot;{padding}&quot;</code>
                  </div>
                  <div className="bg-Lightness p-4 rounded-lg">
                    <P.Container Padding={padding} className="bg-Panel/30">
                      <div className="bg-Background p-2 rounded text-sm text-center">
                        Padding: {padding}
                      </div>
                    </P.Container>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gap Variants */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">انواع Gap</h3>
            <p className="text-Mid">
              فاصله بین المان‌های فرزند را می‌توانید تنظیم کنید:
            </p>
            <div className="space-y-4">
              {(["md", "lg", "xl"] as const).map((gap) => (
                <div key={gap} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="bg-Background px-2 py-1 rounded text-sm">Gaps=&quot;{gap}&quot;</code>
                  </div>
                  <div className="bg-Lightness p-4 rounded-lg">
                    <P.Container Gaps={gap} className="bg-Panel/30">
                      <div className="bg-Background p-4 rounded text-center">آیتم 1</div>
                      <div className="bg-Background p-4 rounded text-center">آیتم 2</div>
                      <div className="bg-Background p-4 rounded text-center">آیتم 3</div>
                    </P.Container>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Combined Padding and Gap */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">ترکیب Padding و Gap</h3>
            <p className="text-Mid">
              می‌توانید Padding و Gap را همزمان تنظیم کنید:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <P.Container Padding="lg" Gaps="lg" className="bg-Panel/30">
                <div className="bg-Background p-4 rounded text-center">آیتم 1</div>
                <div className="bg-Background p-4 rounded text-center">آیتم 2</div>
                <div className="bg-Background p-4 rounded text-center">آیتم 3</div>
              </P.Container>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`<P.Container Padding="lg" Gaps="lg">
  <div>آیتم 1</div>
  <div>آیتم 2</div>
  <div>آیتم 3</div>
</P.Container>`}
              </pre>
            </div>
          </div>

          {/* Custom Styling */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">استایل‌دهی سفارشی</h3>
            <p className="text-Mid">
              می‌توانید از SectionClassName و className برای استایل‌دهی استفاده کنید:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <P.Container
                SectionClassName="bg-Success/10 mb-4"
                className="bg-Primary/10"
              >
                <div className="bg-Background p-4 rounded text-center">
                  Container با استایل سفارشی
                </div>
              </P.Container>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`<P.Container 
  SectionClassName="bg-Success/10 mb-4" 
  className="bg-Primary/10"
>
  <div>محتوای Container</div>
</P.Container>`}
              </pre>
            </div>
          </div>

          {/* No Padding */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-Text">بدون Padding</h3>
            <p className="text-Mid">
              برای حذف padding از مقدار <code className="bg-Background px-1 rounded">none</code> استفاده کنید:
            </p>
            <div className="bg-Lightness p-4 rounded-lg">
              <P.Container Padding="none" className="bg-Panel/30">
                <div className="bg-Background p-4 rounded text-center">
                  Container بدون padding
                </div>
              </P.Container>
            </div>
            <div className="bg-Shadow/50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {`<P.Container Padding="none">
  <div>محتوای Container</div>
</P.Container>`}
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
                <li>از Container برای ساختاردهی بخش‌های اصلی صفحه استفاده کنید</li>
                <li>Padding و Gap را بر اساس نیاز طراحی تنظیم کنید</li>
                <li>از SectionClassName برای استایل‌دهی section استفاده کنید</li>
                <li>از className برای استایل‌دهی div داخلی استفاده کنید</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-Text">❌ انجام ندهید:</h3>
              <ul className="list-disc list-inside space-y-1 text-Mid">
                <li>از Container برای المان‌های کوچک استفاده نکنید</li>
                <li>Padding و Gap را همزمان با margin در children تنظیم نکنید</li>
                <li>از Container به صورت تو در تو بیش از حد استفاده نکنید</li>
              </ul>
            </div>
          </div>
        </section>

        <P.Separator />

        {/* Structure */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-Text">ساختار داخلی</h2>
          <div className="bg-Lightness p-6 rounded-lg">
            <p className="text-Mid mb-4">
              Container از دو المان تشکیل شده است:
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-Background p-3 rounded">
                <code className="text-Primary">&lt;section&gt;</code> - المان بیرونی با padding
              </div>
              <div className="rtl:pr-4 ltr:pl-4 text-Mid">↓</div>
              <div className="bg-Background p-3 rounded">
                <code className="text-Primary">&lt;div&gt;</code> - المان داخلی با max-width و gap
              </div>
            </div>
          </div>
        </section>
      </P.Container>
    </>
  )
}
