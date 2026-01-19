'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Activity, 
  Newspaper, 
  MessageCircle, 
  Users, 
  Rss,
  Filter,
  RefreshCw,
  Clock
} from 'lucide-react'
import { LoadingState, ErrorState } from '@/components/admin/ui'

interface ActivityItem {
  id: string
  type: 'article' | 'comment' | 'user' | 'rss'
  action: string
  title: string
  description: string
  user: string
  createdAt: string
}

const typeConfig: Record<string, { icon: typeof Activity; color: string; label: string }> = {
  article: { icon: Newspaper, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', label: 'Makale' },
  comment: { icon: MessageCircle, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', label: 'Yorum' },
  user: { icon: Users, color: 'text-green-600 bg-green-100 dark:bg-green-900/30', label: 'Kullanıcı' },
  rss: { icon: Rss, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', label: 'RSS' },
}

const actionLabels: Record<string, string> = {
  CREATE: 'oluşturuldu',
  UPDATE: 'güncellendi',
  DELETE: 'silindi',
  APPROVE: 'onaylandı',
  REJECT: 'reddedildi',
  PUBLISH: 'yayınlandı',
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? `?type=${filter}` : ''
      const response = await fetch(`/api/admin/activity${params}`)
      if (!response.ok) throw new Error('Aktiviteler yüklenemedi')
      const data = await response.json()
      setActivities(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Az önce'
    if (diffMins < 60) return `${diffMins} dakika önce`
    if (diffHours < 24) return `${diffHours} saat önce`
    if (diffDays < 7) return `${diffDays} gün önce`
    return date.toLocaleDateString('tr-TR')
  }

  if (loading) {
    return <LoadingState message="Aktiviteler yükleniyor..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Yükleme Hatası"
        message={error}
        onRetry={fetchActivities}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aktivite Geçmişi</h1>
            <p className="text-sm text-gray-500">Son işlemleri takip edin</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchActivities}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Tümü
        </button>
        {Object.entries(typeConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {config.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {activities.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity) => {
              const config = typeConfig[activity.type]
              const Icon = config?.icon || Activity

              return (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config?.color || 'bg-gray-100'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {actionLabels[activity.action] || activity.action}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{activity.user}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Henüz aktivite kaydı yok</p>
          </div>
        )}
      </div>
    </div>
  )
}
