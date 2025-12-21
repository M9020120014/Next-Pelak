/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link";
/* --- Functions -------------------------------------------------------------------------------- */
export default async function NotFound({
  params
}: {
  params?: Promise<{ lang?: string }>;
}) {
  const lang = (await params)?.lang || 'unknown';
  console.log("---404---", lang);
  
  return (
    <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
      <h1>404</h1>
      <p>Page not found in [lang] segment</p>
      <p>Language: {lang}</p>
      <Link href={`/${lang === 'unknown' ? '' : lang}`}>Go back</Link>
    </main>
  );
}