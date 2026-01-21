import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getBreakingNews, markAsBreakingNews, unmarkAsBreakingNews } from '@/lib/content-engine'

/**
 * GET /api/admin/breaking-news
 * Get all breaking news articles
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const articles = await getBreakingNews(50)

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('[BreakingNews API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/breaking-news/:id
 * Mark or unmark article as breaking news
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, priority = 2 } = body

    if (action === 'mark') {
      await markAsBreakingNews(id, priority)
    } else if (action === 'unmark') {
      await unmarkAsBreakingNews(id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[BreakingNews API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
