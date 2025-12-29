/* --- Hooks Loader ------------------------------------------------------------------------------- */
/* Automatically loads project-specific hooks from project/hooks directory */

/**
 * Load project-specific hooks
 * This function imports all hook files from the project/hooks directory
 * to ensure hooks are registered before they are executed
 * 
 * Note: This uses dynamic imports to avoid issues with Next.js build process
 * Hooks are registered at module load time, so importing the file is enough
 */
export async function loadProjectHooks(): Promise<void> {
  try {
    // Import project hooks - this will execute the hook registrations
    // Using dynamic import to avoid build-time issues
    await import('@/project/hooks/auth')
    
    // Add more hook files here as needed
    // Example: await import('@/project/hooks/custom')
  } catch (error) {
    // If project hooks don't exist or fail to load, that's okay
    // This allows the base system to work without project-specific hooks
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      // Project hooks file doesn't exist - this is fine, just log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[Hooks Loader] No project hooks found - this is optional')
      }
    } else {
      // Other errors should be logged
      console.error('[Hooks Loader] Error loading project hooks:', error)
    }
  }
}

/**
 * Synchronously load project hooks (for use in server-side code)
 * This is a wrapper that calls the async loader
 * Use this when you need hooks loaded immediately
 */
export function loadProjectHooksSync(): void {
  // In server-side code, we can use require for synchronous loading
  // This is safe because hooks registration is synchronous
  try {
    require('@/project/hooks/auth')
  } catch (error) {
    // If project hooks don't exist, that's okay
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      // Project hooks file doesn't exist - this is fine
      if (process.env.NODE_ENV === 'development') {
        console.log('[Hooks Loader] No project hooks found - this is optional')
      }
    } else {
      console.error('[Hooks Loader] Error loading project hooks:', error)
    }
  }
}

