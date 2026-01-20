'use client'

import { useState } from 'react'
import { Play, Loader2, Brain } from 'lucide-react'

interface EngineResult {
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
  // Backward compatibility
  articlesCreated?: number
  articlesPublished?: number
  imagesGenerated?: number
  errors: string[]
}

/**
 * ContentEngineButton - Dashboard'da AI içerik üretimini başlatan buton
 * 
 * v3.0 güncellemesi: Mod seçimi kaldırıldı, tek kaliteli sistem kullanılıyor.
 * Artık sadece 'full' modu ile tam pipeline çalıştırılıyor.
 */
export default function ContentEngineButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EngineResult | null>(null)

  const handleRunEngine = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'full' }),
      })

      const data = await response.json()
      setResult(data)

      // Get article count from either new or old format
      const articlesCreated = data.stats?.articlesCreated || data.articlesPublished || data.articlesCreated || 0
      
      if (data.success && articlesCreated > 0) {
        // Refresh the page to show new articles
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch {
      setResult({
        success: false,
        mode: 'full',
        errors: ['İstek başarısız oldu. Lütfen tekrar deneyin.'],
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get article count from result
  const getArticleCount = () => {
    if (!result) return 0
    return result.stats?.articlesCreated || result.articlesPublished || result.articlesCreated || 0
  }

  // Get image count from result
  const getImageCount = () => {
    if (!result) return 0
    return result.stats?.imagesGenerated || result.imagesGenerated || 0
  }

  return (
    <div className="relative">
      {/* Main Button - Simplified without mode dropdown */}
      <button
        onClick={handleRunEngine}
        disabled={isLoading}
        className="flex flex-col items-center justify-center w-full p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2 animate-spin" />
        ) : (
          <Play className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
        )}
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {isLoading ? 'Çalışıyor...' : 'AI Çalıştır'}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
          <Brain className="w-3 h-3" />
          İçerik Motoru v3.0
        </span>
      </button>

      {/* Result Toast */}
      {result && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-lg text-sm z-20 ${
            result.success
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {result.success ? (
            <div>
              <p className="font-medium">
                {getArticleCount()} makale oluşturuldu!
              </p>
              {getImageCount() > 0 && (
                <p className="text-xs mt-1">
                  {getImageCount()} görsel üretildi
                </p>
              )}
            </div>
          ) : (
            <p>{result.errors?.[0] || 'Bir hata oluştu'}</p>
          )}
        </div>
      )}
    </div>
  )
}
