import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search?q=query - Makale arama
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Arama sorgusu en az 2 karakter olmalıdır' },
        { status: 400 }
      )
    }

    const whereClause = {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { excerpt: { contains: query } },
      ],
      ...(category && { category }),
    }

    // Toplam sonuç sayısı
    const total = await prisma.article.count({
      where: whereClause,
    })

    // Sonuçları getir
    const articles = await prisma.article.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        category: true,
        viewCount: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
          }
        }
      },
      orderBy: [
        { viewCount: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: limit,
      skip: offset,
    })

    return NextResponse.json({
      results: articles,
      total,
      query,
      limit,
      offset,
      hasMore: offset + articles.length < total,
    })
  } catch (error) {
    console.error('Arama hatası:', error)
    return NextResponse.json(
      { error: 'Arama yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
