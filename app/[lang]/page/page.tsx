/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_PARAMS, LANG } from "@/project/config/site";
import { ROBOTS_ON } from "@/core/config/metadata";
/* --- Components ------------------------------------------------------------------------------ */
import PagesClient from "@/project/pages/PagesClient";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Pages Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_PARAMS): Promise<Metadata> {
  const { lang } = await LANG(params);
  return {
    ...ROBOTS_ON,
    title: lang === 'fa' ? 'همه صفحات' : 'All Pages',
    description: lang === 'fa' 
      ? 'در این بخش می‌توانید آخرین صفحات منتشر شده در سایت را مشاهده کنید و جزئیات هر صفحه را ببینید.'
      : 'In this section, you can view the latest published pages on the site and see details of each page.',
  };
};
/* --- Pages Page ------------------------------------------------------ */
export default async function PagesPage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params);
  
  return <PagesClient lang={lang} />;
}
