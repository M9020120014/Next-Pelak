/* --- Base ------------------------------------------------------------------------------------- */
/* Re-export API route from core */
/* Next.js requires API routes to be in app/api/, so we re-export from core/app/api */
export { POST } from '@/core/api/user/ticket/[id]/messages/route'
