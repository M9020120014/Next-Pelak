"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { usePathname } from 'next/navigation';
/* --- Components ------------------------------------------------------------------------------- */
import CategoryMenu from '@/project/components/theme/navbar/CategoryMenu';
import { ClassName as cn } from '@/core/components/ui/Pelak';
/* --- Data ------------------------------------------------------------------------------------- */
import { extractLangFromPathname } from '@/project/config/site';

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Category Page (Mobile) ----------------------------------------------- */
export default function CategoryPage() {
  const pathname = usePathname();
  const lang = extractLangFromPathname(pathname);

  return (
    <main className="min-h-screen bg-Background pt-056-M pb-056-M px-012-3">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border border-Border bg-White p-018-4 shadow-lg">
          <CategoryMenu lang={lang} />
        </div>
      </div>
    </main>
  );
}

