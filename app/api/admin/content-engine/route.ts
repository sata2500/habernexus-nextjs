import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { processAllFeeds, getEngineStatus } from '@/lib/content-engine'

/**
 * GET /api/admin/content-engine
 * Get content engine status
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
    return NextResponse.json(status)
  } catch (error) {
    console.error('Content engine status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/content-engine
 * Trigger content generation
 */
export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await processAllFeeds()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
