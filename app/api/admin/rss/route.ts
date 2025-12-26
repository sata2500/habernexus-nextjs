import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { isValidRssUrl, fetchRssFeed } from '@/lib/rss'

/**
 * GET /api/admin/rss
 * Get all RSS feeds
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

    const feeds = await prisma.rssFeed.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(feeds)
  } catch (error) {
    console.error('Get RSS feeds error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/rss
 * Create a new RSS feed
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
    const { url, name, category } = body

    // Validate URL
    if (!url || !isValidRssUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid RSS URL' },
        { status: 400 }
      )
    }

    // Check if URL already exists
    const existing = await prisma.rssFeed.findUnique({
      where: { url },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'RSS feed URL already exists' },
        { status: 400 }
      )
    }

    // Validate feed by fetching it
    const feedData = await fetchRssFeed(url)
    if (!feedData) {
      return NextResponse.json(
        { error: 'Could not fetch RSS feed. Please check the URL.' },
        { status: 400 }
      )
    }

    // Create feed
    const feed = await prisma.rssFeed.create({
      data: {
        url,
        name: name || feedData.title || 'Unnamed Feed',
        category: category || 'Gündem',
        isActive: true,
      },
    })

    return NextResponse.json(feed, { status: 201 })
  } catch (error) {
    console.error('Create RSS feed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/rss
 * Update an RSS feed
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
    const { id, name, category, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Feed ID is required' },
        { status: 400 }
      )
    }

    const feed = await prisma.rssFeed.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(feed)
  } catch (error) {
    console.error('Update RSS feed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/rss
 * Delete an RSS feed
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Feed ID is required' },
        { status: 400 }
      )
    }

    await prisma.rssFeed.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete RSS feed error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
