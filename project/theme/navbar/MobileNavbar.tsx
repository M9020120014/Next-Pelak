"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { usePathname } from 'next/navigation';
import Link from 'next/link';
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from '@/core/components/ui/Pelak';
import { ClassName as cn } from '@/core/components/ui/Pelak';
/* --- Data ------------------------------------------------------------------------------------- */
import { MobileMenu } from '@/project/data/menu';
import { LANG_PATHNAME } from '@/core/config/lang';

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Mobile Navbar ----------------------------------------------- */
export default function MobileNavbar({ className }: { className?: string }) {
  /* --- Check Path ----------------- */
  const pathname = usePathname();
  const lang = LANG_PATHNAME(pathname);
  
  /* --- Nav ------------------------ */
  return (
    <nav
      className={cn(
        "fixed flex justify-around items-center bottom-0 left-0 right-0 bg-Background border-t border-Border h-056-M z-99995",
        className
      )}
    >
      {MobileMenu.map((item, index) => {
        const itemPath = item.href === '/' ? `/${lang}` : `/${lang}${item.href}`;
        const isActive = pathname === itemPath || (item.href === '/' && (pathname === `/${lang}` || pathname === '/'));
        return (
          <Link
            key={index}
            href={itemPath}
            className={cn(
              "flex flex-col items-center justify-center gap-002-T flex-1 h-full transition-colors",
              isActive ? 'text-PrimaryDark bg-Secondary/12' : 'text-Mid hover:text-Primary hover:bg-Primary/12'
            )}
          >
            <P.Icon Icon={item.icon} Size="sm" active={isActive} BackColor="var(--Secondary)" />
            <span className='text-sm'>{item.label[lang]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

