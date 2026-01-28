/**
 * Model Information Card Component
 * Displays detailed information about selected AI models
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

import React from 'react'
import {
  Zap,
  Brain,
  Image as ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

export interface ModelInfo {
  id: string
  name: string
  tier: 'premium' | 'standard' | 'lite'
  contextWindow: number
  capabilities: string[]
  avgLatency: number
  costPerMillion: number
  isRecommended: boolean
  isExperimental: boolean
  thinkingSupport?: boolean
  maxResolution?: string
}

interface ModelInfoCardProps {
  model: ModelInfo
  type: 'content' | 'image' | 'summary'
  isSelected?: boolean
}

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'premium':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'standard':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'lite':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getTierLabel = (tier: string) => {
  switch (tier) {
    case 'premium':
      return 'Premium'
    case 'standard':
      return 'Standard'
    case 'lite':
      return 'Lite (Hızlı)'
    default:
      return tier
  }
}

const getCapabilityIcon = (capability: string) => {
  switch (capability.toLowerCase()) {
    case 'thinking':
      return <Brain className="w-4 h-4" />
    case 'text-to-image':
    case 'image-generation':
      return <ImageIcon className="w-4 h-4" />
    case 'fast':
    case 'low-latency':
      return <Zap className="w-4 h-4" />
    case 'high-quality':
    case '4k':
      return <Sparkles className="w-4 h-4" />
    default:
      return <Check className="w-4 h-4" />
  }
}

export function ModelInfoCard({
  model,
  type,
  isSelected = false,
}: ModelInfoCardProps) {
  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
            {model.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(
                model.tier
              )}`}
            >
              {getTierLabel(model.tier)}
            </span>
            {model.isRecommended && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                ⭐ Önerilen
              </span>
            )}
            {model.isExperimental && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                🧪 Beta
              </span>
            )}
          </div>
        </div>
        {isSelected && (
          <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
        )}
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        {/* Context Window */}
        <div className="text-xs">
          <p className="text-gray-600 dark:text-gray-400">Context</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {(model.contextWindow / 1000).toFixed(0)}K
          </p>
        </div>

        {/* Latency */}
        <div className="text-xs">
          <p className="text-gray-600 dark:text-gray-400">Latency</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            ~{model.avgLatency}ms
          </p>
        </div>

        {/* Cost */}
        <div className="text-xs">
          <p className="text-gray-600 dark:text-gray-400">Cost/1M</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            ${model.costPerMillion.toFixed(2)}
          </p>
        </div>

        {/* Resolution (for image models) */}
        {model.maxResolution && (
          <div className="text-xs">
            <p className="text-gray-600 dark:text-gray-400">Resolution</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {model.maxResolution}
            </p>
          </div>
        )}
      </div>

      {/* Capabilities */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Capabilities:</p>
        <div className="flex flex-wrap gap-1">
          {model.capabilities.map((cap) => (
            <span
              key={cap}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {getCapabilityIcon(cap)}
              {cap}
            </span>
          ))}
          {model.thinkingSupport && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
              <Brain className="w-3 h-3" />
              Thinking
            </span>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {type === 'content' && model.tier === 'premium' && (
        <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            {model.name.includes('Gemini 3')
              ? 'Gemini 3 için temperature 1.0 olmalı'
              : 'Optimize edilmiş performans için önerilen'}
          </p>
        </div>
      )}

      {type === 'summary' && model.tier === 'lite' && (
        <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300">
          <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Hızlı özet oluşturma için en uygun seçenek</p>
        </div>
      )}
    </div>
  )
}

/**
 * Model Comparison Component
 * Shows side-by-side comparison of models
 */
export function ModelComparison({
  models,
}: {
  models: ModelInfo[]
}) {
  if (models.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Karşılaştırmak için en az bir model seçin
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        Model Karşılaştırması
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                Model
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                Tier
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                Context
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                Latency
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 dark:text-gray-300">
                Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr
                key={model.id}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">
                  {model.name}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getTierColor(
                      model.tier
                    )}`}
                  >
                    {getTierLabel(model.tier)}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                  {(model.contextWindow / 1000).toFixed(0)}K
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                  ~{model.avgLatency}ms
                </td>
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                  ${model.costPerMillion.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Model Recommendation Component
 * Shows AI-recommended models based on use case
 */
export function ModelRecommendation({
  type,
  availableModels,
}: {
  type: 'content' | 'image' | 'summary'
  availableModels: ModelInfo[]
}) {
  const recommended = availableModels.filter((m) => m.isRecommended)

  if (recommended.length === 0) {
    return null
  }

  const recommendation = recommended[0]

  return (
    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
      <div className="flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
            Önerilen Model
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
            {type === 'content'
              ? 'İçerik kalitesi ve hız dengesi için en iyi seçim'
              : type === 'image'
                ? 'Görsel kalitesi ve detay seviyesi için optimize edilmiş'
                : 'Hızlı ve doğru özet oluşturma için ideal'}
          </p>
          <p className="font-medium text-amber-900 dark:text-amber-100">
            {recommendation.name}
          </p>
        </div>
      </div>
    </div>
  )
}
