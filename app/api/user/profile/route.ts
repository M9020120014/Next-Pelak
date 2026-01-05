/* --- Base ------------------------------------------------------------------------------------- */
/* Re-export API route from core */
/* Next.js requires API routes to be in app/api/, so we re-export from core/app/api */
export { GET, POST } from '@/core/app/api/user/profile/route'

