import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/comments?articleId=xxx
 * Get comments for an article
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('articleId')

    if (!articleId) {
      return NextResponse.json(
        { error: 'articleId parametresi gerekli' },
        { status: 400 }
      )
    }

    // Get approved comments with user info and likes
    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        status: 'APPROVED',
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          where: {
            status: 'APPROVED',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get current user's likes if logged in
    const session = await auth()
    let userLikes: string[] = []

    if (session?.user?.id) {
      const likes = await prisma.commentLike.findMany({
        where: {
          userId: session.user.id,
          comment: {
            articleId,
          },
        },
        select: {
          commentId: true,
        },
      })
      userLikes = likes.map((like) => like.commentId)
    }

    return NextResponse.json({
      comments,
      userLikes,
    })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Yorumlar yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/comments
 * Create a new comment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yorum yapmak için giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { articleId, content, parentId } = body

    if (!articleId || !content) {
      return NextResponse.json(
        { error: 'articleId ve content alanları gerekli' },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.length < 3) {
      return NextResponse.json(
        { error: 'Yorum en az 3 karakter olmalıdır' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Yorum en fazla 1000 karakter olabilir' },
        { status: 400 }
      )
    }

    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Yanıtlanacak yorum bulunamadı' },
          { status: 404 }
        )
      }
    }

    // Check user role - ADMIN and AUTHOR comments are auto-approved
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    const isAutoApproved = user?.role === 'ADMIN' || user?.role === 'AUTHOR'

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        articleId,
        userId: session.user.id,
        parentId: parentId || null,
        status: isAutoApproved ? 'APPROVED' : 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })

    return NextResponse.json({
      comment,
      message: isAutoApproved
        ? 'Yorumunuz başarıyla eklendi'
        : 'Yorumunuz onay bekliyor',
    })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Yorum eklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
