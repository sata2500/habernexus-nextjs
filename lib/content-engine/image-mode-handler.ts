/**
 * Image Mode Handler System
 * Manages RSS, AI Original, AI Similar, and Auto image modes
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

import type { ImageMode, ScoredTopic } from './types'

/**
 * Image mode configuration
 */
export interface ImageModeConfig {
  mode: ImageMode
  description: string
  useCase: string[]
  priority: number
  fallbackMode: ImageMode
}

/**
 * Image mode configurations
 */
export const IMAGE_MODE_CONFIGS: Record<ImageMode, ImageModeConfig> = {
  rss: {
    mode: 'rss',
    description: 'RSS kaynağından orijinal görseli kullan',
    useCase: ['news', 'official', 'agency-photos'],
    priority: 1,
    fallbackMode: 'ai_original',
  },
  ai_original: {
    mode: 'ai_original',
    description: 'Tamamen özgün AI görseli oluştur',
    useCase: ['creative', 'illustration', 'abstract'],
    priority: 2,
    fallbackMode: 'ai_similar',
  },
  ai_similar: {
    mode: 'ai_similar',
    description: 'RSS görseline benzer AI görseli oluştur',
    useCase: ['copyright-concern', 'style-match', 'consistency'],
    priority: 3,
    fallbackMode: 'ai_original',
  },
  auto: {
    mode: 'auto',
    description: 'AI otomatik olarak en uygun modu seçer',
    useCase: ['intelligent-selection'],
    priority: 0,
    fallbackMode: 'rss',
  },
}

/**
 * Validate image mode
 */
export function isValidImageMode(mode: unknown): mode is ImageMode {
  return typeof mode === 'string' && mode in IMAGE_MODE_CONFIGS
}

/**
 * Get image mode description
 */
export function getImageModeDescription(mode: ImageMode): string {
  return IMAGE_MODE_CONFIGS[mode]?.description || 'Bilinmeyen mod'
}

/**
 * Get fallback mode for image mode
 */
export function getFallbackMode(mode: ImageMode): ImageMode {
  return IMAGE_MODE_CONFIGS[mode]?.fallbackMode || 'ai_original'
}

/**
 * Determine best image mode based on topic and settings
 */
export async function determineBestImageMode(
  topic: ScoredTopic,
  hasRssImage: boolean,
  defaultMode: ImageMode = 'auto'
): Promise<ImageMode> {
  // If no RSS image available, use AI original
  if (!hasRssImage) {
    return 'ai_original'
  }
  
  // If default mode is not auto, use it
  if (defaultMode !== 'auto') {
    return defaultMode
  }
  
  // Auto mode: determine based on topic
  return determineAutoMode(topic)
}

/**
 * Determine image mode in auto mode
 */
function determineAutoMode(topic: ScoredTopic): ImageMode {
  // News and breaking news - prefer RSS
  if (topic.category === 'breaking' || topic.category === 'news') {
    return 'rss'
  }
  
  // Tech and science - prefer AI original for illustrations
  if (['tech', 'science', 'technology'].includes(topic.category.toLowerCase())) {
    return 'ai_original'
  }
  
  // Opinion and analysis - prefer AI similar for consistency
  if (['opinion', 'analysis', 'opinion-analysis'].includes(topic.category.toLowerCase())) {
    return 'ai_similar'
  }
  
  // Default to RSS if available
  return 'rss'
}

/**
 * Log image mode selection
 */
export function logImageModeSelection(
  topic: string,
  selectedMode: ImageMode,
  reason: string,
  hasRssImage: boolean
): void {
  console.log(
    `[ImageModeHandler] Mode selected for "${topic}": ${selectedMode} (RSS available: ${hasRssImage}, Reason: ${reason})`
  )
}

/**
 * Validate image mode for topic
 */
export function validateImageModeForTopic(
  mode: ImageMode,
  topic: ScoredTopic,
  hasRssImage: boolean
): { valid: boolean; reason?: string } {
  // Auto mode is always valid
  if (mode === 'auto') {
    return { valid: true }
  }
  
  // RSS mode requires RSS image
  if (mode === 'rss' && !hasRssImage) {
    return {
      valid: false,
      reason: 'RSS görseli mevcut değil, RSS modu kullanılamaz',
    }
  }
  
  // All other modes are valid
  return { valid: true }
}

/**
 * Get recommended image mode for topic
 */
export function getRecommendedImageMode(topic: ScoredTopic, hasRssImage: boolean): ImageMode {
  // Breaking news - always use RSS if available
  if (topic.category === 'breaking') {
    return hasRssImage ? 'rss' : 'ai_original'
  }
  
  // News - prefer RSS
  if (topic.category === 'news') {
    return hasRssImage ? 'rss' : 'ai_original'
  }
  
  // Creative content - prefer AI original
  if (['tech', 'science', 'lifestyle'].includes(topic.category.toLowerCase())) {
    return 'ai_original'
  }
  
  // Default
  return hasRssImage ? 'rss' : 'ai_original'
}

/**
 * Image mode statistics
 */
export interface ImageModeStats {
  mode: ImageMode
  count: number
  successRate: number
  averageGenerationTime: number
}

/**
 * Format image mode for logging
 */
export function formatImageModeLog(
  mode: ImageMode,
  hasRssImage: boolean,
  selectedMode: ImageMode,
  reason: string
): string {
  return `[ImageMode] Requested: ${mode}, RSS Available: ${hasRssImage}, Selected: ${selectedMode}, Reason: ${reason}`
}
