'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Loader2, Sparkles } from 'lucide-react'

interface SentimentBadgeProps {
  sentiment: string | null
  score: number | null
  articleId?: string
  showAnalyzeButton?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function SentimentBadge({
  sentiment,
  score,
  articleId,
  showAnalyzeButton = false,
  size = 'md',
}: SentimentBadgeProps) {
  const [currentSentiment, setCurrentSentiment] = useState(sentiment)
  const [currentScore, setCurrentScore] = useState(score)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!articleId || isAnalyzing) return

    setIsAnalyzing(true)
    try {
      const response = await fetch(`/api/articles/${articleId}/sentiment`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSentiment(data.sentiment)
        setCurrentScore(data.score)
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentConfig = (sentimentValue: string | null) => {
    switch (sentimentValue) {
      case 'POSITIVE':
        return {
          icon: TrendingUp,
          label: 'Olumlu',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-700 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
        }
      case 'NEGATIVE':
        return {
          icon: TrendingDown,
          label: 'Olumsuz',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-700 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
        }
      case 'NEUTRAL':
        return {
          icon: Minus,
          label: 'Nötr',
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          textColor: 'text-gray-700 dark:text-gray-300',
          borderColor: 'border-gray-200 dark:border-gray-600',
          iconColor: 'text-gray-600 dark:text-gray-400',
        }
      default:
        return null
    }
  }

  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      container: 'px-2.5 py-1 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      container: 'px-3 py-1.5 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  }

  const config = getSentimentConfig(currentSentiment)
  const sizeClass = sizeClasses[size]

  // Show analyze button if no sentiment and button is enabled
  if (!currentSentiment && showAnalyzeButton && articleId) {
    return (
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className={`inline-flex items-center ${sizeClass.gap} ${sizeClass.container} rounded-full font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isAnalyzing ? (
          <Loader2 className={`${sizeClass.icon} animate-spin`} />
        ) : (
          <Sparkles className={sizeClass.icon} />
        )}
        <span>{isAnalyzing ? 'Analiz ediliyor...' : 'Duygu Analizi'}</span>
      </button>
    )
  }

  // Don't render if no sentiment
  if (!config) return null

  const Icon = config.icon

  return (
    <div
      className={`inline-flex items-center ${sizeClass.gap} ${sizeClass.container} rounded-full font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
      title={currentScore ? `Güven: ${Math.round(currentScore * 100)}%` : undefined}
    >
      <Icon className={`${sizeClass.icon} ${config.iconColor}`} />
      <span>{config.label}</span>
      {currentScore && size !== 'sm' && (
        <span className="opacity-60">({Math.round(currentScore * 100)}%)</span>
      )}
    </div>
  )
}
