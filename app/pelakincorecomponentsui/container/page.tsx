"use client"

import { UI as P } from "@/core/components/ui/Pelak"

export default function ContainerUiPage() {
  return (
    <main className="bg-Background xl:pt-040-8">
      <P.Container>
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-Text">Container</h1>
          <p className="text-Mid text-lg leading-relaxed">
            کامپوننت <code className="bg-Background px-2 py-1 rounded text-Primary">Container</code> یک کامپوننت لایه‌بندی قدرتمند است که برای ایجاد بخش‌های محتوا با قابلیت‌های پیشرفته چیدمان استفاده می‌شود.
          </p>

          <div className="space-y-3 text-Mid">
            <p>
              این کامپوننت یک المان <code className="bg-Background px-2 py-1">&lt;section&gt;</code> است که با کلاس‌های Tailwind CSS استایل‌دهی می‌شود و قابلیت‌های زیر را ارائه می‌دهد:
            </p>

            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>
                <strong className="text-Text">Padding:</strong> کنترل فاصله داخلی با مقادیر <code className="bg-Background px-1">xs</code>, <code className="bg-Background px-1">sm</code>, <code className="bg-Background px-1">md</code> (پیش‌فرض), <code className="bg-Background px-1">lg</code>, <code className="bg-Background px-1">xl</code> و <code className="bg-Background px-1">none</code>
              </li>
              <li>
                <strong className="text-Text">Gaps:</strong> کنترل فاصله بین المان‌های فرزند با مقادیر <code className="bg-Background px-1">md</code> (پیش‌فرض), <code className="bg-Background px-1">lg</code> و <code className="bg-Background px-1">xl</code>
              </li>
              <li>
                <strong className="text-Text">Flex:</strong> کنترل جهت چیدمان المان‌های فرزند با مقادیر <code className="bg-Background px-1">col</code> (پیش‌فرض), <code className="bg-Background px-1">row</code>, <code className="bg-Background px-1">warp</code>, <code className="bg-Background px-1">colrev</code>, <code className="bg-Background px-1">rowrev</code>, <code className="bg-Background px-1">warprev</code> و <code className="bg-Background px-1">none</code>
              </li>
              <li>
                <strong className="text-Text">MaxWidth:</strong> محدود کردن عرض حداکثر با مقادیر <code className="bg-Background px-1">xs</code> (max-w-sm), <code className="bg-Background px-1">sm</code> (max-w-xl), <code className="bg-Background px-1">md</code> (max-w-3xl), <code className="bg-Background px-1">lg</code> (max-w-5xl), <code className="bg-Background px-1">xl</code> (max-w-7xl, پیش‌فرض) و <code className="bg-Background px-1">none</code>
              </li>
            </ul>

            <div className="bg-Primary/10 border border-Primary/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-Text font-semibold mb-2">نکته مهم:</p>
              <p className="text-sm text-Mid">
                مقدار <code className="bg-Background px-1">Gaps</code> به صورت پویا بر اساس مقدار <code className="bg-Background px-1">Padding</code> تنظیم می‌شود تا هماهنگی بصری بهتری ایجاد شود.
              </p>
            </div>
          </div>
        </div>
      </P.Container>

      {/* Padding Examples */}
      <P.Container>
        <h2 className="text-2xl font-bold text-Text">مثال‌های Padding</h2>
        <p className="text-Mid">
          کنترل فاصله داخلی کامپوننت با استفاده از prop <code className="bg-Background px-2 py-1">Padding</code>
        </p>
      </P.Container>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Padding=&quot;none&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Padding="none" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            بدون padding داخلی
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Padding=&quot;xs&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Padding="xs" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            فاصله داخلی بسیار کوچک
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Padding=&quot;sm&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Padding="sm" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            فاصله داخلی کوچک
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Padding=&quot;md&quot; (پیش‌فرض)
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            فاصله داخلی متوسط (پیش‌فرض)
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Padding=&quot;lg&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Padding="lg" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            فاصله داخلی بزرگ
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Padding=&quot;xl&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Padding="xl" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            فاصله داخلی بسیار بزرگ
          </div>
        </P.Container>
      </div>

      {/* Gaps Examples */}
      <P.Container>
        <h2 className="text-2xl font-bold text-Text">مثال‌های Gaps</h2>
        <p className="text-Mid">
          کنترل فاصله بین المان‌های فرزند با استفاده از prop <code className="bg-Background px-2 py-1">Gaps</code>
        </p>
      </P.Container>


      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Gaps=&quot;md&quot; (پیش‌فرض)
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            المان اول
          </div>
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            المان دوم
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Gaps=&quot;lg&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Gaps="lg" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            المان اول
          </div>
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            المان دوم
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Gaps=&quot;xl&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Gaps="xl" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            المان اول
          </div>
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            المان دوم
          </div>
        </P.Container>
      </div>

      {/* Flex Examples */}
      <P.Container>
        <h2 className="text-2xl font-bold text-Text">مثال‌های Flex</h2>
        <p className="text-Mid">
          کنترل جهت چیدمان المان‌های فرزند با استفاده از prop <code className="bg-Background px-2 py-1">Flex</code>
        </p>
      </P.Container>
      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Flex=&quot;col&quot; (پیش‌فرض)
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container className="bg-Primary/20">
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center">
            المان اول
          </div>
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center">
            المان دوم
          </div>
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center">
            المان سوم
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Flex=&quot;row&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Flex="row" className="bg-Primary/20 min-h-[100px]">
          <div className="bg-Background/90 flex-1 min-h-080-A flex justify-center items-center">
            المان اول
          </div>
          <div className="bg-Background/90 flex-1 min-h-080-A flex justify-center items-center">
            المان دوم
          </div>
          <div className="bg-Background/90 flex-1 min-h-080-A flex justify-center items-center">
            المان سوم
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Flex=&quot;colrev&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Flex="colrev" className="bg-Primary/20">
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center">
            المان اول (نمایش در انتها)
          </div>
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center">
            المان دوم
          </div>
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center">
            المان سوم (نمایش در ابتدا)
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Flex=&quot;rowrev&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Flex="rowrev" className="bg-Primary/20 min-h-[100px]">
          <div className="bg-Background/90 flex-1 min-h-080-A flex justify-center items-center">
            المان اول (نمایش در انتها)
          </div>
          <div className="bg-Background/90 flex-1 min-h-080-A flex justify-center items-center">
            المان دوم
          </div>
          <div className="bg-Background/90 flex-1 min-h-080-A flex justify-center items-center">
            المان سوم (نمایش در ابتدا)
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Flex=&quot;warp&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Flex="warp" className="bg-Primary/20">
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center w-[200px]">
            المان اول
          </div>
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center w-[200px]">
            المان دوم
          </div>
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center w-[200px]">
            المان سوم
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Flex=&quot;warprev&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Flex="warprev" className="bg-Primary/20">
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center w-[200px]">
            المان اول (نمایش در انتها)
          </div>
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center w-[200px]">
            المان دوم
          </div>
          <div className="bg-Background/90 min-h-[50px] flex justify-center items-center w-[200px]">
            المان سوم (نمایش در ابتدا)
          </div>
        </P.Container>
      </div>

      {/* MaxWidth Examples */}
      <P.Container>
        <h2 className="text-2xl font-bold text-Text">مثال‌های MaxWidth</h2>
        <p className="text-Mid">
          کنترل عرض حداکثر کامپوننت با استفاده از prop <code className="bg-Background px-2 py-1">MaxWidth</code>
        </p>
      </P.Container>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          MaxWidth=&quot;xl&quot; (پیش‌فرض) - max-w-7xl mx-auto
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            عرض محدود شده به max-w-7xl و در مرکز قرار گرفته
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          MaxWidth=&quot;lg&quot; - max-w-5xl mx-auto
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container MaxWidth="lg" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            عرض محدود شده به max-w-5xl و در مرکز قرار گرفته
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          MaxWidth=&quot;md&quot; - max-w-3xl mx-auto
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container MaxWidth="md" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            عرض محدود شده به max-w-3xl و در مرکز قرار گرفته
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          MaxWidth=&quot;sm&quot; - max-w-xl mx-auto
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container MaxWidth="sm" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            عرض محدود شده به max-w-xl و در مرکز قرار گرفته
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          MaxWidth=&quot;xs&quot; - max-w-sm mx-auto
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container MaxWidth="xs" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            عرض محدود شده به max-w-sm و در مرکز قرار گرفته
          </div>
        </P.Container>
      </div>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          MaxWidth=&quot;none&quot; - عرض کامل صفحه
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container MaxWidth="none" className="bg-Primary/20">
          <div className="bg-Background/90 w-full min-h-080-A flex justify-center items-center">
            بدون محدودیت عرض - عرض کامل صفحه
          </div>
        </P.Container>
      </div>

      {/* Combined Examples */}
      <P.Container>
        <h2 className="text-2xl font-bold text-Text">مثال‌های ترکیبی</h2>
        <p className="text-Mid">
          استفاده همزمان از چند prop برای ایجاد چیدمان‌های پیچیده‌تر
        </p>
      </P.Container>

      <P.Container>
        <p className="text-Mid text-center" style={{direction:"ltr"}}>
          Padding=&quot;lg&quot; + Gaps=&quot;xl&quot; + Flex=&quot;row&quot;
        </p>
      </P.Container>

      <div className="bg-Primary/20">
        <P.Container Padding="lg" Gaps="xl" Flex="row" className="bg-Primary/20 min-h-[120px]">
          <div className="bg-Background/90 flex-1 flex justify-center items-center">
            المان اول
          </div>
          <div className="bg-Background/90 flex-1 flex justify-center items-center">
            المان دوم
          </div>
        </P.Container>
      </div>

    </main >
  )
}
