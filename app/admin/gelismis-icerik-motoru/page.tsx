'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Play, 
  Eye,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  BookOpen
} from 'lucide-react'

// Updated interface to match API response
interface EngineStatus {
  isConfigured: boolean
  isRunning: boolean
  lastRun: {
    id: string
    status: string
    startedAt: string
    completedAt: string | null
    stats: {
      feedsProcessed: number
      topicsFound: number
      topicsSelected: number
      articlesCreated: number
      imagesGenerated: number
      errors: string[]
    }
  } | null
  settings: {
    contentModel: string
    imageModel: string
    summaryModel: string
    defaultTopicsPerFeed: number
    maxConcurrentGenerations: number
    defaultImageMode: string
    imageQuality: number
    imageMaxWidth: number
    summaryCacheDays: number
    cronSchedule: string
    isScheduleEnabled: boolean
  }
  diagnostics: {
    geminiApiKey: boolean
    nodeEnv: string
    timestamp: string
  }
}

interface PipelineResult {
  success: boolean
  mode: string
  runId?: string
  status?: string
  stats?: {
    feedsProcessed: number
    topicsFound: number
    topicsSelected: number
    articlesCreated: number
    imagesGenerated: number
    errors: string[]
  }
  articles?: Array<{
    id: string
    title: string
    slug: string
    category: string
  }>
  duration?: number
  errors: string[]
  // Backward compatibility
  articlesCreated?: number
  articlesPublished?: number
  imagesGenerated?: number
}

export default function AdvancedContentEnginePage() {
  const [status, setStatus] = useState<EngineStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'run'>('overview')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setError(null)
      const response = await fetch('/api/admin/content-engine')
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error('Status fetch error:', err)
      setError('Durum bilgisi alınamadı. Lütfen sayfayı yenileyin.')
    } finally {
      setLoading(false)
    }
  }

  const runAction = async (action: 'preview' | 'full') => {
    setRunning(true)
    setResult(null)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: action,
          maxTopicsPerFeed: status?.settings.defaultTopicsPerFeed || 2
        }),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setResult(data)
      
      // Refresh status after run
      await fetchStatus()
    } catch (err) {
      console.error('Action error:', err)
      setResult({
        success: false,
        mode: action,
        errors: ['İşlem sırasında bir hata oluştu'],
      })
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={() => {
            setLoading(true)
            fetchStatus()
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-500" />
            İçerik Motoru v3.0
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Akıllı konu seçimi, trend analizi ve özgün içerik üretimi
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              status?.isConfigured ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              {status?.isConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sistem Durumu</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {status?.isConfigured ? 'Hazır' : 'Yapılandırılmamış'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              status?.isRunning ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {status?.isRunning ? (
                <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
              ) : (
                <Clock className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Motor Durumu</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {status?.isRunning ? 'Çalışıyor' : 'Beklemede'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Son Çalışma</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {status?.lastRun 
                  ? new Date(status.lastRun.startedAt).toLocaleString('tr-TR')
                  : 'Henüz çalışmadı'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Son Üretilen</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {status?.lastRun?.stats.articlesCreated || 0} makale
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          İçerik Üretim Pipeline&apos;ı
        </h2>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          <div className="flex items-center gap-4 min-w-max">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">RSS Toplama</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">Trend Analizi</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">İçerik Üretimi</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">Görsel İşleme</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">Yayınlama</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4 inline-block mr-2" />
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <TestTube className="w-4 h-4 inline-block mr-2" />
              Önizleme
            </button>
            <button
              onClick={() => setActiveTab('run')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'run'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Play className="w-4 h-4 inline-block mr-2" />
              Çalıştır
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Sistem Ayarları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">İçerik Modeli</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {status?.settings.contentModel || 'gemini-2.5-flash'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Görsel Modeli</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {status?.settings.imageModel || 'imagen-4.0'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Feed Başına Konu</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {status?.settings.defaultTopicsPerFeed || 2}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Zamanlama</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {status?.settings.isScheduleEnabled 
                        ? status?.settings.cronSchedule 
                        : 'Devre dışı'}
                    </p>
                  </div>
                </div>
              </div>

              {status?.lastRun && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Son Çalışma İstatistikleri
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {status.lastRun.stats.feedsProcessed}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Feed İşlendi</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {status.lastRun.stats.topicsFound}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Konu Bulundu</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {status.lastRun.stats.topicsSelected}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Konu Seçildi</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {status.lastRun.stats.articlesCreated}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Makale Üretildi</p>
                    </div>
                    <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {status.lastRun.stats.imagesGenerated}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Görsel Üretildi</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Önizleme modu, RSS feed&apos;lerden konu toplar ve trend analizi yapar, 
                ancak içerik üretmez. Bu sayede hangi konuların seçileceğini görebilirsiniz.
              </p>
              <button
                onClick={() => runAction('preview')}
                disabled={running || status?.isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {running ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Önizleme Çalıştır
              </button>
            </div>
          )}

          {activeTab === 'run' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Tam içerik üretim pipeline&apos;ını çalıştırır. RSS feed&apos;lerden konu toplar, 
                trend analizi yapar, içerik üretir ve yayınlar.
              </p>
              <button
                onClick={() => runAction('full')}
                disabled={running || status?.isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {running ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                İçerik Üret
              </button>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${
                    result.success 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.success ? 'İşlem Başarılı' : 'İşlem Başarısız'}
                  </p>
                  {result.success && result.stats && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {result.stats.articlesCreated} makale üretildi, 
                      {result.stats.imagesGenerated} görsel oluşturuldu
                    </p>
                  )}
                  {!result.success && result.errors.length > 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {result.errors[0]}
                    </p>
                  )}
                  {result.duration && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Süre: {Math.round(result.duration / 1000)} saniye
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
