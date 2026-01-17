import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/users/[username]/articles
 * Get articles by a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Find user by username or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { id: username }
        ]
      },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Get user's articles
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { authorId: user.id },
        orderBy: { publishedAt: 'desc' },
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
          publishedAt: true,
          _count: {
            select: {
              comments: true,
              bookmarks: true,
              votes: { where: { isHelpful: true } }
            }
          }
        }
      }),
      prisma.article.count({
        where: { authorId: user.id }
      })
    ])

    return NextResponse.json({
      articles: articles.map(article => ({
        ...article,
        commentCount: article._count.comments,
        bookmarkCount: article._count.bookmarks,
        likeCount: article._count.votes,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching user articles:', error)
    return NextResponse.json(
      { error: 'Makaleler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
