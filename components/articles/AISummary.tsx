'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AISummaryProps {
  articleId: string
  className?: string
}

interface SummaryData {
  summary: string
  keyPoints: string[]
  readingTime?: string
  source: 'ai' | 'excerpt'
}

export default function AISummary({ articleId, className }: AISummaryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null)

  const fetchSummary = async () => {
    if (summaryData) {
      setIsOpen(!isOpen)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/articles/${articleId}/summary`)
      
      if (!response.ok) {
        throw new Error('Özet yüklenemedi')
      }

      const data = await response.json()
      setSummaryData(data)
      setIsOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 overflow-hidden', className)}>
      {/* Header Button */}
      <button
        onClick={fetchSummary}
        disabled={isLoading}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple-100/50 dark:hover:bg-purple-800/30 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            AI ile Özetle
          </span>
          {summaryData?.source === 'ai' && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full">
              Gemini
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
          ) : isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Content */}
      {isOpen && summaryData && (
        <div className="px-4 pb-4 space-y-4 border-t border-purple-200 dark:border-purple-800">
          {/* Summary */}
          <div className="pt-4">
            {/* Summary Text (HTML Rendered) */}
            <div 
              className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 mb-6"
              dangerouslySetInnerHTML={{ __html: summaryData.summary }}
            />
          </div>

          {/* Key Points */}
          {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-1">
                <span>Öne Çıkan Noktalar</span>
              </h4>
              <ul className="space-y-2">
                {summaryData.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reading Time */}
          {summaryData.readingTime && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-purple-100 dark:border-purple-800">
              Tahmini okuma süresi: {summaryData.readingTime}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="px-4 pb-4 border-t border-purple-200 dark:border-purple-800">
          <div className="pt-4 flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
