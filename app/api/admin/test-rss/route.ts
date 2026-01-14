import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { fetchRssFeed, isValidRssUrl } from '@/lib/rss'

/**
 * POST /api/admin/test-rss
 * Test an RSS feed URL and return sample data
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

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    if (!isValidRssUrl(url)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid RSS URL format',
      })
    }

    console.log(`[RSS Test] Testing URL: ${url}`)

    // Fetch the RSS feed
    const feedData = await fetchRssFeed(url)

    if (!feedData) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch or parse RSS feed. Please check the URL.',
      })
    }

    // Extract sample items
    const sampleItems = feedData.items.slice(0, 5).map(item => ({
      title: item.title || 'No title',
      imageUrl: item.imageUrl || null,
      pubDate: item.pubDate || null,
    }))

    return NextResponse.json({
      success: true,
      title: feedData.title || 'Untitled Feed',
      itemCount: feedData.items.length,
      sampleItems,
    })
  } catch (error) {
    console.error('RSS test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
}
