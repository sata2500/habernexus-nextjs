'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Loader2,
  RefreshCw,
  BarChart3,
  AlertCircle
} from 'lucide-react'

interface SentimentStats {
  totalArticles: number
  analyzedArticles: number
  pendingArticles: number
  sentimentStats: {
    POSITIVE: number
    NEGATIVE: number
    NEUTRAL: number
  }
  isConfigured: boolean
}

export default function SentimentAnalysisPage() {
  const [stats, setStats] = useState<SentimentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/sentiment')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleBatchAnalysis = async (limit: number) => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
    
    try {
      const response = await fetch('/api/admin/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setAnalysisResult(data.message)
        fetchStats() // Refresh stats
      } else {
        setAnalysisResult(`Hata: ${data.error}`)
      }
    } catch (error) {
      console.error('Error running analysis:', error)
      setAnalysisResult('Analiz sırasında bir hata oluştu')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          İstatistikler yüklenemedi
        </p>
      </div>
    )
  }

  const totalSentiment = stats.sentimentStats.POSITIVE + stats.sentimentStats.NEGATIVE + stats.sentimentStats.NEUTRAL
  const getPercentage = (value: number) => totalSentiment > 0 ? Math.round((value / totalSentiment) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Duygu Analizi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI destekli haber duygu analizi yönetimi
          </p>
        </div>
        <button
          onClick={() => fetchStats()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* API Status */}
      {!stats.isConfigured && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Gemini API Yapılandırılmamış
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Duygu analizi için GEMINI_API_KEY ortam değişkenini ayarlayın.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalArticles.toLocaleString('tr-TR')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Makale</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.analyzedArticles.toLocaleString('tr-TR')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Analiz Edilmiş</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.pendingArticles.toLocaleString('tr-TR')}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Bekleyen</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalArticles > 0 
              ? `${Math.round((stats.analyzedArticles / stats.totalArticles) * 100)}%`
              : '0%'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Tamamlanma Oranı</p>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Duygu Dağılımı
          </h2>
          
          {totalSentiment > 0 ? (
            <div className="space-y-4">
              {/* Positive */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Olumlu
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.sentimentStats.POSITIVE} ({getPercentage(stats.sentimentStats.POSITIVE)}%)
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(stats.sentimentStats.POSITIVE)}%` }}
                  />
                </div>
              </div>

              {/* Neutral */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nötr
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.sentimentStats.NEUTRAL} ({getPercentage(stats.sentimentStats.NEUTRAL)}%)
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(stats.sentimentStats.NEUTRAL)}%` }}
                  />
                </div>
              </div>

              {/* Negative */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Olumsuz
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.sentimentStats.NEGATIVE} ({getPercentage(stats.sentimentStats.NEGATIVE)}%)
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(stats.sentimentStats.NEGATIVE)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz analiz edilmiş makale yok
            </div>
          )}
        </div>

        {/* Batch Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Toplu Analiz
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Henüz analiz edilmemiş makaleleri toplu olarak analiz edin.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleBatchAnalysis(10)}
              disabled={isAnalyzing || !stats.isConfigured || stats.pendingArticles === 0}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>10 Makale Analiz Et</span>
            </button>

            <button
              onClick={() => handleBatchAnalysis(25)}
              disabled={isAnalyzing || !stats.isConfigured || stats.pendingArticles === 0}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>25 Makale Analiz Et</span>
            </button>

            <button
              onClick={() => handleBatchAnalysis(50)}
              disabled={isAnalyzing || !stats.isConfigured || stats.pendingArticles === 0}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>50 Makale Analiz Et (Maksimum)</span>
            </button>
          </div>

          {analysisResult && (
            <div className={`mt-4 p-3 rounded-lg ${
              analysisResult.startsWith('Hata') 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            }`}>
              {analysisResult}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
