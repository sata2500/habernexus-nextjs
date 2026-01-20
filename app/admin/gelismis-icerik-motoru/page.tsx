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
  BookOpen,
  Zap
} from 'lucide-react'

interface PipelineStage {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: number
  endTime?: number
  details?: string
}

interface TopicPreview {
  title: string
  description: string
  category: string
  score: number
  reasoning: string
  keywords: string[]
  sourceFeed: string
}

interface EngineStatus {
  isConfigured: boolean
  isResearchEnabled: boolean
  isImageGenEnabled: boolean
  config: {
    maxTopics: number
    minQualityScore: number
    enableResearch: boolean
    enableImageGeneration: boolean
    parallelResearch: boolean
  }
  lastRun: string | null
  stats: {
    totalArticles: number
    articlesWithResearch: number
    averageQuality: number
  }
}

interface PipelineResult {
  success: boolean
  action: string
  stages?: PipelineStage[]
  topics?: TopicPreview[]
  topicsSelected?: number
  topicsResearched?: number
  articlesGenerated?: number
  articlesPublished?: number
  imagesGenerated?: number
  imagesOptimized?: number
  totalDuration?: number
  errors: string[]
  articles?: Array<{
    title: string
    slug: string
    category: string
    qualityScore: number
    imageSource: string
  }>
  topic?: TopicPreview
  article?: {
    title: string
    excerpt: string
    category: string
    tags: string[]
    readingTime: number
    citationCount: number
  }
  research?: {
    findingsCount: number
    sourcesCount: number
    summary: string
    keyPoints: string[]
  }
}

export default function AdvancedContentEnginePage() {
  const [status, setStatus] = useState<EngineStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'test' | 'run'>('overview')
  const [previewTopics, setPreviewTopics] = useState<TopicPreview[]>([])

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/advanced-content-engine')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Status fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAction = async (action: 'preview' | 'test' | 'run') => {
    setRunning(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/admin/advanced-content-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          maxTopics: status?.config.maxTopics || 5
        }),
      })
      
      const data = await response.json()
      setResult(data)
      
      if (action === 'preview' && data.topics) {
        setPreviewTopics(data.topics)
      }
      
      // Refresh status after run
      if (action === 'run') {
        await fetchStatus()
      }
    } catch (error) {
      console.error('Action error:', error)
      setResult({
        success: false,
        action,
        errors: ['İşlem sırasında bir hata oluştu'],
      })
    } finally {
      setRunning(false)
    }
  }

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
            Gelişmiş İçerik Motoru
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Akıllı konu seçimi, derinlemesine araştırma ve özgün içerik üretimi
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
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Araştırma</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {status?.isResearchEnabled ? 'Aktif' : 'Devre Dışı'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Görsel Üretimi</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {status?.isImageGenEnabled ? 'Aktif' : 'Devre Dışı'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Makale</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {status?.stats.totalArticles || 0}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">Konu Seçimi</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">Araştırma</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">Sentez</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">Yayınlama</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: Eye },
              { id: 'preview', label: 'Konu Önizleme', icon: Target },
              { id: 'test', label: 'Test Modu', icon: TestTube },
              { id: 'run', label: 'Tam Çalıştır', icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Sistem Yapılandırması</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Maksimum Konu Sayısı</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {status?.config.maxTopics || 5}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Minimum Kalite Skoru</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {status?.config.minQualityScore || 50}/100
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Paralel Araştırma</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {status?.config.parallelResearch ? 'Aktif' : 'Sıralı'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Son Çalışma</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {status?.lastRun 
                      ? new Date(status.lastRun).toLocaleString('tr-TR')
                      : 'Henüz çalışmadı'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Konu Önizleme</h3>
                <button
                  onClick={() => runAction('preview')}
                  disabled={running}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {running ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  Konuları Önizle
                </button>
              </div>
              
              {previewTopics.length > 0 && (
                <div className="space-y-3">
                  {previewTopics.map((topic, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {topic.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {topic.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                              {topic.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              Kaynak: {topic.sourceFeed}
                            </span>
                          </div>
                          {topic.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {topic.keywords.map((kw, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {topic.score}
                          </div>
                          <div className="text-xs text-gray-500">puan</div>
                        </div>
                      </div>
                      {topic.reasoning && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                          &quot;{topic.reasoning}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Test Modu</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tek bir konu için tam pipeline&apos;ı test edin
                  </p>
                </div>
                <button
                  onClick={() => runAction('test')}
                  disabled={running}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {running ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  Test Et
                </button>
              </div>

              {result?.action === 'test' && (
                <div className="space-y-4">
                  {result.topic && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Seçilen Konu
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 mt-1">
                        {result.topic.title}
                      </p>
                    </div>
                  )}

                  {result.research && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        Araştırma Sonuçları
                      </h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Özet:</strong> {result.research.summary}
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Bulgular:</strong> {result.research.findingsCount} adet
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Kaynaklar:</strong> {result.research.sourcesCount} adet
                        </p>
                      </div>
                    </div>
                  )}

                  {result.article && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-medium text-purple-900 dark:text-purple-100">
                        Üretilen Makale
                      </h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-purple-800 dark:text-purple-200 font-medium">
                          {result.article.title}
                        </p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          {result.article.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-purple-600 dark:text-purple-400">
                          <span>Kategori: {result.article.category}</span>
                          <span>Okuma: {result.article.readingTime} dk</span>
                          <span>Atıflar: {result.article.citationCount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.errors.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h4 className="font-medium text-red-900 dark:text-red-100">Hatalar</h4>
                      <ul className="mt-2 space-y-1">
                        {result.errors.map((error, i) => (
                          <li key={i} className="text-sm text-red-800 dark:text-red-200">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'run' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Tam Pipeline Çalıştır</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tüm aşamaları çalıştırarak içerik üretin ve yayınlayın
                  </p>
                </div>
                <button
                  onClick={() => runAction('run')}
                  disabled={running}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {running ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Çalıştır
                </button>
              </div>

              {result?.action === 'run' && (
                <div className="space-y-4">
                  {/* Pipeline Stages */}
                  {result.stages && (
                    <div className="space-y-2">
                      {result.stages.map((stage, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          {getStageIcon(stage.status)}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {stage.name}
                            </p>
                            {stage.details && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {stage.details}
                              </p>
                            )}
                          </div>
                          {stage.endTime && stage.startTime && (
                            <span className="text-xs text-gray-500">
                              {((stage.endTime - stage.startTime) / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {result.topicsSelected || 0}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Seçilen Konu</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {result.topicsResearched || 0}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">Araştırılan</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {result.articlesPublished || 0}
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">Yayınlanan</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {result.totalDuration ? (result.totalDuration / 1000).toFixed(1) : 0}s
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300">Toplam Süre</p>
                    </div>
                  </div>

                  {/* Published Articles */}
                  {result.articles && result.articles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Yayınlanan Makaleler
                      </h4>
                      {result.articles.map((article, index) => (
                        <div 
                          key={index}
                          className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <p className="font-medium text-gray-900 dark:text-white">
                            {article.title}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>{article.category}</span>
                            <span>Kalite: {article.qualityScore}/100</span>
                            <span>Görsel: {article.imageSource}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Errors */}
                  {result.errors.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <h4 className="font-medium text-red-900 dark:text-red-100">Hatalar</h4>
                      <ul className="mt-2 space-y-1">
                        {result.errors.map((error, i) => (
                          <li key={i} className="text-sm text-red-800 dark:text-red-200">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
