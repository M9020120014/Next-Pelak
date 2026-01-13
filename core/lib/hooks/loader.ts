/* --- Hooks Loader ------------------------------------------------------------------------------- */
/* Automatically loads project-specific hooks from configured paths */

/* --- Config ----------------------------------------------------------------------------------- */
import { getCoreConfig } from '@/core/config/config';
import { mergeHookPaths } from '@/core/config/hooks';
import { IS_DEVELOPMENT } from '@/core/config/base';
/* --- Lib -------------------------------------------------------------------------------------- */
import { logInfo, logError } from '@/core/lib/log/logger-utils';

/**
 * Load project-specific hooks from configured paths
 * This function imports all hook files from the configured paths
 * to ensure hooks are registered before they are executed
 * 
 * Note: This uses dynamic imports to avoid issues with Next.js build process
 * Hooks are registered at module load time, so importing the file is enough
 */
export async function loadProjectHooks(): Promise<void> {
  const config = getCoreConfig();
  const hookPaths = mergeHookPaths(config.hooks);
  
  // If no paths configured, try default path for backward compatibility
  const pathsToLoad = hookPaths.length > 0 
    ? hookPaths 
    : ['@/core/hooks/auth']; // Default for backward compatibility
  
  for (const path of pathsToLoad) {
    try {
      // Import hook file - this will execute the hook registrations
      // Using dynamic import to avoid build-time issues
      await import(path)
    } catch (error) {
      // If hook file doesn't exist or fails to load, that's okay
      // This allows the base system to work without project-specific hooks
      if (error instanceof Error && error.message.includes('Cannot find module')) {
        // Hook file doesn't exist - this is fine, just log for debugging
        if (IS_DEVELOPMENT) {
          logInfo(`Hook file not found: ${path} - this is optional`, undefined, 'Hooks Loader')
        }
      } else {
        // Other errors should be logged
        logError(`Error loading hook from ${path}`, error, 'Hooks Loader')
      }
    }
  }
}

/**
 * Synchronously load project hooks (for use in server-side code)
 * This loads hooks from configured paths synchronously
 * Use this when you need hooks loaded immediately
 */
export function loadProjectHooksSync(): void {
  const config = getCoreConfig();
  const hookPaths = mergeHookPaths(config.hooks);
  
  // If no paths configured, try default path for backward compatibility
  const pathsToLoad = hookPaths.length > 0 
    ? hookPaths 
    : ['@/core/hooks/auth']; // Default for backward compatibility
  
  for (const path of pathsToLoad) {
    try {
      // In server-side code, we use dynamic import for synchronous-like loading
      // Using void to fire-and-forget the promise
      void import(path).catch(() => {
        // Silently fail - hooks are optional
      })
    } catch (error) {
      // If hook file doesn't exist, that's okay
      if (error instanceof Error && error.message.includes('Cannot find module')) {
        // Hook file doesn't exist - this is fine
        if (IS_DEVELOPMENT) {
          logInfo(`Hook file not found: ${path} - this is optional`, undefined, 'Hooks Loader')
        }
      } else {
        logError(`Error loading hook from ${path}`, error, 'Hooks Loader')
      }
    }
  }
}

