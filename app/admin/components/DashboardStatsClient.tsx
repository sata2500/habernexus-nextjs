'use client'

import { useState, useEffect } from 'react'
import { 
  Newspaper, 
  Users, 
  Eye,
  Rss,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface StatsData {
  articles: { total: number; thisWeek: number; trend: number }
  users: { total: number; thisWeek: number; trend: number }
  views: { total: number; thisWeek: number; trend: number }
  rss: { total: number; active: number }
}

interface InitialStats {
  articleCount: number
  userCount: number
  feedCount: number
  totalViews: number
}

export default function DashboardStatsClient({ initialStats }: { initialStats: InitialStats }) {
  const [stats, setStats] = useState<StatsData>({
    articles: { total: initialStats.articleCount, thisWeek: 0, trend: 0 },
    users: { total: initialStats.userCount, thisWeek: 0, trend: 0 },
    views: { total: initialStats.totalViews,  thisWeek: 0, trend: 0 },
    rss: { total: initialStats.feedCount, active: initialStats.feedCount }
  })
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/admin/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    // Initial fetch to get trend data
    fetchStats()
    
    const interval = setInterval(() => {
      fetchStats()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  const statCards = [
    { name: 'Toplam Makale', value: stats.articles.total, trend: stats.articles.trend, icon: Newspaper, color: 'blue' },
    { name: 'Toplam Kullanıcı', value: stats.users.total, trend: stats.users.trend, icon: Users, color: 'green' },
    { name: 'Toplam Görüntülenme', value: stats.views.total, trend: stats.views.trend, icon: Eye, color: 'purple' },
    { name: 'Aktif RSS Kaynağı', value: stats.rss.active, trend: 0, icon: Rss, color: 'orange' },
  ]

  return (
    <div className="space-y-4">
      {/* Last Updated Info */}
      <div className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
        <button
          onClick={fetchStats}
          disabled={isRefreshing}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend > 0 ? TrendingUp : stat.trend < 0 ? TrendingDown : null
          const trendColor = stat.trend > 0 ? 'text-green-600' : stat.trend < 0 ? 'text-red-600' : 'text-gray-400'
          
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                {stat.trend !== 0 && TrendIcon && (
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{Math.abs(stat.trend)}%</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString('tr-TR')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
