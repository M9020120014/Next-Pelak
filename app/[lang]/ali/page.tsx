// import { LANGUAGE_TYPE, LANGUAGE_LIST } from "@/config/site";
// import Link from "next/link";
// import { headers } from "next/headers";
// /* --- Functions -------------------------------------------------------------------------------- */
// export default async function AliPage({
//   params
// }: Readonly<{
//   params: Promise<{ lang: LANGUAGE_TYPE }>;
// }>) {
//   const { lang } = await params;
//   const headersList = await headers();
//   const pathname = headersList.get("x-pathname") || headersList.get("referer") || "";
//   const pathnameSplit = pathname.split(lang)[1] || "";
//   const otherLangs = LANGUAGE_LIST.filter((list) => list !== lang);
//   const otherLangsLinks = otherLangs.map((list) => {
//     return {
//       lang: list,
//       url: "/" + list + pathnameSplit
//     }
//   });
//   return (
//     <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
//       <h1>Ali</h1>
//       <p>--------------------------------</p>
//       <p>{lang}</p>
//       <p>--------------------------------</p>
//       {otherLangsLinks.map((otherLangsList ) => (
//         <Link key={otherLangsList.lang} href={otherLangsList.url}>{otherLangsList.lang}</Link>
//       ))}
//       <p>--------------------------------</p>
//       <Link href={"/" + lang}>Go to home</Link>
//     </main>
//   );
// }

// app/[lang]/ali/page.tsx   (یا هر صفحه دیگه‌ای که داری)

import { LANG_PARAMS, LANG } from "@/config/site";
import Link from "next/link";

export default async function AliPage({ params }: LANG_PARAMS) {
  const { lang, otherLanguages } = await LANG(params);
  return (
    <main className="flex flex-col gap-12 items-center justify-center w-full h-screen text-center">
      <h1 className="text-4xl font-bold">Ali Page</h1>
      <p className="text-gray-500">--------------------------------</p>
      <p className="text-2xl">زبان فعلی: <strong>{lang.toUpperCase()}</strong></p>
      <p className="text-gray-500">--------------------------------</p>
      <div className="flex gap-8">
        {otherLanguages.map((l) => (
          <Link
            key={l}
            href={`/${l}/ali`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {l.toUpperCase()}
          </Link>
        ))}
      </div>
      <p className="text-gray-500 mt-8">--------------------------------</p>
      <Link href={"/" + lang} className="text-lg text-blue-600 hover:underline" >
        بازگشت به صفحه اصلی
      </Link>
      <p className="text-gray-500 mt-8">--------------------------------</p>
      {/* <Link href={"/faa/ali"} className="text-lg text-blue-600 hover:underline URL" >
        /faa/ali
      </Link> */}
    </main>
  );
}