/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_TYPE, LANG_FUNCTION } from "@/core/config/lang";
import { META_ROBOT_ON } from "@/core/config/meta";
/* --- Components ------------------------------------------------------------------------------ */
import PagesClient from "@/site/page/PagesClient";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Pages Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_TYPE): Promise<Metadata> {
  const { lang } = await LANG_FUNCTION(params);
  return {
    ...META_ROBOT_ON,
    title: lang === 'fa' ? 'همه صفحات' : 'All Pages',
    description: lang === 'fa' 
      ? 'در این بخش می‌توانید آخرین صفحات منتشر شده در سایت را مشاهده کنید و جزئیات هر صفحه را ببینید.'
      : 'In this section, you can view the latest published page on the site and see details of each page.',
  };
};
/* --- Pages Page ------------------------------------------------------ */
export default async function PagesPage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params);
  
  return <PagesClient lang={lang} />;
}
