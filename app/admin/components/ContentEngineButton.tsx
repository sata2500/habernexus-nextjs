'use client'

import { useState } from 'react'
import { Play, Loader2, Zap, Brain, ChevronDown } from 'lucide-react'

type EngineMode = 'quick' | 'standard'

interface EngineResult {
  success: boolean
  mode: string
  articlesCreated?: number
  articlesPublished?: number
  imagesGenerated?: number
  imagesOptimized?: number
  errors: string[]
}

export default function ContentEngineButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EngineResult | null>(null)
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [selectedMode, setSelectedMode] = useState<EngineMode>('standard')

  const handleRunEngine = async (mode: EngineMode) => {
    setIsLoading(true)
    setResult(null)
    setShowModeMenu(false)
    setSelectedMode(mode)

    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })

      const data = await response.json()
      setResult(data)

      const articlesCreated = data.articlesPublished || data.articlesCreated || 0
      if (data.success && articlesCreated > 0) {
        // Refresh the page to show new articles
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch {
      setResult({
        success: false,
        mode,
        articlesCreated: 0,
        errors: ['İstek başarısız oldu. Lütfen tekrar deneyin.'],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getModeLabel = (mode: EngineMode) => {
    switch (mode) {
      case 'quick':
        return 'Hızlı Mod'
      case 'standard':
        return 'Standart Mod'
      default:
        return 'AI Çalıştır'
    }
  }

  const getModeDescription = (mode: EngineMode) => {
    switch (mode) {
      case 'quick':
        return 'Hızlı içerik üretimi (araştırma yok)'
      case 'standard':
        return 'Tam pipeline: araştırma + sentez'
      default:
        return ''
    }
  }

  const getModeIcon = (mode: EngineMode) => {
    switch (mode) {
      case 'quick':
        return <Zap className="w-4 h-4" />
      case 'standard':
        return <Brain className="w-4 h-4" />
      default:
        return <Play className="w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      <div className="flex">
        {/* Main Button */}
        <button
          onClick={() => handleRunEngine(selectedMode)}
          disabled={isLoading}
          className="flex flex-col items-center justify-center flex-1 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-l-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2 animate-spin" />
          ) : (
            <Play className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
          )}
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {isLoading ? 'Çalışıyor...' : 'AI Çalıştır'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {getModeLabel(selectedMode)}
          </span>
        </button>

        {/* Mode Dropdown Button */}
        <button
          onClick={() => setShowModeMenu(!showModeMenu)}
          disabled={isLoading}
          className="flex items-center justify-center px-2 bg-orange-100 dark:bg-orange-900/50 rounded-r-lg hover:bg-orange-200 dark:hover:bg-orange-900/70 transition-colors disabled:opacity-50 border-l border-orange-200 dark:border-orange-800"
        >
          <ChevronDown className={`w-4 h-4 text-orange-600 dark:text-orange-400 transition-transform ${showModeMenu ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Mode Dropdown Menu */}
      {showModeMenu && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
          {(['standard', 'quick'] as EngineMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleRunEngine(mode)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${
                selectedMode === mode ? 'bg-orange-50 dark:bg-orange-900/20' : ''
              }`}
            >
              <div className={`p-1.5 rounded ${
                mode === 'standard' 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
              }`}>
                {getModeIcon(mode)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {getModeLabel(mode)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getModeDescription(mode)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

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
                {result.articlesPublished || result.articlesCreated || 0} makale oluşturuldu!
              </p>
              {(result.imagesGenerated || 0) > 0 && (
                <p className="text-xs mt-1">
                  {result.imagesGenerated} AI görsel, {result.imagesOptimized || 0} RSS görsel
                </p>
              )}
            </div>
          ) : (
            <p>{result.errors[0] || 'Bir hata oluştu'}</p>
          )}
        </div>
      )}
    </div>
  )
}
