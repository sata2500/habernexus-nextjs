'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { 
  FlaskConical, 
  Rss, 
  Sparkles, 
  Play, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  Clock,
  Loader2
} from 'lucide-react'
import { CATEGORY_NAMES } from '@/lib/constants'

interface RssFeed {
  id: string
  name: string
  url: string
  category: string
  isActive: boolean
}

interface RssTestResult {
  success: boolean
  title?: string
  itemCount?: number
  sampleItems?: Array<{ title: string; imageUrl?: string }>
  error?: string
}

interface ImageTestResult {
  success: boolean
  imageUrl?: string
  error?: string
  retryCount?: number
  duration?: number
}

interface PromptTemplate {
  id: string
  name: string
  displayName: string
  type: string
  template: string
}

export default function TestEnvironmentPage() {
  // RSS Test State
  const [feeds, setFeeds] = useState<RssFeed[]>([])
  const [selectedFeed, setSelectedFeed] = useState<string>('')
  const [customRssUrl, setCustomRssUrl] = useState('')
  const [rssTestResult, setRssTestResult] = useState<RssTestResult | null>(null)
  const [rssLoading, setRssLoading] = useState(false)

  // Image Test State
  const [imageTitle, setImageTitle] = useState('Yapay zeka teknolojisinde yeni gelişmeler')
  const [imageCategory, setImageCategory] = useState('Teknoloji')
  const [imageModel, setImageModel] = useState('imagen-4.0-fast-generate-001')
  const [imageTestResult, setImageTestResult] = useState<ImageTestResult | null>(null)
  const [imageLoading, setImageLoading] = useState(false)

  // Prompt Test State
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<string>('')
  const [promptPreview, setPromptPreview] = useState('')

  // Error Stats State
  const [errorStats, setErrorStats] = useState<{
    recentErrors: number
    successRate: number
    avgDuration: number
  } | null>(null)

  // Merkezi kategori listesi kullanılıyor
  const categories = CATEGORY_NAMES

  const imageModels = [
    { value: 'imagen-4.0-fast-generate-001', label: 'Imagen 4.0 Fast (Önerilen)' },
    { value: 'imagen-4.0-generate-001', label: 'Imagen 4.0 Standard' },
    { value: 'imagen-4.0-ultra-generate-001', label: 'Imagen 4.0 Ultra' },
  ]

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [feedsRes, promptsRes, errorsRes] = await Promise.all([
        fetch('/api/admin/rss'),
        fetch('/api/admin/prompts'),
        fetch('/api/admin/image-errors?limit=1'),
      ])

      if (feedsRes.ok) {
        const feedsData = await feedsRes.json()
        setFeeds(feedsData)
      }

      if (promptsRes.ok) {
        const promptsData = await promptsRes.json()
        setPrompts(promptsData)
      }

      if (errorsRes.ok) {
        const errorsData = await errorsRes.json()
        setErrorStats({
          recentErrors: errorsData.stats?.recentErrors || 0,
          successRate: errorsData.stats?.successRate || 100,
          avgDuration: errorsData.stats?.avgDuration || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Test RSS Feed
  const testRssFeed = async () => {
    const url = customRssUrl || feeds.find(f => f.id === selectedFeed)?.url
    if (!url) return

    setRssLoading(true)
    setRssTestResult(null)

    try {
      const response = await fetch('/api/admin/test-rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()
      setRssTestResult(result)
    } catch (error) {
      setRssTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
      })
    } finally {
      setRssLoading(false)
    }
  }

  // Test Image Generation
  const testImageGeneration = async () => {
    setImageLoading(true)
    setImageTestResult(null)

    const startTime = Date.now()

    try {
      const response = await fetch('/api/admin/imagen-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: imageTitle,
          category: imageCategory,
          model: imageModel,
        }),
      })

      const result = await response.json()
      setImageTestResult({
        ...result,
        duration: Date.now() - startTime,
      })
    } catch (error) {
      setImageTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        duration: Date.now() - startTime,
      })
    } finally {
      setImageLoading(false)
    }
  }

  // Preview Prompt
  const previewPrompt = useCallback(() => {
    const prompt = prompts.find(p => p.id === selectedPrompt)
    if (prompt) {
      // Simple variable replacement for preview
      let preview = prompt.template
      preview = preview.replace(/\{\{title\}\}/g, imageTitle)
      preview = preview.replace(/\{\{category\}\}/g, imageCategory)
      preview = preview.replace(/\{\{style\}\}/g, `${imageCategory} kategorisine uygun stil`)
      setPromptPreview(preview)
    }
  }, [prompts, selectedPrompt, imageTitle, imageCategory])

  useEffect(() => {
    if (selectedPrompt) {
      previewPrompt()
    }
  }, [selectedPrompt, previewPrompt])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Ortamı</h1>
          <p className="text-sm text-gray-500">RSS kaynaklarını ve AI görsel üretimini test edin</p>
        </div>
      </div>

      {/* Quick Stats */}
      {errorStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Başarı Oranı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{errorStats.successRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ort. Süre</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{errorStats.avgDuration}ms</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${errorStats.recentErrors > 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <AlertCircle className={`w-5 h-5 ${errorStats.recentErrors > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Son 24s Hata</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{errorStats.recentErrors}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSS Test Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Rss className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">RSS Kaynağı Testi</h2>
          </div>

          {/* Feed Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kayıtlı RSS Kaynağı
            </label>
            <select
              value={selectedFeed}
              onChange={(e) => {
                setSelectedFeed(e.target.value)
                setCustomRssUrl('')
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Kaynak seçin...</option>
              {feeds.map((feed) => (
                <option key={feed.id} value={feed.id}>
                  {feed.name} ({feed.category})
                </option>
              ))}
            </select>
          </div>

          {/* Custom URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              veya Özel RSS URL
            </label>
            <input
              type="url"
              value={customRssUrl}
              onChange={(e) => {
                setCustomRssUrl(e.target.value)
                setSelectedFeed('')
              }}
              placeholder="https://example.com/rss.xml"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Test Button */}
          <button
            onClick={testRssFeed}
            disabled={rssLoading || (!selectedFeed && !customRssUrl)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {rssLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            RSS Testi Başlat
          </button>

          {/* RSS Test Result */}
          {rssTestResult && (
            <div className={`p-4 rounded-lg ${rssTestResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                {rssTestResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${rssTestResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {rssTestResult.success ? 'RSS Başarılı' : 'RSS Başarısız'}
                </span>
              </div>
              {rssTestResult.success ? (
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <p><strong>Başlık:</strong> {rssTestResult.title}</p>
                  <p><strong>Öğe Sayısı:</strong> {rssTestResult.itemCount}</p>
                  {rssTestResult.sampleItems && rssTestResult.sampleItems.length > 0 && (
                    <div>
                      <p className="font-medium">Örnek Haberler:</p>
                      <ul className="list-disc list-inside mt-1">
                        {rssTestResult.sampleItems.slice(0, 3).map((item, i) => (
                          <li key={i} className="truncate">{item.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-700 dark:text-red-300">{rssTestResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Image Generation Test Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Görsel Üretim Testi</h2>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Haber Başlığı
            </label>
            <input
              type="text"
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              placeholder="Test için haber başlığı girin..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori
            </label>
            <select
              value={imageCategory}
              onChange={(e) => setImageCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Model
            </label>
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {imageModels.map((model) => (
                <option key={model.value} value={model.value}>{model.label}</option>
              ))}
            </select>
          </div>

          {/* Test Button */}
          <button
            onClick={testImageGeneration}
            disabled={imageLoading || !imageTitle}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {imageLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            Görsel Üret
          </button>

          {/* Image Test Result */}
          {imageTestResult && (
            <div className={`p-4 rounded-lg ${imageTestResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                {imageTestResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${imageTestResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {imageTestResult.success ? 'Görsel Üretildi' : 'Üretim Başarısız'}
                </span>
                {imageTestResult.duration && (
                  <span className="text-sm text-gray-500 ml-auto">
                    {(imageTestResult.duration / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
              {imageTestResult.success && imageTestResult.imageUrl ? (
                <div className="mt-2 relative aspect-video">
                  <Image 
                    src={imageTestResult.imageUrl} 
                    alt="Generated" 
                    fill
                    className="rounded-lg shadow object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <p className="text-sm text-red-700 dark:text-red-300">{imageTestResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Prompt Preview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Prompt Önizleme</h2>
          </div>

          {/* Prompt Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prompt Şablonu
            </label>
            <select
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Prompt seçin...</option>
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.displayName} ({prompt.type})
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Preview */}
          {promptPreview && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Önizleme:</p>
              <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                {promptPreview}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Verileri Yenile
        </button>
      </div>
    </div>
  )
}
