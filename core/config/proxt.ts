export function PROXY_CHECK_PATHNAME(pathname: string): boolean {
  if (pathname.includes('..') || pathname.includes('%2e%2e') || pathname.includes('%2f')) {
    return false
  } else {
    return true
  }
}