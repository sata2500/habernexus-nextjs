import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/breaking-news
 * Get all breaking news articles including recent candidates
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all articles that are either:
    // 1. Currently marked as breaking news
    // 2. Recently published (last 24h) that could be breaking news candidates
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { isBreakingNews: true },
          { 
            publishedAt: { gte: twentyFourHoursAgo },
            isBreakingNews: false
          }
        ]
      },
      include: {
        author: {
          select: {
            name: true,
          }
        }
      },
      orderBy: [
        { isBreakingNews: 'desc' },
        { breakingPriority: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: 100
    })

    return NextResponse.json({ 
      articles,
      stats: {
        total: articles.length,
        active: articles.filter(a => a.isBreakingNews).length,
        candidates: articles.filter(a => !a.isBreakingNews).length
      }
    })
  } catch (error) {
    console.error('[Breaking News API] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch breaking news articles' },
      { status: 500 }
    )
  }
}
