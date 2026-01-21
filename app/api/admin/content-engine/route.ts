import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  runContentEngine,
  getSettings,
  updateSettings,
  getLastRun,
  isEngineRunning,
  isContentEngineConfigured,
} from '@/lib/content-engine'
import { prisma } from '@/lib/prisma'
import type { EngineConfig, ContentEngineSettings } from '@/lib/content-engine'

/**
 * Content Engine v3.0 API
 * 
 * GET /api/admin/content-engine
 * Get content engine status and settings
 * 
 * POST /api/admin/content-engine
 * Run the content engine with specified configuration
 * 
 * PUT /api/admin/content-engine
 * Update content engine settings
 * 
 * @version 3.0.0
 * @lastUpdated 20 January 2026
 */

/**
 * GET /api/admin/content-engine
 * Get content engine status and settings
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [settings, lastRun, running, configured] = await Promise.all([
      getSettings(),
      getLastRun(),
      isEngineRunning(),
      Promise.resolve(isContentEngineConfigured()),
    ])

    // Check for stale runs (running for more than 30 minutes)
    let isStale = false
    let staleMinutes = 0
    
    if (running) {
      const runningRun = await prisma.contentEngineRun.findFirst({
        where: { status: 'running' },
        orderBy: { startedAt: 'desc' },
      })
      
      if (runningRun) {
        const runningTime = Date.now() - runningRun.startedAt.getTime()
        staleMinutes = Math.floor(runningTime / 60000)
        isStale = staleMinutes >= 30
      }
    }

    // Diagnostic information
    const diagnostics = {
      geminiApiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      isConfigured: configured,
      isRunning: running,
      isStale,
      staleMinutes,
      lastRun,
      settings,
      diagnostics,
    })
  } catch (error) {
    console.error('[ContentEngine API] Status error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/content-engine
 * Run the content engine
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if configured
    if (!isContentEngineConfigured()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Content engine is not configured. Please set GEMINI_API_KEY.',
        },
        { status: 400 }
      )
    }

    // Check if already running
    if (await isEngineRunning()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Content engine is already running',
        },
        { status: 409 }
      )
    }

    // Parse request body
    const config: EngineConfig = { mode: 'full' }
    
    try {
      const body = await request.json()
      
      // Support both old and new API formats
      if (body.action) {
        // Old format: action-based
        switch (body.action) {
          case 'preview':
            config.mode = 'preview'
            break
          case 'test':
            config.mode = 'preview'
            config.dryRun = true
            break
          default:
            config.mode = 'full'
        }
      } else if (body.mode) {
        config.mode = body.mode
      }
      
      // Additional options
      if (body.feedId) config.feedId = body.feedId
      if (body.maxTopicsPerFeed) config.maxTopicsPerFeed = body.maxTopicsPerFeed
      if (body.maxTopics) config.maxTopicsPerFeed = body.maxTopics // backward compat
      if (body.skipImageGeneration) config.skipImageGeneration = body.skipImageGeneration
      if (body.dryRun) config.dryRun = body.dryRun
    } catch {
      // No body or invalid JSON, use defaults
    }

    console.log(`[ContentEngine API] Starting with mode: ${config.mode}`)
    
    const startTime = Date.now()
    
    // Run the content engine
    const result = await runContentEngine(config, session.user.id)
    
    const duration = Date.now() - startTime
    
    console.log(`[ContentEngine API] Completed in ${duration}ms`)
    console.log(`[ContentEngine API] Status: ${result.status}`)
    console.log(`[ContentEngine API] Articles created: ${result.stats.articlesCreated}`)
    console.log(`[ContentEngine API] Images generated: ${result.stats.imagesGenerated}`)
    
    if (result.stats.errors.length > 0) {
      console.error('[ContentEngine API] Errors:', result.stats.errors)
    }

    // Return response with backward-compatible fields
    return NextResponse.json({
      success: result.status === 'completed',
      runId: result.runId,
      mode: result.mode,
      status: result.status,
      stats: result.stats,
      articles: result.articles,
      duration: result.duration,
      // Backward compatibility fields
      articlesCreated: result.stats.articlesCreated,
      articlesPublished: result.stats.articlesCreated,
      imagesGenerated: result.stats.imagesGenerated,
      errors: result.stats.errors,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[ContentEngine API] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        articlesCreated: 0,
        articlesPublished: 0,
        imagesGenerated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/content-engine
 * Update content engine settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updates: Partial<ContentEngineSettings> = {}

    // Validate and extract settings
    if (body.contentModel !== undefined) updates.contentModel = body.contentModel
    if (body.imageModel !== undefined) updates.imageModel = body.imageModel
    if (body.summaryModel !== undefined) updates.summaryModel = body.summaryModel
    if (body.defaultTopicsPerFeed !== undefined) updates.defaultTopicsPerFeed = parseInt(body.defaultTopicsPerFeed)
    if (body.maxConcurrentGenerations !== undefined) updates.maxConcurrentGenerations = parseInt(body.maxConcurrentGenerations)
    if (body.defaultImageMode !== undefined) updates.defaultImageMode = body.defaultImageMode
    if (body.imageQuality !== undefined) updates.imageQuality = parseInt(body.imageQuality)
    if (body.imageMaxWidth !== undefined) updates.imageMaxWidth = parseInt(body.imageMaxWidth)
    if (body.summaryCacheDays !== undefined) updates.summaryCacheDays = parseInt(body.summaryCacheDays)
    if (body.duplicateCheckDays !== undefined) updates.duplicateCheckDays = parseInt(body.duplicateCheckDays)
    if (body.duplicateSimilarityThreshold !== undefined) updates.duplicateSimilarityThreshold = parseFloat(body.duplicateSimilarityThreshold)
    if (body.cronSchedule !== undefined) updates.cronSchedule = body.cronSchedule
    if (body.isScheduleEnabled !== undefined) updates.isScheduleEnabled = body.isScheduleEnabled

    await updateSettings(updates)

    const settings = await getSettings()

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('[ContentEngine API] Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content-engine
 * Force cancel a stuck/stale engine run
 */
export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find and update any running runs to failed status
    const runningRuns = await prisma.contentEngineRun.findMany({
      where: { status: 'running' },
    })

    if (runningRuns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No running engine found',
        cancelledCount: 0,
      })
    }

    // Mark all running runs as failed
    await prisma.contentEngineRun.updateMany({
      where: { status: 'running' },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: 'Manually cancelled by admin',
      },
    })

    console.log(`[ContentEngine API] Force cancelled ${runningRuns.length} running run(s)`)

    return NextResponse.json({
      success: true,
      message: `Cancelled ${runningRuns.length} running run(s)`,
      cancelledCount: runningRuns.length,
    })
  } catch (error) {
    console.error('[ContentEngine API] Force cancel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
