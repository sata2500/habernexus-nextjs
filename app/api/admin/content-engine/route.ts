import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { processAllFeeds, processFeed, getEngineStatus } from '@/lib/content-engine'
import { isImagenConfigured } from '@/lib/imagen'

/**
 * GET /api/admin/content-engine
 * Get content engine status with detailed diagnostics
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

    const status = await getEngineStatus()
    const imagenConfigured = await isImagenConfigured()
    
    // Add diagnostic information
    const diagnostics = {
      geminiApiKey: !!process.env.GEMINI_API_KEY,
      imagenConfigured,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      ...status,
      diagnostics,
    })
  } catch (error) {
    console.error('Content engine status error:', error)
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
 * Trigger content generation with detailed logging
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for optional feedId in request body
    let feedId: string | undefined
    try {
      const body = await request.json()
      feedId = body.feedId
    } catch {
      // No body or invalid JSON, process all feeds
    }

    console.log('[ContentEngine API] Starting content generation...')
    console.log('[ContentEngine API] GEMINI_API_KEY configured:', !!process.env.GEMINI_API_KEY)
    
    const startTime = Date.now()
    
    let result
    if (feedId) {
      console.log(`[ContentEngine API] Processing single feed: ${feedId}`)
      result = await processFeed(feedId)
    } else {
      console.log('[ContentEngine API] Processing all feeds')
      result = await processAllFeeds()
    }
    
    const duration = Date.now() - startTime
    
    console.log(`[ContentEngine API] Completed in ${duration}ms`)
    console.log(`[ContentEngine API] Articles created: ${result.articlesCreated}`)
    console.log(`[ContentEngine API] Images generated (AI): ${result.imagesGenerated}`)
    console.log(`[ContentEngine API] Images optimized (RSS): ${result.imagesOptimized}`)
    console.log(`[ContentEngine API] Errors: ${result.errors.length}`)
    
    if (result.errors.length > 0) {
      console.error('[ContentEngine API] Errors:', result.errors)
    }

    return NextResponse.json({
      ...result,
      duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        articlesCreated: 0,
        imagesGenerated: 0,
        imagesOptimized: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    )
  }
}
