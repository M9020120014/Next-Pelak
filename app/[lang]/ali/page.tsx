import { LANGUAGE_TYPE } from "@/config/site";
import Link from "next/link";
/* --- Functions -------------------------------------------------------------------------------- */
export default async function AliPage({
  params
}: Readonly<{
  params: Promise<{ lang: LANGUAGE_TYPE }>;
}>) {
  const { lang } = await params;
  console.log("---ALI---", lang);
  return (
    <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
      <h1>Ali</h1>
      <p>{lang}</p>
      <Link href="/">Go to home</Link>
    </main>
  );
}