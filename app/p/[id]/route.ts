/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";
/* --- Lib -------------------------------------------------------------------------------------- */
import { callRpc } from "@/core/lib/rest/rpc";
import { ENV } from "@/core/config/env";
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Language ID to Code Mapping */
const LANG_ID_TO_CODE: Record<number, string> = {
  1: "fa",
  2: "en",
};

/* --- GET Page by ID (Short Link) ------------------------------------------------------------- */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get id from params
    const { id } = await params;

    // Validate and parse id parameter
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      notFound();
    }

    const pageId = parseInt(id.trim(), 10);
    if (isNaN(pageId) || pageId < 1) {
      notFound();
    }
    
    // Call database function to get page by ID
    const result = await callRpc("pelak_page_getid", {
      p_id: pageId,
    });
    
    // Check if page was found
    if (!result.success) {
      notFound();
    }
    
    // Extract page data from response
    const page = (result as Record<string, unknown>).page as Record<string, unknown> | null;
    
    if (!page) {
      notFound();
    }
    
    // Extract url and lang from page data
    const url = page.url;
    const langId = page.lang;
    
    // Validate url exists
    if (!url || typeof url !== 'string') {
      notFound();
    }
    
    // Map language ID to language code
    if (typeof langId !== 'number' || !(langId in LANG_ID_TO_CODE)) {
      notFound();
    }
    
    const langCode = LANG_ID_TO_CODE[langId];
    
    // Redirect to the actual page URL
    // Use NextResponse.redirect() for route handlers
    return NextResponse.redirect(new URL(`/${langCode}/page/${url}`, ENV.NEXT_PUBLIC_BASE_URL), { status: 307 });
  } catch (error) {
    // If notFound() was called, it throws an error - re-throw it
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = String(error.digest);
      if (digest.includes('NEXT_NOT_FOUND')) {
        throw error;
      }
    }
    // For any other errors, call notFound()
    notFound();
  }
}

