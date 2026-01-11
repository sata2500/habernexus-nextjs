import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/articles - Tüm makaleleri listele
export async function GET() {
  try {
    const session = await auth()
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        _count: {
          select: {
            bookmarks: true,
            votes: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Makaleler getirilemedi:', error)
    return NextResponse.json(
      { error: 'Makaleler getirilemedi' },
      { status: 500 }
    )
  }
}
