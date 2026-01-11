import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/admin/comments/[id]
 * Update comment status (approve/reject)
 */
export async function PATCH(
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

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        { error: 'Geçerli bir durum belirtmelisiniz' },
        { status: 400 }
      )
    }

    // Update comment
    const comment = await prisma.comment.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      comment,
      message: status === 'APPROVED' ? 'Yorum onaylandı' : 'Yorum reddedildi',
    })
  } catch (error) {
    console.error('Update comment status error:', error)
    return NextResponse.json(
      { error: 'Yorum durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/comments/[id]
 * Delete a comment (admin only)
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

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Delete comment
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
