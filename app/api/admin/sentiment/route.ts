import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { batchAnalyzeSentiment, isGeminiConfigured } from '@/lib/gemini'

/**
 * GET /api/admin/sentiment
 * Get sentiment analysis statistics
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    const [totalArticles, analyzedArticles, sentimentCounts] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { sentiment: { not: null } } }),
      prisma.article.groupBy({
        by: ['sentiment'],
        _count: { sentiment: true },
        where: { sentiment: { not: null } },
      }),
    ])

    const sentimentStats = {
      POSITIVE: 0,
      NEGATIVE: 0,
      NEUTRAL: 0,
    }

    sentimentCounts.forEach((item) => {
      if (item.sentiment) {
        sentimentStats[item.sentiment as keyof typeof sentimentStats] = item._count.sentiment
      }
    })

    return NextResponse.json({
      totalArticles,
      analyzedArticles,
      pendingArticles: totalArticles - analyzedArticles,
      sentimentStats,
      isConfigured: isGeminiConfigured(),
    })
  } catch (error) {
    console.error('Error fetching sentiment stats:', error)
    return NextResponse.json(
      { error: 'İstatistikler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/sentiment
 * Run batch sentiment analysis on unanalyzed articles
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      )
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'Gemini API yapılandırılmamış' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const limit = Math.min(body.limit || 10, 50) // Max 50 articles per batch

    // Get unanalyzed articles
    const articles = await prisma.article.findMany({
      where: { sentiment: null },
      select: {
        id: true,
        title: true,
        content: true,
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    })

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        analyzed: 0,
        message: 'Analiz edilecek makale bulunamadı',
      })
    }

    // Run batch analysis
    const results = await batchAnalyzeSentiment(articles)

    // Update articles in database
    const updates = Array.from(results.entries()).map(([id, result]) =>
      prisma.article.update({
        where: { id },
        data: {
          sentiment: result.sentiment,
          sentimentScore: result.score,
        },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({
      success: true,
      analyzed: results.size,
      message: `${results.size} makale analiz edildi`,
    })
  } catch (error) {
    console.error('Error running batch sentiment analysis:', error)
    return NextResponse.json(
      { error: 'Toplu analiz yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
