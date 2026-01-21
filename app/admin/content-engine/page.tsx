'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Play, 
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Eye,
  Zap,
  Activity
} from 'lucide-react'

interface EngineStats {
  feedsProcessed: number
  topicsFound: number
  topicsSelected: number
  articlesCreated: number
  imagesGenerated: number
  errors: string[]
}

interface LastRun {
  id: string
  status: string
  startedAt: string
  completedAt: string | null
  stats: EngineStats
}

interface EngineSettings {
  contentModel: string
  imageModel: string
  summaryModel: string
  defaultTopicsPerFeed: number
  maxConcurrentGenerations: number
  defaultImageMode: string
  imageQuality: number
  imageMaxWidth: number
  summaryCacheDays: number
  duplicateCheckDays: number
  duplicateSimilarityThreshold: number
  cronSchedule: string
  isScheduleEnabled: boolean
}

interface EngineStatus {
  isConfigured: boolean
  isRunning: boolean
  isStale?: boolean
  staleMinutes?: number
  lastRun: LastRun | null
  settings: EngineSettings
  diagnostics: {
    geminiApiKey: boolean
    nodeEnv: string
    timestamp: string
  }
}

const IMAGE_MODE_OPTIONS = [
  { value: 'auto', label: 'Otomatik (AI Karar Verir)' },
  { value: 'rss', label: 'RSS Görseli Kullan' },
  { value: 'ai_original', label: 'AI ile Özgün Görsel' },
  { value: 'ai_similar', label: 'AI ile Benzer Görsel' },
]

const MODEL_OPTIONS = {
  content: [
    // Gemini 3 Series (Latest - January 2026)
    { value: 'gemini-3-flash', label: '⚡ Gemini 3 Flash (Önerilen)', badge: 'Yeni' },
    { value: 'gemini-3-pro', label: '🧠 Gemini 3 Pro (En Akıllı)', badge: 'Yeni' },
    
    // Gemini 2.5 Series (Stable)
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'Stabil' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', badge: 'Stabil' },
    
    // Gemini 2.0 Series
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  ],
  image: [
    { value: 'imagen-4.0-fast-generate-001', label: 'Imagen 4.0 Fast (Önerilen)' },
    { value: 'imagen-4.0-generate-001', label: 'Imagen 4.0' },
    { value: 'imagen-3.0-generate-001', label: 'Imagen 3.0' },
  ],
  summary: [
    { value: 'gemini-3-flash', label: '⚡ Gemini 3 Flash (Hızlı)', badge: 'Yeni' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Önerilen)', badge: 'Stabil' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  ],
}

export default function ContentEnginePage() {
  const [status, setStatus] = useState<EngineStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<EngineSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [runResult, setRunResult] = useState<{
    success: boolean
    stats?: EngineStats
    articles?: { id: string; title: string; slug: string; category: string }[]
    duration?: number
    errors?: string[]
  } | null>(null)

  // Use ref to track isRunning without triggering useEffect re-runs
  const isRunningRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sync ref with state
  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  const fetchStatus = useCallback(async (showLoadingState = false) => {
    try {
      if (showLoadingState) setIsLoading(true)
      const response = await fetch('/api/admin/content-engine')
      if (!response.ok) throw new Error('Failed to fetch status')
      const data = await response.json()
      setStatus(data)
      setSettings(data.settings)
      setIsRunning(data.isRunning)
      setError(null)
    } catch (err) {
      setError('Durum bilgisi alınamadı')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchStatus(true)
    
    // Poll status every 5 seconds - only actually fetches if isRunning
    intervalRef.current = setInterval(() => {
      if (isRunningRef.current) {
        fetchStatus(false)
      }
    }, 5000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchStatus]) // Removed isRunning from dependencies

  const handleRun = async (mode: 'full' | 'preview') => {
    setIsRunning(true)
    setRunResult(null)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run engine')
      }
      
      setRunResult({
        success: data.success,
        stats: data.stats,
        articles: data.articles,
        duration: data.duration,
        errors: data.errors,
      })
      
      // Refresh status
      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      const data = await response.json()
      setSettings(data.settings)
      setShowSettings(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ayarlar kaydedilemedi')
    } finally {
      setIsSaving(false)
    }
  }

  const handleForceCancel = async () => {
    if (!confirm('Çalışmakta olan işlemi iptal etmek istediğinize emin misiniz?')) {
      return
    }
    
    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('İptal işlemi başarısız')
      }
      
      setIsRunning(false)
      await fetchStatus(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İptal işlemi başarısız')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} saniye`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika ${seconds % 60} saniye`
    return `${Math.floor(seconds / 3600)} saat ${Math.floor((seconds % 3600) / 60)} dakika`
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">İçerik Üretim Motoru</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI destekli otomatik haber üretim sistemi v3.0
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Ayarlar
          </button>
          <button
            onClick={() => fetchStatus(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Configuration Warning */}
      {!status?.isConfigured && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-yellow-800 dark:text-yellow-200">
            İçerik motoru yapılandırılmamış. Lütfen GEMINI_API_KEY ortam değişkenini ayarlayın.
          </p>
        </div>
      )}

      {/* Stale Run Warning */}
      {status?.isStale && (
        <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-orange-800 dark:text-orange-200 font-medium">
                  İçerik motoru uzun süredir çalışıyor
                </p>
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  {status.staleMinutes && status.staleMinutes > 60 
                    ? `${Math.floor(status.staleMinutes / 60)} saat ${status.staleMinutes % 60} dakikadır çalışıyor`
                    : `${status.staleMinutes || 30}+ dakikadır çalışıyor`
                  }. İşlem takılmış olabilir.
                </p>
              </div>
            </div>
            <button
              onClick={handleForceCancel}
              className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              <XCircle className="w-4 h-4 mr-1" />
              İptal Et
            </button>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Durum</p>
            {isRunning ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Çalışıyor
              </span>
            ) : status?.isConfigured ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Hazır
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                <XCircle className="w-3 h-3 mr-1" />
                Yapılandırılmamış
              </span>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Son Çalıştırma</p>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
            {status?.lastRun ? formatDate(status.lastRun.startedAt) : 'Henüz çalıştırılmadı'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Son Üretilen Makale</p>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {status?.lastRun?.stats.articlesCreated || 0}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Son Üretilen Görsel</p>
            <ImageIcon className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {status?.lastRun?.stats.imagesGenerated || 0}
          </p>
        </div>
      </div>

      {/* Run Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Motoru Çalıştır</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Preview Mode */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Eye className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Önizleme Modu</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              RSS kaynaklarını tarar ve trend konuları analiz eder. Makale üretmez.
            </p>
            <button
              onClick={() => handleRun('preview')}
              disabled={isRunning || !status?.isConfigured}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Önizleme Başlat
            </button>
          </div>
          
          {/* Full Mode */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Zap className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Tam Üretim</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Trend konuları seçer, makaleler üretir ve görseller oluşturur.
            </p>
            <button
              onClick={() => handleRun('full')}
              disabled={isRunning || !status?.isConfigured}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Üretimi Başlat
            </button>
          </div>
        </div>
      </div>

      {/* Run Result */}
      {runResult && (
        <div className={`rounded-xl border p-6 ${
          runResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center mb-4">
            {runResult.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 mr-2" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {runResult.success ? 'Başarıyla Tamamlandı' : 'Hata Oluştu'}
            </h3>
            {runResult.duration && (
              <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 inline mr-1" />
                {formatDuration(runResult.duration)}
              </span>
            )}
          </div>
          
          {runResult.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{runResult.stats.feedsProcessed}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">RSS Kaynağı</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{runResult.stats.topicsFound}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Konu Bulundu</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{runResult.stats.topicsSelected}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Konu Seçildi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{runResult.stats.articlesCreated}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Makale Üretildi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{runResult.stats.imagesGenerated}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Görsel Üretildi</p>
              </div>
            </div>
          )}
          
          {runResult.articles && runResult.articles.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Üretilen Makaleler:</h4>
              <ul className="space-y-2">
                {runResult.articles.map((article) => (
                  <li key={article.id} className="flex items-center text-sm">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <a 
                      href={`/haber/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {article.title}
                    </a>
                    <span className="ml-2 text-xs text-gray-500">({article.category})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {runResult.errors && runResult.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Hatalar:</h4>
              <ul className="space-y-1">
                {runResult.errors.map((err, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-300">• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Last Run Details */}
      {status?.lastRun && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Son Çalıştırma Detayları</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Durum</p>
              <p className={`font-medium ${
                status.lastRun.status === 'completed' ? 'text-green-600' : 
                status.lastRun.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {status.lastRun.status === 'completed' ? 'Tamamlandı' :
                 status.lastRun.status === 'failed' ? 'Başarısız' : 'Çalışıyor'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Başlangıç</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(status.lastRun.startedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bitiş</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {status.lastRun.completedAt ? formatDate(status.lastRun.completedAt) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hatalar</p>
              <p className={`font-medium ${status.lastRun.stats.errors.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {status.lastRun.stats.errors.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && settings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Motor Ayarları</h2>
            
            <div className="space-y-6">
              {/* AI Models */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">AI Modelleri</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">İçerik Modeli</label>
                    <select
                      value={settings.contentModel}
                      onChange={(e) => setSettings({ ...settings, contentModel: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    >
                      {MODEL_OPTIONS.content.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Görsel Modeli</label>
                    <select
                      value={settings.imageModel}
                      onChange={(e) => setSettings({ ...settings, imageModel: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    >
                      {MODEL_OPTIONS.image.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Özet Modeli</label>
                    <select
                      value={settings.summaryModel}
                      onChange={(e) => setSettings({ ...settings, summaryModel: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    >
                      {MODEL_OPTIONS.summary.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Generation Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Üretim Ayarları</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Varsayılan Haber/Kaynak
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.defaultTopicsPerFeed}
                      onChange={(e) => setSettings({ ...settings, defaultTopicsPerFeed: parseInt(e.target.value) || 2 })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Eşzamanlı Üretim
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={settings.maxConcurrentGenerations}
                      onChange={(e) => setSettings({ ...settings, maxConcurrentGenerations: parseInt(e.target.value) || 2 })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Image Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Görsel Ayarları</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Varsayılan Mod</label>
                    <select
                      value={settings.defaultImageMode}
                      onChange={(e) => setSettings({ ...settings, defaultImageMode: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    >
                      {IMAGE_MODE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Kalite (%)</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={settings.imageQuality}
                      onChange={(e) => setSettings({ ...settings, imageQuality: parseInt(e.target.value) || 85 })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Maks. Genişlik (px)</label>
                    <input
                      type="number"
                      min="800"
                      max="2400"
                      step="100"
                      value={settings.imageMaxWidth}
                      onChange={(e) => setSettings({ ...settings, imageMaxWidth: parseInt(e.target.value) || 1200 })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Cache Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Önbellek Ayarları</h3>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Özet Önbellek Süresi (gün)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.summaryCacheDays}
                    onChange={(e) => setSettings({ ...settings, summaryCacheDays: parseInt(e.target.value) || 30 })}
                    className="w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                  />
                </div>
              </div>
              
              {/* Duplicate Prevention Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tekrar Önleme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Kontrol Süresi (gün)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.duplicateCheckDays}
                      onChange={(e) => setSettings({ ...settings, duplicateCheckDays: parseInt(e.target.value) || 30 })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Son kaç gün içindeki makaleleri kontrol et</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Benzerlik Eşiği (0-1)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.duplicateSimilarityThreshold}
                      onChange={(e) => setSettings({ ...settings, duplicateSimilarityThreshold: parseFloat(e.target.value) || 0.7 })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.7 = %70 benzerlik eşiği (daha yüksek = daha sıkı)</p>
                  </div>
                </div>
              </div>
              
              {/* Schedule Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Zamanlama Ayarları</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="scheduleEnabled"
                      checked={settings.isScheduleEnabled}
                      onChange={(e) => setSettings({ ...settings, isScheduleEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="scheduleEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Otomatik zamanlamayı etkinleştir
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Cron İfadesi
                    </label>
                    <input
                      type="text"
                      value={settings.cronSchedule}
                      onChange={(e) => setSettings({ ...settings, cronSchedule: e.target.value })}
                      placeholder="0 */6 * * *"
                      className="w-full max-w-xs px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Örnek: 0 */6 * * * (her 6 saatte bir)</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
