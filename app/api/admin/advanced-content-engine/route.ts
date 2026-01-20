import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { 
  runAdvancedContentPipeline, 
  getAdvancedEngineStatus,
  runSingleTopicPipeline 
} from '@/lib/advanced-content-engine'
import { selectTopics } from '@/lib/topic-selector'

/**
 * GET /api/admin/advanced-content-engine
 * Get advanced content engine status and configuration
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

    const status = await getAdvancedEngineStatus()
    
    return NextResponse.json({
      ...status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[AdvancedEngine API] Status error:', error)
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
 * POST /api/admin/advanced-content-engine
 * Trigger advanced content generation pipeline
 * 
 * Body options:
 * - action: 'run' | 'preview' | 'test'
 * - maxTopics: number (optional)
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

    // Parse request body
    let action = 'run'
    let maxTopics = 5
    
    try {
      const body = await request.json()
      action = body.action || 'run'
      maxTopics = body.maxTopics || 5
    } catch {
      // Use defaults
    }

    console.log(`[AdvancedEngine API] Action: ${action}, maxTopics: ${maxTopics}`)

    // Handle different actions
    switch (action) {
      case 'preview': {
        // Preview mode: Only select topics, don't generate content
        console.log('[AdvancedEngine API] Preview mode - selecting topics only')
        const topicResult = await selectTopics(maxTopics)
        
        return NextResponse.json({
          success: topicResult.success,
          action: 'preview',
          topics: topicResult.topics.map(t => ({
            title: t.title,
            description: t.description,
            category: t.category,
            score: t.score,
            reasoning: t.reasoning,
            keywords: t.keywords,
            sourceFeed: t.sourceFeed,
          })),
          totalCollected: topicResult.totalCollected,
          totalSelected: topicResult.totalSelected,
          errors: topicResult.errors,
          timestamp: new Date().toISOString(),
        })
      }

      case 'test': {
        // Test mode: Run pipeline for first topic only
        console.log('[AdvancedEngine API] Test mode - processing single topic')
        const topicResult = await selectTopics(1)
        
        if (!topicResult.success || topicResult.topics.length === 0) {
          return NextResponse.json({
            success: false,
            action: 'test',
            error: 'No topics available for testing',
            errors: topicResult.errors,
            timestamp: new Date().toISOString(),
          })
        }

        const testResult = await runSingleTopicPipeline(topicResult.topics[0])
        
        return NextResponse.json({
          success: testResult.success,
          action: 'test',
          topic: topicResult.topics[0],
          article: testResult.article ? {
            title: testResult.article.title,
            excerpt: testResult.article.excerpt,
            category: testResult.article.category,
            tags: testResult.article.tags,
            readingTime: testResult.article.readingTime,
            citationCount: testResult.article.citations.length,
          } : null,
          research: testResult.research ? {
            findingsCount: testResult.research.findings.length,
            sourcesCount: testResult.research.sources.length,
            summary: testResult.research.summary,
            keyPoints: testResult.research.keyPoints,
          } : null,
          errors: testResult.errors,
          timestamp: new Date().toISOString(),
        })
      }

      case 'run':
      default: {
        // Full pipeline execution
        console.log('[AdvancedEngine API] Running full pipeline')
        const startTime = Date.now()
        
        const result = await runAdvancedContentPipeline()
        
        const duration = Date.now() - startTime
        
        console.log(`[AdvancedEngine API] Completed in ${duration}ms`)
        console.log(`[AdvancedEngine API] Articles published: ${result.articlesPublished}`)

        return NextResponse.json({
          ...result,
          action: 'run',
          duration,
          timestamp: new Date().toISOString(),
        })
      }
    }
  } catch (error) {
    console.error('[AdvancedEngine API] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        articlesPublished: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    )
  }
}
