/* --- Route Configuration ----------------------------------------------------------------------- */
export const ROUTES = {
  // Admin protected routes pattern
  // Matches: /{lang}/dashboard or /{lang}/profile
  ADMIN_ROUTE_PATTERN: /^\/[^\/]+\/(dashboard|profile)(\/.*)?$/,
} as const