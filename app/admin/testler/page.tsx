'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { 
  TestTube,
  Play, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Image as ImageIcon,
  FileText,
  Clock,
  Loader2,
  Rss,
  Brain,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  Trash2,
  BarChart3
} from 'lucide-react'
import { CATEGORY_NAMES_LIST } from '@/lib/constants'

/**
 * Kapsamlı İçerik Üretimi Test Sayfası
 * 
 * Tüm içerik üretimi adımlarını test etme ve sonuçları görüntüleme
 * 
 * @version 1.0.0
 * @lastUpdated 20 January 2026
 */

// ============================================
// Types
// ============================================

interface TestResult {
  id: string
  type: 'content' | 'image' | 'rss' | 'sentiment' | 'category' | 'pipeline'
  status: 'pending' | 'running' | 'success' | 'error'
  startTime: Date
  endTime?: Date
  duration?: number
  input: {
    title?: string
    content?: string
    category?: string
    url?: string
    model?: string
  }
  output?: {
    title?: string
    content?: string
    excerpt?: string
    category?: string
    sentiment?: string
    sentimentScore?: number
    imageUrl?: string
    itemCount?: number
    sampleItems?: Array<{ title: string; imageUrl?: string }>
    provider?: string
    model?: string
    articlesPublished?: number
    imagesGenerated?: number
    errors?: string[]
  }
  error?: string
}

interface RssFeed {
  id: string
  name: string
  url: string
  category: string
  isActive: boolean
}

interface PromptTemplate {
  id: string
  name: string
  displayName: string
  type: string
  template: string
  variables: string
}

interface SystemStats {
  geminiConfigured: boolean
  imagenConfigured: boolean
  activeFeeds: number
  totalArticles: number
  successRate: number
  avgDuration: number
}

// ============================================
// Model Configurations
// ============================================

const TEXT_MODELS = [
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'En akıllı' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', description: 'Hız ve zeka' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Önerilen', recommended: true },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'Ultra hızlı' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Stabil' },
]

const IMAGE_MODELS = [
  { id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4.0 Fast', description: 'Hızlı (~5s)', recommended: true },
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0 Standard', description: 'Yüksek kalite (~8s)' },
  { id: 'imagen-4.0-ultra-generate-001', name: 'Imagen 4.0 Ultra', description: '2K çözünürlük (~10s)' },
  { id: 'gemini-2.0-flash-exp-image-generation', name: 'Nano Banana', description: 'Gemini tabanlı (~8s)' },
]

// ============================================
// Helper Components
// ============================================

function StatusBadge({ status }: { status: TestResult['status'] }) {
  const config = {
    pending: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', icon: Clock },
    running: { color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', icon: Loader2 },
    success: { color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
    error: { color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  }
  const { color, icon: Icon } = config[status]
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon className={`w-3 h-3 ${status === 'running' ? 'animate-spin' : ''}`} />
      {status === 'pending' ? 'Bekliyor' : status === 'running' ? 'Çalışıyor' : status === 'success' ? 'Başarılı' : 'Hata'}
    </span>
  )
}

function TypeBadge({ type }: { type: TestResult['type'] }) {
  const config = {
    content: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: FileText, label: 'İçerik' },
    image: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: ImageIcon, label: 'Görsel' },
    rss: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', icon: Rss, label: 'RSS' },
    sentiment: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: Sparkles, label: 'Duygu' },
    category: { color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300', icon: BarChart3, label: 'Kategori' },
    pipeline: { color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', icon: Zap, label: 'Pipeline' },
  }
  const { color, icon: Icon, label } = config[type]
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// ============================================
// Main Component
// ============================================

export default function TestsPage() {
  // Test results
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)
  
  // Data
  const [feeds, setFeeds] = useState<RssFeed[]>([])
  const [, setPrompts] = useState<PromptTemplate[]>([])
  const [stats, setStats] = useState<SystemStats | null>(null)
  
  // Form states
  const [testType, setTestType] = useState<'content' | 'image' | 'rss' | 'sentiment' | 'category' | 'pipeline'>('content')
  const [testTitle, setTestTitle] = useState('Yapay zeka teknolojisinde çığır açan yeni gelişmeler')
  const [testContent, setTestContent] = useState('Teknoloji dünyasında yapay zeka alanında önemli gelişmeler yaşanıyor. Yeni nesil AI modelleri, daha önce hayal bile edilemeyecek görevleri başarıyla yerine getiriyor.')
  const [testCategory, setTestCategory] = useState('Teknoloji')
  const [testModel, setTestModel] = useState('gemini-2.5-flash')
  const [testImageModel, setTestImageModel] = useState('imagen-4.0-fast-generate-001')
  const [testRssUrl, setTestRssUrl] = useState('')
  const [selectedFeed, setSelectedFeed] = useState('')
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // ============================================
  // Data Fetching
  // ============================================

  const fetchData = useCallback(async () => {
    try {
      const [feedsRes, promptsRes, statusRes] = await Promise.all([
        fetch('/api/admin/rss'),
        fetch('/api/admin/prompts'),
        fetch('/api/admin/content-engine'),
      ])

      if (feedsRes.ok) {
        const data = await feedsRes.json()
        setFeeds(data)
      }

      if (promptsRes.ok) {
        const data = await promptsRes.json()
        setPrompts(data)
      }

      if (statusRes.ok) {
        const data = await statusRes.json()
        setStats({
          geminiConfigured: data.diagnostics?.geminiApiKey || false,
          imagenConfigured: data.diagnostics?.imagenConfigured || false,
          activeFeeds: data.activeFeeds || 0,
          totalArticles: data.totalArticles || 0,
          successRate: 100,
          avgDuration: 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ============================================
  // Test Functions
  // ============================================

  const generateTestId = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const runContentTest = async () => {
    const testId = generateTestId()
    const newTest: TestResult = {
      id: testId,
      type: 'content',
      status: 'running',
      startTime: new Date(),
      input: {
        title: testTitle,
        content: testContent,
        category: testCategory,
        model: testModel,
      },
    }
    
    setTestResults(prev => [newTest, ...prev])
    setRunning(true)

    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      })
      
      const data = await response.json()
      const endTime = new Date()
      
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: data.success ? 'success' : 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        output: {
          title: data.testArticle?.title,
          content: data.testArticle?.excerpt,
          category: data.testArticle?.category,
          model: testModel,
        },
        error: data.errors?.[0],
      } : t))
    } catch (error) {
      const endTime = new Date()
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        error: error instanceof Error ? error.message : 'Test başarısız',
      } : t))
    } finally {
      setRunning(false)
    }
  }

  const runImageTest = async () => {
    const testId = generateTestId()
    const newTest: TestResult = {
      id: testId,
      type: 'image',
      status: 'running',
      startTime: new Date(),
      input: {
        title: testTitle,
        category: testCategory,
        model: testImageModel,
      },
    }
    
    setTestResults(prev => [newTest, ...prev])
    setRunning(true)

    try {
      const response = await fetch('/api/admin/imagen-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: testTitle,
          category: testCategory,
          model: testImageModel,
        }),
      })
      
      const data = await response.json()
      const endTime = new Date()
      
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: data.success ? 'success' : 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        output: {
          imageUrl: data.imageUrl,
          provider: data.provider,
          model: data.model,
        },
        error: data.error,
      } : t))
    } catch (error) {
      const endTime = new Date()
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        error: error instanceof Error ? error.message : 'Test başarısız',
      } : t))
    } finally {
      setRunning(false)
    }
  }

  const runRssTest = async () => {
    const url = testRssUrl || feeds.find(f => f.id === selectedFeed)?.url
    if (!url) return

    const testId = generateTestId()
    const newTest: TestResult = {
      id: testId,
      type: 'rss',
      status: 'running',
      startTime: new Date(),
      input: { url },
    }
    
    setTestResults(prev => [newTest, ...prev])
    setRunning(true)

    try {
      const response = await fetch('/api/admin/test-rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      
      const data = await response.json()
      const endTime = new Date()
      
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: data.success ? 'success' : 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        output: {
          title: data.title,
          itemCount: data.itemCount,
          sampleItems: data.sampleItems,
        },
        error: data.error,
      } : t))
    } catch (error) {
      const endTime = new Date()
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        error: error instanceof Error ? error.message : 'Test başarısız',
      } : t))
    } finally {
      setRunning(false)
    }
  }

  const runSentimentTest = async () => {
    const testId = generateTestId()
    const newTest: TestResult = {
      id: testId,
      type: 'sentiment',
      status: 'running',
      startTime: new Date(),
      input: {
        title: testTitle,
        content: testContent,
        model: testModel,
      },
    }
    
    setTestResults(prev => [newTest, ...prev])
    setRunning(true)

    try {
      const response = await fetch('/api/admin/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: testTitle,
          content: testContent,
        }),
      })
      
      const data = await response.json()
      const endTime = new Date()
      
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: data.sentiment ? 'success' : 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        output: {
          sentiment: data.sentiment,
          sentimentScore: data.score,
          content: data.summary,
        },
        error: data.error,
      } : t))
    } catch (error) {
      const endTime = new Date()
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        error: error instanceof Error ? error.message : 'Test başarısız',
      } : t))
    } finally {
      setRunning(false)
    }
  }

  const runPipelineTest = async () => {
    const testId = generateTestId()
    const newTest: TestResult = {
      id: testId,
      type: 'pipeline',
      status: 'running',
      startTime: new Date(),
      input: {
        model: testModel,
      },
    }
    
    setTestResults(prev => [newTest, ...prev])
    setRunning(true)

    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'test',
          mode: 'test',
        }),
      })
      
      const data = await response.json()
      const endTime = new Date()
      
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: data.success ? 'success' : 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        output: {
          title: data.testArticle?.title,
          content: data.testArticle?.excerpt,
          category: data.testArticle?.category,
          imageUrl: data.testArticle?.imageUrl,
          articlesPublished: data.articlesPublished,
          imagesGenerated: data.imagesGenerated,
          errors: data.errors,
        },
        error: data.errors?.[0],
      } : t))
    } catch (error) {
      const endTime = new Date()
      setTestResults(prev => prev.map(t => t.id === testId ? {
        ...t,
        status: 'error',
        endTime,
        duration: endTime.getTime() - t.startTime.getTime(),
        error: error instanceof Error ? error.message : 'Test başarısız',
      } : t))
    } finally {
      setRunning(false)
    }
  }

  const runTest = () => {
    switch (testType) {
      case 'content':
        runContentTest()
        break
      case 'image':
        runImageTest()
        break
      case 'rss':
        runRssTest()
        break
      case 'sentiment':
        runSentimentTest()
        break
      case 'pipeline':
        runPipelineTest()
        break
    }
  }

  const clearResults = () => {
    setTestResults([])
    setSelectedResult(null)
  }

  const deleteResult = (id: string) => {
    setTestResults(prev => prev.filter(t => t.id !== id))
    if (selectedResult?.id === id) {
      setSelectedResult(null)
    }
  }

  // ============================================
  // Render
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <TestTube className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">İçerik Üretimi Testleri</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tüm içerik üretimi adımlarını test edin ve sonuçları görüntüleyin
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* System Status */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.geminiConfigured ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <Brain className={`w-5 h-5 ${stats.geminiConfigured ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gemini API</p>
                <p className={`font-semibold ${stats.geminiConfigured ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.geminiConfigured ? 'Bağlı' : 'Bağlı Değil'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.imagenConfigured ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                <ImageIcon className={`w-5 h-5 ${stats.imagenConfigured ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Görsel Üretimi</p>
                <p className={`font-semibold ${stats.imagenConfigured ? 'text-green-600' : 'text-yellow-600'}`}>
                  {stats.imagenConfigured ? 'Aktif' : 'Yapılandır'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Rss className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Aktif RSS</p>
                <p className="font-semibold text-gray-900 dark:text-white">{stats.activeFeeds}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Makale</p>
                <p className="font-semibold text-gray-900 dark:text-white">{stats.totalArticles}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Yapılandırması</h2>
          
          {/* Test Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Türü
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'content', label: 'İçerik', icon: FileText },
                { id: 'image', label: 'Görsel', icon: ImageIcon },
                { id: 'rss', label: 'RSS', icon: Rss },
                { id: 'sentiment', label: 'Duygu', icon: Sparkles },
                { id: 'pipeline', label: 'Pipeline', icon: Zap },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setTestType(type.id as typeof testType)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    testType === type.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          {(testType === 'content' || testType === 'image' || testType === 'sentiment') && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test Başlığı
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(testType === 'content' || testType === 'sentiment') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Test İçeriği
                  </label>
                  <textarea
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori
                </label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORY_NAMES_LIST.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* RSS Fields */}
          {testType === 'rss' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kayıtlı RSS Kaynağı
                </label>
                <select
                  value={selectedFeed}
                  onChange={(e) => { setSelectedFeed(e.target.value); setTestRssUrl(''); }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçin...</option>
                  {feeds.map((feed) => (
                    <option key={feed.id} value={feed.id}>{feed.name} ({feed.category})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  veya Özel RSS URL
                </label>
                <input
                  type="url"
                  value={testRssUrl}
                  onChange={(e) => { setTestRssUrl(e.target.value); setSelectedFeed(''); }}
                  placeholder="https://example.com/rss.xml"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Advanced Options */}
          <div className="mb-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Gelişmiş Seçenekler
            </button>
            
            {showAdvanced && (
              <div className="mt-3 space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                {(testType === 'content' || testType === 'sentiment' || testType === 'pipeline') && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Metin Modeli
                    </label>
                    <select
                      value={testModel}
                      onChange={(e) => setTestModel(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {TEXT_MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description} {model.recommended ? '⭐' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {(testType === 'image' || testType === 'pipeline') && (
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Görsel Modeli
                    </label>
                    <select
                      value={testImageModel}
                      onChange={(e) => setTestImageModel(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {IMAGE_MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description} {model.recommended ? '⭐' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Run Button */}
          <button
            onClick={runTest}
            disabled={running || (testType === 'rss' && !selectedFeed && !testRssUrl)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
            {running ? 'Test Çalışıyor...' : 'Testi Başlat'}
          </button>
        </div>

        {/* Test Results List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Test Sonuçları</h2>
            {testResults.length > 0 && (
              <button
                onClick={clearResults}
                className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 className="w-3 h-3" />
                Temizle
              </button>
            )}
          </div>

          {testResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <TestTube className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Henüz test yapılmadı</p>
              <p className="text-sm mt-1">Yukarıdan bir test türü seçin ve başlatın</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => setSelectedResult(result)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedResult?.id === result.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TypeBadge type={result.type} />
                      <StatusBadge status={result.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      {result.duration && (
                        <span className="text-xs text-gray-500">{(result.duration / 1000).toFixed(1)}s</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteResult(result.id); }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {result.input.title || result.input.url || 'Pipeline Test'}
                  </p>
                  
                  {result.status === 'success' && result.output?.imageUrl && (
                    <div className="mt-2 relative aspect-video w-full max-w-[200px]">
                      <Image
                        src={result.output.imageUrl}
                        alt="Generated"
                        fill
                        className="rounded object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  
                  {result.status === 'error' && result.error && (
                    <p className="text-xs text-red-600 mt-1 truncate">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Result Detail */}
      {selectedResult && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Test Detayı</h2>
              <TypeBadge type={selectedResult.type} />
              <StatusBadge status={selectedResult.status} />
            </div>
            <button
              onClick={() => setSelectedResult(null)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Girdi</h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                {selectedResult.input.title && (
                  <div>
                    <p className="text-xs text-gray-500">Başlık</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedResult.input.title}</p>
                  </div>
                )}
                {selectedResult.input.content && (
                  <div>
                    <p className="text-xs text-gray-500">İçerik</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedResult.input.content}</p>
                  </div>
                )}
                {selectedResult.input.category && (
                  <div>
                    <p className="text-xs text-gray-500">Kategori</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedResult.input.category}</p>
                  </div>
                )}
                {selectedResult.input.url && (
                  <div>
                    <p className="text-xs text-gray-500">URL</p>
                    <p className="text-sm text-gray-900 dark:text-white break-all">{selectedResult.input.url}</p>
                  </div>
                )}
                {selectedResult.input.model && (
                  <div>
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedResult.input.model}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Output */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Çıktı</h3>
              {selectedResult.status === 'success' && selectedResult.output ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-3">
                  {selectedResult.output.title && (
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400">Üretilen Başlık</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedResult.output.title}</p>
                    </div>
                  )}
                  {selectedResult.output.content && (
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {selectedResult.type === 'sentiment' ? 'Açıklama' : 'Özet'}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedResult.output.content}</p>
                    </div>
                  )}
                  {selectedResult.output.category && (
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400">Kategori</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedResult.output.category}</p>
                    </div>
                  )}
                  {selectedResult.output.sentiment && (
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400">Duygu Analizi</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedResult.output.sentiment} ({((selectedResult.output.sentimentScore || 0) * 100).toFixed(0)}%)
                      </p>
                    </div>
                  )}
                  {selectedResult.output.itemCount !== undefined && (
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400">Öğe Sayısı</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedResult.output.itemCount}</p>
                    </div>
                  )}
                  {selectedResult.output.provider && (
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400">Sağlayıcı / Model</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedResult.output.provider} / {selectedResult.output.model}
                      </p>
                    </div>
                  )}
                  {selectedResult.output.imageUrl && (
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 mb-2">Üretilen Görsel</p>
                      <div className="relative aspect-video max-w-md">
                        <Image
                          src={selectedResult.output.imageUrl}
                          alt="Generated"
                          fill
                          className="rounded-lg object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                  {selectedResult.output.sampleItems && selectedResult.output.sampleItems.length > 0 && (
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 mb-2">Örnek Öğeler</p>
                      <ul className="space-y-1">
                        {selectedResult.output.sampleItems.slice(0, 5).map((item, i) => (
                          <li key={i} className="text-sm text-gray-900 dark:text-white">• {item.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : selectedResult.status === 'error' ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">Hata</p>
                  <p className="text-sm text-red-800 dark:text-red-200">{selectedResult.error}</p>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500">Test çalışıyor...</p>
                </div>
              )}
            </div>
          </div>

          {/* Timing */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>Başlangıç: {selectedResult.startTime.toLocaleTimeString('tr-TR')}</span>
              {selectedResult.endTime && (
                <span>Bitiş: {selectedResult.endTime.toLocaleTimeString('tr-TR')}</span>
              )}
              {selectedResult.duration && (
                <span className="font-medium text-gray-900 dark:text-white">
                  Süre: {(selectedResult.duration / 1000).toFixed(2)}s
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
