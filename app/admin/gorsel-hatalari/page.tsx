'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Trash2,
  BarChart3,
  Clock,
  Image as ImageIcon,
  Sparkles,
  Download,
  Filter,
  Check
} from 'lucide-react'

interface ImageError {
  id: string
  source: string
  operation: string
  errorType: string
  errorMessage: string
  category: string | null
  retryCount: number
  resolved: boolean
  createdAt: string
}

interface ErrorStats {
  totalImages: number
  aiImages: number
  rssImages: number
  successRate: number
  avgDuration: number
  avgSizeReduction: number
  recentErrors: number
}

interface ErrorByType {
  errorType: string
  count: number
}

export default function ImageErrorsPage() {
  const [errors, setErrors] = useState<ImageError[]>([])
  const [totalErrors, setTotalErrors] = useState(0)
  const [stats, setStats] = useState<ErrorStats | null>(null)
  const [errorsByType, setErrorsByType] = useState<ErrorByType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedErrors, setSelectedErrors] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/image-errors?limit=100')
      if (response.ok) {
        const data = await response.json()
        setErrors(data.errors || [])
        setTotalErrors(data.totalErrors || 0)
        setStats(data.stats || null)
        setErrorsByType(data.errorsByType || [])
      }
    } catch (error) {
      console.error('Failed to fetch errors:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resolveSelected = async () => {
    if (selectedErrors.length === 0) return

    try {
      const response = await fetch('/api/admin/image-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          errorIds: selectedErrors,
        }),
      })

      if (response.ok) {
        setSelectedErrors([])
        fetchData()
      }
    } catch (error) {
      console.error('Failed to resolve errors:', error)
    }
  }

  const cleanupOldErrors = async () => {
    try {
      const response = await fetch('/api/admin/image-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cleanup',
          daysOld: 30,
        }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to cleanup errors:', error)
    }
  }

  const toggleSelectError = (id: string) => {
    setSelectedErrors(prev => 
      prev.includes(id) 
        ? prev.filter(e => e !== id)
        : [...prev, id]
    )
  }

  const selectAllVisible = () => {
    const visibleIds = filteredErrors.map(e => e.id)
    setSelectedErrors(prev => {
      const allSelected = visibleIds.every(id => prev.includes(id))
      return allSelected ? [] : visibleIds
    })
  }

  const filteredErrors = errors.filter(error => {
    if (filter === 'unresolved') return !error.resolved
    if (filter === 'resolved') return error.resolved
    return true
  })

  const getErrorTypeColor = (errorType: string): string => {
    switch (errorType) {
      case 'timeout': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'auth_error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'rate_limit': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'content_filtered': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'not_found': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'network_error': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai': return <Sparkles className="w-4 h-4 text-purple-500" />
      case 'rss': return <Download className="w-4 h-4 text-green-500" />
      default: return <ImageIcon className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Görsel Hataları</h1>
            <p className="text-sm text-gray-500">Görsel işleme hatalarını takip edin ve yönetin</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toplam İşlem</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalImages}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.successRate >= 90 ? 'bg-green-100 dark:bg-green-900' : stats.successRate >= 70 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-red-100 dark:bg-red-900'}`}>
                <BarChart3 className={`w-5 h-5 ${stats.successRate >= 90 ? 'text-green-600' : stats.successRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Başarı Oranı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ort. Süre</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgDuration}ms</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ort. Sıkıştırma</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgSizeReduction}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Types Summary */}
      {errorsByType.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Hata Türleri</h3>
          <div className="flex flex-wrap gap-2">
            {errorsByType.map((item) => (
              <span 
                key={item.errorType}
                className={`px-3 py-1 rounded-full text-sm font-medium ${getErrorTypeColor(item.errorType)}`}
              >
                {item.errorType}: {item.count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unresolved' | 'resolved')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">Tümü ({totalErrors})</option>
              <option value="unresolved">Çözülmemiş ({errors.filter(e => !e.resolved).length})</option>
              <option value="resolved">Çözülmüş ({errors.filter(e => e.resolved).length})</option>
            </select>
          </div>

          {/* Select All */}
          <button
            onClick={selectAllVisible}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            <Check className="w-4 h-4" />
            {selectedErrors.length === filteredErrors.length && filteredErrors.length > 0 ? 'Seçimi Kaldır' : 'Tümünü Seç'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selectedErrors.length > 0 && (
            <button
              onClick={resolveSelected}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Seçilenleri Çöz ({selectedErrors.length})
            </button>
          )}
          <button
            onClick={cleanupOldErrors}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eski Hataları Temizle
          </button>
        </div>
      </div>

      {/* Errors List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {filteredErrors.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">Harika! Görüntülenecek hata yok.</p>
            <p className="text-sm mt-1">Tüm görsel işlemleri başarıyla tamamlandı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Seç
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kaynak
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İşlem
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hata Türü
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mesaj
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredErrors.map((error) => (
                  <tr 
                    key={error.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedErrors.includes(error.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedErrors.includes(error.id)}
                        onChange={() => toggleSelectError(error.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(error.source)}
                        <span className="text-sm text-gray-900 dark:text-white capitalize">{error.source}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 capitalize">
                      {error.operation}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getErrorTypeColor(error.errorType)}`}>
                        {error.errorType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {error.errorMessage}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(error.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      {error.resolved ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Çözüldü
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-sm">
                          <XCircle className="w-4 h-4" />
                          Açık
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
