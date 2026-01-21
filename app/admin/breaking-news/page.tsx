'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Settings as SettingsIcon,
  RefreshCw,
  Zap,
  XCircle,
} from 'lucide-react'

interface BreakingNewsArticle {
  id: string
  title: string
  slug: string
  category: string
  isBreakingNews: boolean
  breakingPriority: number
  lastUpdatedAt: string | null
  updateCount: number
  publishedAt: string
  author: {
    name: string
  }
}

interface BreakingNewsSettings {
  enabled: boolean
  frequencyHours: number
  keywords: string[]
  autoDetect: boolean
}

export default function BreakingNewsPage() {
  const [articles, setArticles] = useState<BreakingNewsArticle[]>([])
  const [settings, setSettings] = useState<BreakingNewsSettings>({
    enabled: true,
    frequencyHours: 1,
    keywords: [],
    autoDetect: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [articlesRes, settingsRes] = await Promise.all([
        fetch('/api/admin/breaking-news'),
        fetch('/api/admin/breaking-news/settings'),
      ])

      if (articlesRes.ok) {
        const data = await articlesRes.json()
        setArticles(data.articles || [])
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleBreakingNews = async (articleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/breaking-news/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: currentStatus ? 'unmark' : 'mark', priority: 2 }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to toggle breaking news:', error)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/breaking-news/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setShowSettings(false)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getPriorityBadge = (priority: number) => {
    const badges = {
      3: { label: 'Yüksek', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      2: { label: 'Orta', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
      1: { label: 'Düşük', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    }
    const badge = badges[priority as keyof typeof badges] || badges[1]
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Son Dakika Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Acil haberleri yönetin ve ayarları değiştirin
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Ayarlar
          </button>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Son Dakika</p>
            <Zap className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {articles.filter(a => a.isBreakingNews).length}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Güncelleme Frekansı</p>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {settings.frequencyHours}h
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Otomatik Tespit</p>
            {settings.autoDetect ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
            {settings.autoDetect ? 'Aktif' : 'Kapalı'}
          </p>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Son Dakika Haberleri</h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {articles.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Henüz son dakika haberi yok</p>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {article.isBreakingNews && (
                        <Zap className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                      <Link
                        href={`/haber/${article.slug}`}
                        target="_blank"
                        className="text-gray-900 dark:text-white font-medium hover:text-blue-600 hover:underline"
                      >
                        {article.title}
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {article.category}
                      </span>
                      {article.isBreakingNews && getPriorityBadge(article.breakingPriority)}
                      <span>{article.author.name}</span>
                      <span>•</span>
                      <span>{article.updateCount} güncelleme</span>
                      {article.lastUpdatedAt && (
                        <>
                          <span>•</span>
                          <span>Son: {new Date(article.lastUpdatedAt).toLocaleString('tr-TR')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleBreakingNews(article.id, article.isBreakingNews)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex-shrink-0 ${
                      article.isBreakingNews
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {article.isBreakingNews ? 'Kaldır' : 'İşaretle'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Son Dakika Ayarları</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Otomatik Tespit
                </label>
                <input
                  type="checkbox"
                  checked={settings.autoDetect}
                  onChange={(e) => setSettings({ ...settings, autoDetect: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Güncelleme Frekansı (saat)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={settings.frequencyHours}
                  onChange={(e) => setSettings({ ...settings, frequencyHours: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Anahtar Kelimeler (virgülle ayırın)
                </label>
                <input
                  type="text"
                  value={settings.keywords.join(', ')}
                  onChange={(e) => setSettings({ ...settings, keywords: e.target.value.split(',').map(k => k.trim()) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="son dakika, breaking, acil"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
