import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { 
  runContentEngine, 
  getEngineStatus, 
  ContentEngineMode 
} from '@/lib/unified-content-engine'
import { isImagenConfigured } from '@/lib/imagen'

/**
 * Unified Content Engine API
 * 
 * GET /api/admin/content-engine
 * Get content engine status with detailed diagnostics
 * 
 * POST /api/admin/content-engine
 * Trigger content generation with specified mode
 * 
 * Body options:
 * - mode: 'quick' | 'standard' | 'preview' | 'test' (default: 'standard')
 * - maxTopics: number (optional)
 * - feedId: string (optional, for quick mode single feed)
 * 
 * @version 2.0.0
 * @lastUpdated 20 January 2026
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

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    let mode: ContentEngineMode = 'standard'
    let maxTopics: number | undefined
    let feedId: string | undefined
    
    try {
      const body = await request.json()
      
      // Support both old and new API formats
      if (body.action) {
        // New format: action-based
        switch (body.action) {
          case 'preview':
            mode = 'preview'
            break
          case 'test':
            mode = 'test'
            break
          case 'quick':
            mode = 'quick'
            break
          case 'run':
          default:
            mode = body.mode || 'standard'
        }
      } else if (body.mode) {
        // Direct mode specification
        mode = body.mode
      }
      
      maxTopics = body.maxTopics
      feedId = body.feedId
    } catch {
      // No body or invalid JSON, use defaults
    }

    console.log(`[ContentEngine API] Mode: ${mode}, maxTopics: ${maxTopics || 'default'}`)
    
    const startTime = Date.now()
    
    // Run the unified content engine
    const result = await runContentEngine(mode, { maxTopics, feedId })
    
    const duration = Date.now() - startTime
    
    console.log(`[ContentEngine API] Completed in ${duration}ms`)
    console.log(`[ContentEngine API] Mode: ${result.mode}`)
    console.log(`[ContentEngine API] Articles published: ${result.articlesPublished}`)
    console.log(`[ContentEngine API] Images generated (AI): ${result.imagesGenerated}`)
    console.log(`[ContentEngine API] Images optimized (RSS): ${result.imagesOptimized}`)
    
    if (result.errors.length > 0) {
      console.error('[ContentEngine API] Errors:', result.errors)
    }

    // Return response with backward-compatible fields
    return NextResponse.json({
      ...result,
      // Backward compatibility fields
      articlesCreated: result.articlesPublished,
      duration,
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
        imagesOptimized: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    )
  }
}
