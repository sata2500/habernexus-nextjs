import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/activity
 * 
 * Son aktiviteleri listeler
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') // article, comment, user, rss

    // Son makaleleri al
    const recentArticles = await prisma.article.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Son yorumları al
    const recentComments = await prisma.comment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        article: {
          select: {
            title: true,
          },
        },
      },
    })

    // Son kullanıcıları al
    const recentUsers = await prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Aktiviteleri birleştir ve sırala
    const activities = [
      ...recentArticles.map((article) => ({
        id: `article-${article.id}`,
        type: 'article' as const,
        action: 'CREATE' as const,
        title: article.title,
        description: `Yeni makale oluşturuldu`,
        user: article.author?.name || article.author?.email || 'Bilinmeyen',
        createdAt: article.createdAt.toISOString(),
      })),
      ...recentComments.map((comment) => ({
        id: `comment-${comment.id}`,
        type: 'comment' as const,
        action: comment.status === 'APPROVED' ? 'APPROVE' : comment.status === 'REJECTED' ? 'REJECT' : 'CREATE',
        title: comment.article?.title || 'Bilinmeyen makale',
        description: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
        user: comment.user?.name || comment.user?.email || 'Bilinmeyen',
        createdAt: comment.createdAt.toISOString(),
      })),
      ...recentUsers.map((user) => ({
        id: `user-${user.id}`,
        type: 'user' as const,
        action: 'CREATE' as const,
        title: user.name || user.email || 'Bilinmeyen',
        description: `Yeni kullanıcı kaydı (${user.role})`,
        user: user.name || user.email || 'Bilinmeyen',
        createdAt: user.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    // Tip filtreleme
    const filteredActivities = type 
      ? activities.filter((a) => a.type === type)
      : activities

    return NextResponse.json(filteredActivities)
  } catch (error) {
    console.error('Activity log error:', error)
    return NextResponse.json(
      { error: 'Aktivite logları yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
