import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/bookmarks - Kullanıcının bookmark'larını listele
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
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
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      bookmarks: bookmarks.map((b) => ({
        id: b.id,
        createdAt: b.createdAt,
        article: b.article,
      })),
    })
  } catch (error) {
    console.error('Get bookmarks error:', error)
    return NextResponse.json(
      { error: 'Bookmark listesi alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/bookmarks - Yeni bookmark ekle
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { articleId } = body

    if (!articleId) {
      return NextResponse.json(
        { error: 'Makale ID gerekli' },
        { status: 400 }
      )
    }

    // Makale var mı kontrol et
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    // Zaten bookmark'lanmış mı kontrol et
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    })

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Bu makale zaten kaydedilmiş' },
        { status: 409 }
      )
    }

    // Yeni bookmark oluştur
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        articleId,
      },
    })

    return NextResponse.json({
      success: true,
      bookmark: {
        id: bookmark.id,
        articleId: bookmark.articleId,
        createdAt: bookmark.createdAt,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create bookmark error:', error)
    return NextResponse.json(
      { error: 'Bookmark eklenemedi' },
      { status: 500 }
    )
  }
}
