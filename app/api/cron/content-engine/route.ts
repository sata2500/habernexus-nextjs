import { NextRequest, NextResponse } from 'next/server'
import {
  runContentEngine,
  getSettings,
  isEngineRunning,
  isContentEngineConfigured,
} from '@/lib/content-engine'

/**
 * Content Engine Cron API
 * 
 * GET /api/cron/content-engine
 * Trigger content engine via cron job
 * 
 * This endpoint is designed to be called by external cron services
 * (e.g., Vercel Cron, GitHub Actions, or external schedulers)
 * 
 * Security: Requires CRON_SECRET header for authentication
 * 
 * @version 3.0.0
 * @lastUpdated 20 January 2026
 */

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret') || 
                       request.headers.get('authorization')?.replace('Bearer ', '')
    
    const expectedSecret = process.env.CRON_SECRET
    
    if (!expectedSecret) {
      console.log('[Cron] CRON_SECRET not configured, skipping authentication')
    } else if (cronSecret !== expectedSecret) {
      console.error('[Cron] Invalid cron secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if configured
    if (!isContentEngineConfigured()) {
      console.error('[Cron] Content engine not configured')
      return NextResponse.json(
        { error: 'Content engine is not configured' },
        { status: 400 }
      )
    }

    // Check if schedule is enabled
    const settings = await getSettings()
    if (!settings.isScheduleEnabled) {
      console.log('[Cron] Schedule is disabled, skipping run')
      return NextResponse.json({
        success: false,
        message: 'Schedule is disabled',
        skipped: true,
      })
    }

    // Check if already running
    if (await isEngineRunning()) {
      console.log('[Cron] Engine is already running, skipping')
      return NextResponse.json({
        success: false,
        message: 'Engine is already running',
        skipped: true,
      })
    }

    console.log('[Cron] Starting scheduled content engine run')
    
    // Run the content engine
    const result = await runContentEngine({ mode: 'full' }, 'cron')

    console.log(`[Cron] Completed with status: ${result.status}`)
    console.log(`[Cron] Articles created: ${result.stats.articlesCreated}`)

    return NextResponse.json({
      success: result.status === 'completed',
      runId: result.runId,
      stats: result.stats,
      duration: result.duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}
