import { LANGUAGE_TYPE } from "@/core/config/lang";

export const pageTranslator = {
  fa: {
    title: "همه صفحات",
    description: "در این بخش می‌توانید آخرین صفحات منتشر شده در سایت را مشاهده کنید و جزئیات هر صفحه را ببینید.",
    loadMore: "مشاهده بیشتر",
    loading: "در حال بارگذاری...",
    noMoreItems: "تمام صفحات موجود نمایش داده شد.",
    emptyTitle: "صفحه‌ای یافت نشد.",
    emptyDescription: "بعداً دوباره سر بزنید، یا از منو برای یافتن صفحات دیگر استفاده کنید.",
    noImage: "تصویر صفحه یافت نشد",
  },
  en: {
    title: "All Pages",
    description: "In this section, you can view the latest published page on the site and see details of each page.",
    loadMore: "Load More",
    loading: "Loading...",
    noMoreItems: "All available page have been displayed.",
    emptyTitle: "No page found.",
    emptyDescription: "Please check back later, or use the menu to find other page.",
    noImage: "Page image not found",
  },
} as const satisfies Record<LANGUAGE_TYPE, Record<string, string>>;

