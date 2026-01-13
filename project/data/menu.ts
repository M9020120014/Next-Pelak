/* --- Base ------------------------------------------------------------------------------------- */
import { Svg } from '@/core/components/ui/icons/Icons';
import { LANGUAGE_TYPE } from '@/project/config/site';

/* --- Types ------------------------------------------------------------------------------------ */
export type MenuItem = {
  href: string;
  label: Record<LANGUAGE_TYPE, string>;
  icon: keyof typeof Svg;
};

/* --- Data ------------------------------------------------------------------------------------- */
export const MobileMenu: MenuItem[] = [
  {
    href: '/',
    label: {
      fa: 'خانه',
      en: 'Home',
    },
    icon: 'home',
  },
  {
    href: '/dashboard',
    label: {
      fa: 'داشبورد',
      en: 'Dashboard',
    },
    icon: 'dashboard',
  },
  {
    href: '/page',
    label: {
      fa: 'صفحه ها',
      en: 'Pages',
    },
    icon: 'default',
  },
  {
    href: '/donate',
    label: {
      fa: 'حمایت',
      en: 'Donate',
    },
    icon: 'donate',
  },
  {
    href: '/category',
    label: {
      fa: 'دسته‌بندی',
      en: 'Categories',
    },
    icon: 'category',
  },
];

