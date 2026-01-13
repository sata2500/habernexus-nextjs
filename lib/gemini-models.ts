/**
 * Gemini Model Configuration
 * Defines all available Gemini models and their properties
 * 
 * @version 1.0.0
 * @lastUpdated 13 January 2026
 */

/**
 * Model tier classification
 */
export type ModelTier = 'premium' | 'standard' | 'lite'

/**
 * Model use case type
 */
export type ModelUseCase = 'content' | 'sentiment' | 'category' | 'summary' | 'all'

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
  isExperimental: boolean
  isDeprecated: boolean
}

/**
 * All available Gemini models
 * Updated: January 2026
 */
export const GEMINI_MODELS: Record<string, GeminiModelConfig> = {
  // Gemini 3 Series (Latest)
  'gemini-3-pro-preview': {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    description: 'En akıllı model - Multimodal anlama ve agentic görevler için ideal',
    tier: 'premium',
    contextWindow: 1048576,
    outputTokens: 65536,
    useCases: ['content', 'sentiment', 'category', 'summary', 'all'],
    isExperimental: true,
    isDeprecated: false,
  },
  'gemini-3-flash-preview': {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    description: 'Hız ve zeka dengesi - Ölçeklenebilir görevler için',
    tier: 'standard',
    contextWindow: 1048576,
    outputTokens: 65536,
    useCases: ['content', 'sentiment', 'category', 'summary', 'all'],
    isExperimental: true,
    isDeprecated: false,
  },

  // Gemini 2.5 Series (Recommended)
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'En iyi fiyat-performans - Genel kullanım için önerilen',
    tier: 'standard',
    contextWindow: 1048576,
    outputTokens: 8192,
    useCases: ['content', 'sentiment', 'category', 'summary', 'all'],
    isExperimental: false,
    isDeprecated: false,
  },
  'gemini-2.5-flash-lite': {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    description: 'Ultra hızlı - Yüksek hacimli basit görevler için',
    tier: 'lite',
    contextWindow: 1048576,
    outputTokens: 8192,
    useCases: ['category', 'summary'],
    isExperimental: false,
    isDeprecated: false,
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Gelişmiş düşünme - Karmaşık analiz ve muhakeme için',
    tier: 'premium',
    contextWindow: 1048576,
    outputTokens: 8192,
    useCases: ['content', 'sentiment', 'all'],
    isExperimental: false,
    isDeprecated: false,
  },

  // Gemini 2.0 Series (Previous Generation)
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Stabil workhorse - Güvenilir genel kullanım',
    tier: 'standard',
    contextWindow: 1000000,
    outputTokens: 8192,
    useCases: ['content', 'sentiment', 'category', 'summary', 'all'],
    isExperimental: false,
    isDeprecated: false,
  },
  'gemini-2.0-flash-lite': {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    description: 'Hızlı ve ekonomik - Basit görevler için',
    tier: 'lite',
    contextWindow: 1000000,
    outputTokens: 8192,
    useCases: ['category', 'summary'],
    isExperimental: false,
    isDeprecated: false,
  },

  // Gemini 1.5 Series (Legacy - Will be deprecated)
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Eski nesil - Yakında kullanımdan kaldırılacak',
    tier: 'standard',
    contextWindow: 1000000,
    outputTokens: 8192,
    useCases: ['content', 'sentiment', 'category', 'summary', 'all'],
    isExperimental: false,
    isDeprecated: true,
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Eski nesil Pro - Yakında kullanımdan kaldırılacak',
    tier: 'premium',
    contextWindow: 2000000,
    outputTokens: 8192,
    useCases: ['content', 'sentiment', 'all'],
    isExperimental: false,
    isDeprecated: true,
  },
}

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
    models: ['gemini-3-pro-preview', 'gemini-3-flash-preview'],
    badge: 'Yeni',
  },
  recommended: {
    title: 'Gemini 2.5 Serisi (Önerilen)',
    models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'],
    badge: 'Önerilen',
  },
  stable: {
    title: 'Gemini 2.0 Serisi (Stabil)',
    models: ['gemini-2.0-flash', 'gemini-2.0-flash-lite'],
    badge: 'Stabil',
  },
  legacy: {
    title: 'Gemini 1.5 Serisi (Eski)',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    badge: 'Kullanımdan Kaldırılacak',
  },
}
