import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getBreakingNewsSettings, updateBreakingNewsSettings } from '@/lib/content-engine'

/**
 * GET /api/admin/breaking-news/settings
 * Get breaking news settings
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getBreakingNewsSettings()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[BreakingNews Settings API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/breaking-news/settings
 * Update breaking news settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    await updateBreakingNewsSettings(body)

    const settings = await getBreakingNewsSettings()

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('[BreakingNews Settings API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
