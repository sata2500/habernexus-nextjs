import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Tarih hesaplamaları
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Paralel olarak tüm istatistikleri çek
    const [
      totalArticles,
      articlesThisWeek,
      articlesLastWeek,
      totalUsers,
      usersThisWeek,
      usersLastWeek,
      totalViews,
      viewsThisWeek,
      viewsLastWeek,
      totalComments,
      pendingComments,
      commentsThisWeek,
      commentsLastWeek,
      totalRss,
      activeRss,
      totalBookmarks,
    ] = await Promise.all([
      // Makaleler
      prisma.article.count(),
      prisma.article.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.article.count({ where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } }),
      
      // Kullanıcılar
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } }),
      
      // Görüntülenme
      prisma.article.aggregate({ _sum: { viewCount: true } }),
      prisma.article.aggregate({ 
        _sum: { viewCount: true },
        where: { createdAt: { gte: oneWeekAgo } }
      }),
      prisma.article.aggregate({ 
        _sum: { viewCount: true },
        where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } }
      }),
      
      // Yorumlar
      prisma.comment.count(),
      prisma.comment.count({ where: { status: 'PENDING' } }),
      prisma.comment.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.comment.count({ where: { createdAt: { gte: twoWeeksAgo, lt: oneWeekAgo } } }),
      
      // RSS
      prisma.rssFeed.count(),
      prisma.rssFeed.count({ where: { isActive: true } }),
      
      // Bookmark
      prisma.bookmark.count(),
    ])

    // Trend hesaplama fonksiyonu
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const stats = {
      articles: {
        total: totalArticles,
        thisWeek: articlesThisWeek,
        trend: calculateTrend(articlesThisWeek, articlesLastWeek),
      },
      users: {
        total: totalUsers,
        thisWeek: usersThisWeek,
        trend: calculateTrend(usersThisWeek, usersLastWeek),
      },
      views: {
        total: totalViews._sum.viewCount || 0,
        thisWeek: viewsThisWeek._sum.viewCount || 0,
        trend: calculateTrend(
          viewsThisWeek._sum.viewCount || 0,
          viewsLastWeek._sum.viewCount || 0
        ),
      },
      comments: {
        total: totalComments,
        pending: pendingComments,
        trend: calculateTrend(commentsThisWeek, commentsLastWeek),
      },
      rss: {
        total: totalRss,
        active: activeRss,
      },
      bookmarks: totalBookmarks,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'İstatistikler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
