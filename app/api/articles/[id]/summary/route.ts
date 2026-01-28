import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateStructuredSummary } from '@/lib/gemini'
import { getSettings } from '@/lib/content-engine'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/articles/[id]/summary
 * Generate AI summary for an article with caching support
 * 
 * Query params:
 * - force: boolean - Force regenerate summary even if cached
 * 
 * @version 3.0.0
 * @lastUpdated 20 January 2026
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const forceRegenerate = searchParams.get('force') === 'true'

    // Get article from database
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        summaryCache: true,
        summaryCachedAt: true,
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    // Check if we have a valid cached summary
    if (!forceRegenerate && article.summaryCache && article.summaryCachedAt) {
      const settings = await getSettings()
      const cacheExpiry = new Date(article.summaryCachedAt)
      cacheExpiry.setDate(cacheExpiry.getDate() + settings.summaryCacheDays)
      
      if (new Date() < cacheExpiry) {
        // Return cached summary
        try {
          const cachedData = JSON.parse(article.summaryCache)
          return NextResponse.json({
            ...cachedData,
            source: 'cache',
            cachedAt: article.summaryCachedAt,
          })
        } catch {
          // Invalid cache, continue to regenerate
        }
      }
    }

    // Check if Gemini API is configured
    if (!process.env.GEMINI_API_KEY) {
      // Return excerpt as fallback
      return NextResponse.json({
        summary: article.excerpt || article.content.substring(0, 300) + '...',
        keyPoints: [],
        readingTime: '3 dakika',
        source: 'excerpt',
      })
    }

    // Get model from settings
    const settings = await getSettings()
    const modelName = settings.summaryModel || 'gemini-2.5-flash-lite'

    // Use unified system for summary generation
    const responseData = await generateStructuredSummary(
      article.title, 
      article.content, 
      modelName
    )
    
    // Cache the summary
    await prisma.article.update({
      where: { id },
      data: {
        summaryCache: JSON.stringify(responseData),
        summaryCachedAt: new Date(),
      },
    })
    
    return NextResponse.json({
      ...responseData,
      source: 'ai',
    })
  } catch (error) {
    console.error('AI Summary error:', error)
    return NextResponse.json(
      { error: 'Özet oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
