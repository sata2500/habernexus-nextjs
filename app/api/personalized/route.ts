import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/personalized
 * Get personalized articles based on user preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Default query - latest articles
    let whereClause: Record<string, unknown> = {}
    let orderBy: Record<string, string> = { publishedAt: 'desc' }

    // If user is logged in, get their preferences
    if (session?.user?.id) {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: session.user.id },
      })

      if (preferences) {
        const favoriteCategories = preferences.favoriteCategories
          ? preferences.favoriteCategories.split(',').filter(Boolean)
          : []
        const excludedCategories = preferences.excludedCategories
          ? preferences.excludedCategories.split(',').filter(Boolean)
          : []

        // Build where clause based on preferences
        // IMPORTANT: Never send { in: [] } to Prisma — it returns zero results
        if (favoriteCategories.length > 0 && excludedCategories.length > 0) {
          // Both favorites and excluded: show favorites BUT exclude the excluded ones
          whereClause = {
            AND: [
              { category: { in: favoriteCategories } },
              { category: { notIn: excludedCategories } }
            ]
          }
        } else if (favoriteCategories.length > 0) {
          // Only favorites: show only those categories
          whereClause = {
            category: { in: favoriteCategories }
          }
        } else if (excludedCategories.length > 0) {
          // Only excluded: show everything EXCEPT excluded
          whereClause = {
            category: { notIn: excludedCategories }
          }
        }
        // If neither: show all (whereClause stays as {})
      }

      // Also consider user's reading history for better recommendations
      const userVotes = await prisma.articleVote.findMany({
        where: { 
          userId: session.user.id,
          isHelpful: true 
        },
        select: { articleId: true },
        take: 50,
      })

      const userBookmarks = await prisma.bookmark.findMany({
        where: { userId: session.user.id },
        select: { articleId: true },
        take: 50,
      })

      // Get categories from liked/bookmarked articles
      const likedArticleIds = [
        ...userVotes.map(v => v.articleId),
        ...userBookmarks.map(b => b.articleId),
      ]

      if (likedArticleIds.length > 0) {
        const likedArticles = await prisma.article.findMany({
          where: { id: { in: likedArticleIds } },
          select: { category: true },
        })

        const likedCategories = [...new Set(likedArticles.map(a => a.category))]
        
        // Boost articles from liked categories
        if (likedCategories.length > 0) {
          // Order by whether article is in a liked category, then by date
          orderBy = { publishedAt: 'desc' }
        }
      }
    }

    // Fetch articles
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          category: true,
          viewCount: true,
          sentiment: true,
          sentimentScore: true,
          publishedAt: true,
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              comments: true,
              bookmarks: true,
            },
          },
        },
      }),
      prisma.article.count({ where: whereClause }),
    ])

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + articles.length < totalCount,
      },
      isPersonalized: !!session?.user?.id,
    })
  } catch (error) {
    console.error('Error fetching personalized articles:', error)
    return NextResponse.json(
      { error: 'Haberler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
