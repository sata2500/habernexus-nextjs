import { 
  Newspaper, 
  Users, 
  Eye,
  Rss,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getEngineStatus } from '@/lib/content-engine'
import ContentEngineButton from './components/ContentEngineButton'

async function getStats() {
  const [articleCount, userCount, feedCount, totalViews] = await Promise.all([
    prisma.article.count(),
    prisma.user.count(),
    prisma.rssFeed.count({ where: { isActive: true } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
  ])

  return {
    articleCount,
    userCount,
    feedCount,
    totalViews: totalViews._sum.viewCount || 0,
  }
}

async function getRecentArticles() {
  return prisma.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      category: true,
      viewCount: true,
      publishedAt: true,
      slug: true,
    },
  })
}

export default async function AdminDashboard() {
  const [stats, recentArticles, engineStatus] = await Promise.all([
    getStats(),
    getRecentArticles(),
    getEngineStatus(),
  ])

  const statCards = [
    { name: 'Toplam Makale', value: stats.articleCount.toLocaleString('tr-TR'), icon: Newspaper },
    { name: 'Toplam Kullanıcı', value: stats.userCount.toLocaleString('tr-TR'), icon: Users },
    { name: 'Toplam Görüntülenme', value: stats.totalViews.toLocaleString('tr-TR'), icon: Eye },
    { name: 'Aktif RSS Kaynağı', value: stats.feedCount.toLocaleString('tr-TR'), icon: Rss },
  ]

  const systemStatus = [
    { 
      name: 'AI İçerik Motoru', 
      status: engineStatus.isConfigured ? 'active' : 'inactive',
      lastRun: engineStatus.lastGeneration 
        ? new Date(engineStatus.lastGeneration).toLocaleString('tr-TR')
        : 'Henüz çalışmadı'
    },
    { 
      name: 'RSS Tarayıcı', 
      status: engineStatus.activeFeeds > 0 ? 'active' : 'inactive',
      lastRun: `${engineStatus.activeFeeds} aktif kaynak`
    },
    { 
      name: 'Gemini API', 
      status: engineStatus.isConfigured ? 'active' : 'inactive',
      lastRun: engineStatus.isConfigured ? 'Yapılandırıldı' : 'API anahtarı gerekli'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          HaberNexus yönetim paneline hoş geldiniz
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Son Makaleler</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentArticles.length > 0 ? (
              recentArticles.map((article) => (
                <Link 
                  key={article.id} 
                  href={`/haber/${article.slug}`}
                  className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {article.title}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-500">{article.category}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {new Date(article.publishedAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center text-xs text-gray-500">
                        <Eye className="w-3 h-3 mr-1" />
                        {article.viewCount.toLocaleString('tr-TR')}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Yayında
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Henüz makale yok. AI motorunu çalıştırarak içerik üretin.
              </div>
            )}
          </div>
          {recentArticles.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/admin/makaleler" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Tüm makaleleri görüntüle →
              </Link>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sistem Durumu</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {systemStatus.map((item) => (
              <div key={item.name} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.status === 'active' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : item.status === 'scheduled' ? (
                      <Clock className="w-5 h-5 text-blue-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.lastRun}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : item.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {item.status === 'active' ? 'Aktif' : item.status === 'scheduled' ? 'Planlandı' : 'Pasif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/admin/makaleler/yeni"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Yeni Makale</span>
          </Link>
          <Link 
            href="/admin/rss"
            className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            <Rss className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">RSS Yönet</span>
          </Link>
          <Link 
            href="/admin/kullanicilar"
            className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Kullanıcılar</span>
          </Link>
          <ContentEngineButton />
        </div>
      </div>
    </div>
  )
}
