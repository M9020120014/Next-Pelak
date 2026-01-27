"use client"

import { usePathname } from 'next/navigation';
/* --- Base ------------------------------------------------------------------------------------- */
import { useState, useEffect, useRef } from 'react';

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Use Scroll Direction ---------------------------------------- */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (Math.abs(scrollY - lastScrollY.current) < 14) {
        ticking.current = false;
        return;
      }

      const direction = scrollY > lastScrollY.current ? 'down' : 'up';
      setScrollDirection(direction);
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [pathname])

  return scrollDirection;
}

