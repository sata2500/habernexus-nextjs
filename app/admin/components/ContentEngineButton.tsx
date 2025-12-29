'use client'

import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'

export default function ContentEngineButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    articlesCreated: number
    errors: string[]
  } | null>(null)

  const handleRunEngine = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'POST',
      })

      const data = await response.json()
      setResult(data)

      if (data.success && data.articlesCreated > 0) {
        // Refresh the page to show new articles
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch {
      setResult({
        success: false,
        articlesCreated: 0,
        errors: ['İstek başarısız oldu. Lütfen tekrar deneyin.'],
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
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
      </button>

      {/* Result Toast */}
      {result && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-lg text-sm ${
            result.success
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {result.success ? (
            <p>{result.articlesCreated} makale oluşturuldu!</p>
          ) : (
            <p>{result.errors[0] || 'Bir hata oluştu'}</p>
          )}
        </div>
      )}
    </div>
  )
}
