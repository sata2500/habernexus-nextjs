/**
 * Next.js Instrumentation
 * This file runs once when the server starts
 * Used to initialize the content scheduler
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Initializing server-side services...')
    
    try {
      // Dynamic import to avoid issues with edge runtime
      const { initializeScheduler } = await import('@/lib/scheduler')
      
      // Initialize the content scheduler
      await initializeScheduler()
      console.log('[Instrumentation] Content scheduler initialized')
    } catch (error) {
      console.error('[Instrumentation] Failed to initialize scheduler:', error)
    }
  }
}
