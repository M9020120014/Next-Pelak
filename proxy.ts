
/* --- Base ------------------------------------------------------------------------------------- */
/* Import and re-export proxy from core */
/* Next.js requires middleware.ts (or proxy.ts) to be in root, so we import from core/proxy */
import coreProxy from '@/core/proxy'

/* --- Proxy Function --------------------------------------------------------------------------- */
/**
 * Proxy function
 * Re-exports the core proxy function for Next.js
 * Next.js accepts either default export or named "proxy" export
 */
export default coreProxy

/* --- Config ----------------------------------------------------------------------------------- */
/**
 * Middleware config
 * Next.js requires this to be exported directly in the same file (not re-exported)
 * This matches the config from core/proxy.ts
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|sitemap.xml).*)',
  ],
}
