import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * DELETE /api/comments/[id]
 * Delete a comment (only owner or admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        userId: true,
      },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Yorum bulunamadı' },
        { status: 404 }
      )
    }

    // Check permission
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    const isOwner = comment.userId === session.user.id
    const isAdmin = user?.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Bu yorumu silme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Delete comment (cascade will delete replies and likes)
    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Yorum başarıyla silindi',
    })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: 'Yorum silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
