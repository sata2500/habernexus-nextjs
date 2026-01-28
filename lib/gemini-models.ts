/**
 * Gemini Model Configuration
 * Defines all available Gemini models and their properties
 * 
 * @version 2.1.0
 * @lastUpdated 24 January 2026
 * 
 * Changes in v2.1.0:
 * - Focused on Gemini 3.0 and 2.5 series
 * - Removed Gemini 2.0 models
 * - Prioritized Gemini 3 Flash and Pro
 */

/**
 * Model tier classification
 */
export type ModelTier = 'premium' | 'standard' | 'lite'

/**
 * Model use case type
 */
export type ModelUseCase = 'content' | 'sentiment' | 'category' | 'summary' | 'image' | 'all'

/**
 * Model capability type
 */
export type ModelCapability = 'text' | 'image' | 'multimodal'

/**
 * Gemini model configuration interface
 */
export interface GeminiModelConfig {
  id: string
  name: string
  description: string
  tier: ModelTier
  contextWindow: number
  outputTokens: number
  useCases: ModelUseCase[]
  capabilities: ModelCapability[]
  isExperimental: boolean
  isDeprecated: boolean
  isRecommended?: boolean
}

/**
 * All available Gemini models
 * Updated: 20 January 2026
 * 
 * Model Categories:
 * - Gemini 3: Latest generation, best performance
 * - Gemini 2.5: Recommended for production, stable
 * - Gemini 2.0: Previous generation, still supported
 * - Nano Banana: Image generation models
 */
export const GEMINI_MODELS: Record<string, GeminiModelConfig> = {
  // ============================================
  // Gemini 3 Series (Latest - January 2026)
  // ============================================
  'gemini-3-pro': {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    description: 'En akıllı model - Multimodal anlama, agentic görevler ve karmaşık muhakeme için',
    tier: 'premium',
    contextWindow: 2097152, // 2M tokens
    outputTokens: 65536,
    useCases: ['content', 'sentiment', 'category', 'summary', 'all'],
    capabilities: ['text', 'multimodal'],
    isExperimental: false,
    isDeprecated: false,
    isRecommended: false,
  },
  'gemini-3-flash': {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    description: 'Hız ve frontier zeka dengesi - Ölçeklenebilir görevler için ideal',
    tier: 'standard',
    contextWindow: 1048576, // 1M tokens
    outputTokens: 65536,
    useCases: ['content', 'sentiment', 'category', 'summary', 'all'],
    capabilities: ['text', 'multimodal'],
    isExperimental: false,
    isDeprecated: false,
    isRecommended: true,
  },

  // ============================================
  // Gemini 2.5 Series (Stable - Recommended)
  // ============================================
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'En iyi fiyat-performans - Genel kullanım için önerilen',
    tier: 'standard',
    contextWindow: 1048576,
    outputTokens: 8192,
    useCases: ['content', 'sentiment', 'category', 'summary', 'all'],
    capabilities: ['text', 'multimodal'],
    isExperimental: false,
    isDeprecated: false,
    isRecommended: true,
  },
  'gemini-2.5-flash-lite': {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    description: 'Ultra hızlı ve ekonomik - Yüksek hacimli basit görevler için',
    tier: 'lite',
    contextWindow: 1048576,
    outputTokens: 8192,
    useCases: ['category', 'summary'],
    capabilities: ['text'],
    isExperimental: false,
    isDeprecated: false,
    isRecommended: false,
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Gelişmiş düşünme modeli - Karmaşık analiz, kod ve STEM için',
    tier: 'premium',
    contextWindow: 1048576,
    outputTokens: 8192,
    useCases: ['content', 'sentiment', 'all'],
    capabilities: ['text', 'multimodal'],
    isExperimental: false,
    isDeprecated: false,
    isRecommended: false,
  },
}



/**
 * Nano Banana Image Generation Models
 * Separate from text models for clarity
 */
export const NANO_BANANA_MODELS: Record<string, {
  id: string
  name: string
  description: string
  tier: ModelTier
  isRecommended: boolean
  avgDuration: number // ms
}> = {
  'gemini-2.5-flash-preview-native-audio-dialog': {
    id: 'gemini-2.5-flash-preview-native-audio-dialog',
    name: 'Nano Banana (Gemini 2.5 Flash Image)',
    description: 'Gemini tabanlı görsel üretimi - Hızlı ve kaliteli',
    tier: 'standard',
    isRecommended: true,
    avgDuration: 8000,
  },
  'gemini-3-pro-image-preview': {
    id: 'gemini-3-pro-image-preview',
    name: 'Nano Banana Pro (Gemini 3 Pro Image)',
    description: 'En yüksek kalite görsel üretimi - Gemini 3 Pro tabanlı',
    tier: 'premium',
    isRecommended: false,
    avgDuration: 12000,
  },
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get all available models
 */
export function getAllModels(): GeminiModelConfig[] {
  return Object.values(GEMINI_MODELS)
}

/**
 * Get models by tier
 */
export function getModelsByTier(tier: ModelTier): GeminiModelConfig[] {
  return Object.values(GEMINI_MODELS).filter(model => model.tier === tier)
}

/**
 * Get models by use case
 */
export function getModelsByUseCase(useCase: ModelUseCase): GeminiModelConfig[] {
  return Object.values(GEMINI_MODELS).filter(
    model => model.useCases.includes(useCase) || model.useCases.includes('all')
  )
}

/**
 * Get non-deprecated models
 */
export function getActiveModels(): GeminiModelConfig[] {
  return Object.values(GEMINI_MODELS).filter(model => !model.isDeprecated)
}

/**
 * Get stable (non-experimental) models
 */
export function getStableModels(): GeminiModelConfig[] {
  return Object.values(GEMINI_MODELS).filter(
    model => !model.isExperimental && !model.isDeprecated
  )
}

/**
 * Get recommended models
 */
export function getRecommendedModels(): GeminiModelConfig[] {
  return Object.values(GEMINI_MODELS).filter(model => model.isRecommended)
}

/**
 * Get model by ID
 */
export function getModelById(id: string): GeminiModelConfig | undefined {
  return GEMINI_MODELS[id]
}

/**
 * Get default model for a use case
 */
export function getDefaultModel(useCase: ModelUseCase): string {
  switch (useCase) {
    case 'content':
      return 'gemini-2.5-flash'
    case 'sentiment':
      return 'gemini-2.5-flash'
    case 'category':
      return 'gemini-2.5-flash-lite'
    case 'summary':
      return 'gemini-2.5-flash-lite'
    case 'image':
      return 'gemini-2.5-flash' // For image prompts, not generation
    default:
      return 'gemini-2.5-flash'
  }
}

/**
 * Validate if a model ID is valid
 */
export function isValidModel(modelId: string): boolean {
  return modelId in GEMINI_MODELS
}

/**
 * Get model display name
 */
export function getModelDisplayName(modelId: string): string {
  const model = GEMINI_MODELS[modelId]
  return model ? model.name : modelId
}

/**
 * Model groups for UI display
 */
export const MODEL_GROUPS = {
  latest: {
    title: 'Gemini 3 Serisi (En Yeni)',
    models: ['gemini-3-pro', 'gemini-3-flash'],
    badge: 'Yeni',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  recommended: {
    title: 'Gemini 2.5 Serisi (Önerilen)',
    models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'],
  },
}

/**
 * Get all model groups as array for iteration
 */
export function getModelGroupsArray() {
  return [
    MODEL_GROUPS.latest,
    MODEL_GROUPS.recommended,
  ]
}
