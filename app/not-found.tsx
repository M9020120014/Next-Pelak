"use client";
/* --- Base ------------------------------------------------------------------------------------- */
import { useRouter } from "next/navigation";
import Link from "next/link";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE } from "@/config/site";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Root NotFound ------------------------------------------------ */
export default function NotFound() {
  const router = useRouter();
  return (
    <html>
      <body>
        <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
          <h1>404</h1>
          <p>Page not found</p>
          <Link href={"/"+LANGUAGE.default+"/404"}>Go to localized 404 page</Link>
          <p>--------------------------------</p>
          <button onClick={() => router.back()}>Back</button>
          <p>--------------------------------</p>
          <Link href={"/"+LANGUAGE.default}>Go to home</Link>
          <p>--------------------------------</p>
        </main>
      </body>
    </html>
  );
}