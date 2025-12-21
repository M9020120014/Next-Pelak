/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link";
import { headers } from "next/headers";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE, LANGUAGE_LIST } from "@/config/site";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Root NotFound ------------------------------------------------ */
export default async function NotFound() {
  console.log("---n-f---");
  return (
    <html>
      <body>
        <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
          <h1>404</h1>
          <p>Page not found</p>
          <Link href={"/"+LANGUAGE.default+"/404"}>Go to localized 404 page</Link>
          <p>--------------------------------</p>
          <Link href={"/"}>Go to home</Link>
        </main>
      </body>
    </html>
  );
}