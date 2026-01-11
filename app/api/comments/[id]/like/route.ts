import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/comments/[id]/like
 * Toggle like on a comment
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Beğenmek için giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Yorum bulunamadı' },
        { status: 404 }
      )
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: id,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id,
        },
      })

      // Get updated like count
      const likeCount = await prisma.commentLike.count({
        where: { commentId: id },
      })

      return NextResponse.json({
        liked: false,
        likeCount,
        message: 'Beğeni kaldırıldı',
      })
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          userId: session.user.id,
          commentId: id,
        },
      })

      // Get updated like count
      const likeCount = await prisma.commentLike.count({
        where: { commentId: id },
      })

      return NextResponse.json({
        liked: true,
        likeCount,
        message: 'Yorum beğenildi',
      })
    }
  } catch (error) {
    console.error('Like comment error:', error)
    return NextResponse.json(
      { error: 'Beğeni işlemi sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
