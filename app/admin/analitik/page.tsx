'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Newspaper, Eye, Bookmark, ThumbsUp, TrendingUp, Calendar, AlertCircle } from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalArticles: number
  totalViews: number
  totalBookmarks: number
  totalVotes: number
  totalNewsletterSubs: number
  usersByRole: { role: string; count: number }[]
  articlesByCategory: { category: string; count: number }[]
  topArticles: { id: string; title: string; viewCount: number; category: string }[]
  recentActivity: { date: string; users: number; articles: number; views: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Kullanıcı verileri
      const usersRes = await fetch('/api/admin/users')
      const users = await usersRes.json()

      // Makale verileri
      const articlesRes = await fetch('/api/admin/articles')
      const articles = await articlesRes.json()

      // Verileri işle
      const totalViews = articles.reduce((sum: number, a: { viewCount: number }) => sum + a.viewCount, 0)
      const totalBookmarks = articles.reduce((sum: number, a: { _count: { bookmarks: number } }) => sum + a._count.bookmarks, 0)
      const totalVotes = articles.reduce((sum: number, a: { _count: { votes: number } }) => sum + a._count.votes, 0)

      // Rol dağılımı
      const roleCount: Record<string, number> = {}
      users.forEach((u: { role: string }) => {
        roleCount[u.role] = (roleCount[u.role] || 0) + 1
      })
      const usersByRole = Object.entries(roleCount).map(([role, count]) => ({ role, count }))

      // Kategori dağılımı
      const categoryCount: Record<string, number> = {}
      articles.forEach((a: { category: string }) => {
        categoryCount[a.category] = (categoryCount[a.category] || 0) + 1
      })
      const articlesByCategory = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)

      // En çok okunan makaleler
      const topArticles = [...articles]
        .sort((a: { viewCount: number }, b: { viewCount: number }) => b.viewCount - a.viewCount)
        .slice(0, 5)
        .map((a: { id: string; title: string; viewCount: number; category: string }) => ({
          id: a.id,
          title: a.title,
          viewCount: a.viewCount,
          category: a.category
        }))

      // Son 7 günlük aktivite (simüle)
      const recentActivity = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
          users: Math.floor(Math.random() * 10) + 1,
          articles: Math.floor(Math.random() * 5),
          views: Math.floor(Math.random() * 500) + 100
        }
      })

      setData({
        totalUsers: users.length,
        totalArticles: articles.length,
        totalViews,
        totalBookmarks,
        totalVotes,
        totalNewsletterSubs: 0, // Newsletter API'den alınabilir
        usersByRole,
        articlesByCategory,
        topArticles,
        recentActivity
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="text-red-800 dark:text-red-200">{error || 'Veriler yüklenemedi'}</span>
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    AUTHOR: 'Yazar',
    USER: 'Kullanıcı'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analitik</h1>
          <p className="text-sm text-gray-500">Platform istatistikleri ve metrikleri</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Kullanıcılar</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Makaleler</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalArticles}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Görüntülenme</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalViews.toLocaleString('tr-TR')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Kayıtlar</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalBookmarks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <ThumbsUp className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Oylar</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalVotes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Ort. Görüntülenme</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.totalArticles > 0 ? Math.round(data.totalViews / data.totalArticles) : 0}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kullanıcı Dağılımı</h2>
          <div className="space-y-3">
            {data.usersByRole.map(({ role, count }) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{roleLabels[role] || role}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / data.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Kategori Dağılımı</h2>
          <div className="space-y-3">
            {data.articlesByCategory.slice(0, 6).map(({ category, count }) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / data.totalArticles) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Articles & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">En Çok Okunan Makaleler</h2>
          <div className="space-y-4">
            {data.topArticles.map((article, index) => (
              <div key={article.id} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{article.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{article.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.viewCount.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {data.topArticles.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Henüz makale yok</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Son 7 Günlük Aktivite
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                  <th className="text-left py-2">Tarih</th>
                  <th className="text-right py-2">Kullanıcı</th>
                  <th className="text-right py-2">Makale</th>
                  <th className="text-right py-2">Görüntülenme</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.recentActivity.map((day, index) => (
                  <tr key={index} className="border-t border-gray-100 dark:border-gray-700">
                    <td className="py-2 text-gray-600 dark:text-gray-400">{day.date}</td>
                    <td className="py-2 text-right text-gray-900 dark:text-white">{day.users}</td>
                    <td className="py-2 text-right text-gray-900 dark:text-white">{day.articles}</td>
                    <td className="py-2 text-right text-gray-900 dark:text-white">{day.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
