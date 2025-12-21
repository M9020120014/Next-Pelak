
/* --- Base ------------------------------------------------------------------------------------- */
import { cookies } from 'next/headers';
/* --- Functions -------------------------------------------------------------------------------- */
/* --- COOKIES ------------------------------------------------------ */
export default async function Cookies() {
  const COOKIES = await cookies();
  console.log(COOKIES);
  return null;
}

/* --- Get Data from Cookies ---------------------------------------- */
// async function dataFromCookies(key: string, name: string, default : string, type: Record<string, string> | undefined = undefined) {
//   if (type) {
//     const COOKIES = await cookies();
//     const cookieData = COOKIES.get(key + name)?.value;
//     if (cookieData && cookieData in type) {
//       return cookieData as keyof typeof type;
//     } else {
//       return type.default;
//     }
//   } else {
//     return default ;
//   }
// }
