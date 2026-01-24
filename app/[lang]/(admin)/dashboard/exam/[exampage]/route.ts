/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server";

/* --- GET Redirect Handler --------------------------------------------------------------------- */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; exampage: string }> }
) {
  const { lang } = await params;
  
  // Redirect to exam list page
  const redirectUrl = new URL(`/${lang}/dashboard/exam`, request.url);
  
  return NextResponse.redirect(redirectUrl, { status: 307 });
}
