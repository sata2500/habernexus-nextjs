import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { analyzeSentiment, isGeminiConfigured } from '@/lib/gemini'

/**
 * GET /api/articles/[id]/sentiment
 * Get sentiment analysis for an article
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        sentiment: true,
        sentimentScore: true,
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    // Return existing sentiment if available
    if (article.sentiment) {
      return NextResponse.json({
        sentiment: article.sentiment,
        score: article.sentimentScore,
        cached: true,
      })
    }

    // Return null if no sentiment analysis yet
    return NextResponse.json({
      sentiment: null,
      score: null,
      cached: false,
    })
  } catch (error) {
    console.error('Error fetching sentiment:', error)
    return NextResponse.json(
      { error: 'Duygu analizi alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/articles/[id]/sentiment
 * Analyze and save sentiment for an article
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    // Only authenticated users can trigger analysis
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'Gemini API yapılandırılmamış' },
        { status: 503 }
      )
    }

    const { id } = await params

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        sentiment: true,
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    // Analyze sentiment using AI
    const result = await analyzeSentiment(article.title, article.content)

    // Save to database
    await prisma.article.update({
      where: { id },
      data: {
        sentiment: result.sentiment,
        sentimentScore: result.score,
      },
    })

    return NextResponse.json({
      sentiment: result.sentiment,
      score: result.score,
      summary: result.summary,
      cached: false,
    })
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    return NextResponse.json(
      { error: 'Duygu analizi yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
