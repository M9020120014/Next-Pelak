"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from '@/core/components/ui/Pelak';
import { ClassName as cn } from '@/core/components/ui/Pelak';
import { useScrollDirection } from '@/core/hooks/use-scroll-direction';
import CategoryMenu from './CategoryMenu';
/* --- Data ------------------------------------------------------------------------------------- */
import { MobileMenu } from '@/project/data/menu';
import { LANG_PATHNAME } from '@/core/config/lang';
import { navbarTranslator } from '@/site/translations/navbar';

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Desktop Navbar ----------------------------------------------- */
export default function DesktopNavbar({ className }: { className?: string }) {
  /* --- Check Path ----------------- */
  const pathname = usePathname();
  const lang = LANG_PATHNAME(pathname);
  const t = navbarTranslator[lang];
  
  /* --- Hooks ---------------------- */
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const scrollDirection = useScrollDirection();
  
  /* --- Handle Scroll Direction ---- */
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY <= 50) {
        setIsVisible(true);
        return;
      }

      if (scrollDirection === 'down') {
        setIsVisible(false);
        setOpen(false);
      } else if (scrollDirection === 'up') {
        setIsVisible(true);
      }
    };
    
    /* --- Initial run -------------- */
    handleScroll();
    /* --- Add event listener ------- */
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDirection]);
  
  /* --- Run ------------------------ */
  return (
    <nav
      className={cn(
        "fixed flex justify-around items-center top-056-M left-0 right-0 bg-Background border-b border-Border h-040-8 transition-transform duration-300 ease-in-out z-99995",
        isVisible ? "translate-y-0" : "-translate-y-040-8",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex h-040-8 items-center justify-between w-full px-012-3">
        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <P.Button
            ThemeProps="ghost"
            Theme="secondary"
            Size="sm"
            className={cn(
              "flex items-center gap-2 h-034-7 px-008-2 py-008-2 mt-004-1 rounded-t-md text-sm font-medium transition-colors",
              open ? "bg-White text-Primary p-004-1" : "bg-transparent text-Mid"
            )}
          >
            <span>☰</span>
            {t.category}
            <div
              className={cn(
                "pointer-events-none absolute bottom-0 right-0 h-004-1 w-full origin-right transform bg-Primary transition-transform duration-300 ease-out",
                open ? "scale-x-full" : "scale-x-0"
              )}
            />
          </P.Button>

          {open && (
            <div className="absolute right-0 w-[800px] rounded-b-lg border border-Border bg-White p-018-4 shadow-lg">
              <CategoryMenu lang={lang} />
            </div>
          )}
        </div>

        <div className="flex flex-row-reverse justify-end items-center gap-004-1 h-034-7">
          {MobileMenu.slice(0, -1).map((item) => {
            const itemPath = item.href === '/' ? `/${lang}` : `/${lang}${item.href}`;
            const isActive = pathname === itemPath || (item.href === '/' && (pathname === `/${lang}` || pathname === '/'));
            return (
              <Link
                key={item.href}
                href={itemPath}
                className={cn(
                  "flex flex-row justify-center items-center gap-002-T h-full transition-colors p-008-2 rounded-sm",
                  isActive ? 'text-PrimaryDark bg-Secondary/12' : 'text-Mid hover:text-Primary hover:bg-Primary/12'
                )}
              >
                <P.Icon Icon={item.icon} Size="sm" active={isActive} BackColor="var(--Secondary)" />
                <span className='text-sm'>{item.label[lang]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

