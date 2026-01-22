/* --- Base ------------------------------------------------------------------------------------- */
/* Re-export API route from core */
/* Next.js requires API routes to be in app/api/, so we re-export from core/api/integration/exams */
export { GET } from '@/core/api/integration/exams/[eurl]/route'
