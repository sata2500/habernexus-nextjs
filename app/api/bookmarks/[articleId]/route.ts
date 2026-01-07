import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/bookmarks/[articleId] - Makale bookmark'lanmış mı kontrol et
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const session = await auth()
    const { articleId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        isBookmarked: false,
      })
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      isBookmarked: !!bookmark,
    })
  } catch (error) {
    console.error('Check bookmark error:', error)
    return NextResponse.json(
      { error: 'Bookmark durumu kontrol edilemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookmarks/[articleId] - Bookmark'ı kaldır
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const session = await auth()
    const { articleId } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Bookmark var mı kontrol et
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark bulunamadı' },
        { status: 404 }
      )
    }

    // Bookmark'ı sil
    await prisma.bookmark.delete({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Bookmark kaldırıldı',
    })
  } catch (error) {
    console.error('Delete bookmark error:', error)
    return NextResponse.json(
      { error: 'Bookmark kaldırılamadı' },
      { status: 500 }
    )
  }
}
