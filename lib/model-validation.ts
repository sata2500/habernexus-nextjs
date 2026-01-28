/**
 * Model Validation and Health Check System
 * Validates AI models and monitors API health
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

export type ModelValidationStatus = 'valid' | 'invalid' | 'degraded' | 'unknown'

/**
 * Model validation result
 */
export interface ModelValidationResult {
  modelId: string
  status: ModelValidationStatus
  isAvailable: boolean
  latency?: number
  error?: string
  timestamp: Date
  details?: {
    contextWindow?: number
    maxTokens?: number
    capabilities?: string[]
    rateLimitRemaining?: number
    rateLimitReset?: number
  }
}

/**
 * API health check result
 */
export interface APIHealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: Date
  models: {
    [modelId: string]: ModelValidationStatus
  }
  metrics: {
    totalRequests: number
    failedRequests: number
    avgLatency: number
    errorRate: number
  }
  lastError?: {
    message: string
    timestamp: Date
  }
}

/**
 * Model compatibility check
 */
export interface ModelCompatibilityCheck {
  modelId: string
  isCompatible: boolean
  reason?: string
  suggestedAlternative?: string
}

/**
 * Validate a single model
 */
export async function validateModel(
  modelId: string,
  apiKey?: string
): Promise<ModelValidationResult> {
  const startTime = Date.now()

  try {
    // Check if model ID format is valid
    if (!isValidModelId(modelId)) {
      return {
        modelId,
        status: 'invalid',
        isAvailable: false,
        error: 'Invalid model ID format',
        timestamp: new Date(),
      }
    }

    // Check if model is in supported list
    if (!isSupportedModel(modelId)) {
      return {
        modelId,
        status: 'invalid',
        isAvailable: false,
        error: 'Model is not supported',
        timestamp: new Date(),
      }
    }

    // Check API key
    if (!apiKey && !process.env.GEMINI_API_KEY) {
      return {
        modelId,
        status: 'unknown',
        isAvailable: false,
        error: 'No API key provided',
        timestamp: new Date(),
      }
    }

    // Simulate model availability check (in production, make actual API call)
    const latency = Date.now() - startTime
    const isHealthy = latency < 5000 // 5 second timeout

    return {
      modelId,
      status: isHealthy ? 'valid' : 'degraded',
      isAvailable: isHealthy,
      latency,
      timestamp: new Date(),
      details: {
        contextWindow: getContextWindow(modelId),
        maxTokens: getMaxTokens(modelId),
        capabilities: getCapabilities(modelId),
      },
    }
  } catch (error) {
    return {
      modelId,
      status: 'invalid',
      isAvailable: false,
      error: String(error),
      timestamp: new Date(),
    }
  }
}

/**
 * Validate multiple models
 */
export async function validateModels(
  modelIds: string[],
  apiKey?: string
): Promise<ModelValidationResult[]> {
  return Promise.all(modelIds.map(id => validateModel(id, apiKey)))
}

/**
 * Check API health
 */
export async function checkAPIHealth(): Promise<APIHealthCheckResult> {
  const models = getSupportedModels()
  const validationResults = await validateModels(models)

  const degradedModels = validationResults.filter(r => r.status === 'degraded').length
  const failedModels = validationResults.filter(r => r.status === 'invalid').length

  const modelStatus: Record<string, ModelValidationStatus> = {}
  for (const result of validationResults) {
    modelStatus[result.modelId] = result.status
  }

  const avgLatency =
    validationResults.reduce((sum, r) => sum + (r.latency || 0), 0) /
    validationResults.length

  const errorRate = failedModels / validationResults.length

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  if (errorRate > 0.5) {
    overallStatus = 'unhealthy'
  } else if (errorRate > 0.2 || degradedModels > 0) {
    overallStatus = 'degraded'
  }

  return {
    status: overallStatus,
    timestamp: new Date(),
    models: modelStatus,
    metrics: {
      totalRequests: validationResults.length,
      failedRequests: failedModels,
      avgLatency,
      errorRate,
    },
  }
}

/**
 * Check model compatibility with use case
 */
export function checkModelCompatibility(
  modelId: string,
  useCase: 'content' | 'image' | 'summary'
): ModelCompatibilityCheck {
  const capabilities = getCapabilities(modelId)

  if (!isSupportedModel(modelId)) {
    return {
      modelId,
      isCompatible: false,
      reason: 'Model is not supported',
      suggestedAlternative: getSuggestedAlternative(useCase),
    }
  }

  const requiredCapabilities: Record<string, string[]> = {
    content: ['text-generation', 'reasoning'],
    image: ['image-generation', 'text-to-image'],
    summary: ['text-generation', 'summarization'],
  }

  const required = requiredCapabilities[useCase] || []
  const hasRequired = required.every(cap => capabilities.includes(cap))

  if (!hasRequired) {
    return {
      modelId,
      isCompatible: false,
      reason: `Model lacks required capabilities: ${required.join(', ')}`,
      suggestedAlternative: getSuggestedAlternative(useCase),
    }
  }

  return {
    modelId,
    isCompatible: true,
  }
}

/**
 * Get supported models
 */
export function getSupportedModels(): string[] {
  return [
    'gemini-3-pro',
    'gemini-3-pro-vision',
    'gemini-3-pro-image-preview',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-vision',
    'gemini-2.5-flash-image',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
  ]
}

/**
 * Check if model ID is valid format
 */
export function isValidModelId(modelId: string): boolean {
  // Basic validation: should start with 'gemini-'
  return /^gemini-[\d.a-z-]+$/.test(modelId)
}

/**
 * Check if model is supported
 */
export function isSupportedModel(modelId: string): boolean {
  return getSupportedModels().includes(modelId)
}

/**
 * Get context window for model
 */
export function getContextWindow(modelId: string): number {
  const contextWindows: Record<string, number> = {
    'gemini-3-pro': 1000000, // 1M tokens
    'gemini-3-pro-vision': 1000000,
    'gemini-3-pro-image-preview': 1000000,
    'gemini-2.5-pro': 1000000,
    'gemini-2.5-flash': 1000000,
    'gemini-2.5-flash-vision': 1000000,
    'gemini-2.5-flash-image': 1000000,
    'gemini-2.5-flash-lite': 32000,
    'gemini-2.0-flash': 1000000,
    'gemini-2.0-flash-lite': 32000,
  }

  return contextWindows[modelId] || 32000
}

/**
 * Get max output tokens for model
 */
export function getMaxTokens(modelId: string): number {
  const maxTokens: Record<string, number> = {
    'gemini-3-pro': 16000,
    'gemini-3-pro-vision': 16000,
    'gemini-3-pro-image-preview': 16000,
    'gemini-2.5-pro': 8192,
    'gemini-2.5-flash': 8192,
    'gemini-2.5-flash-vision': 8192,
    'gemini-2.5-flash-image': 8192,
    'gemini-2.5-flash-lite': 4096,
    'gemini-2.0-flash': 8192,
    'gemini-2.0-flash-lite': 4096,
  }

  return maxTokens[modelId] || 4096
}

/**
 * Get capabilities for model
 */
export function getCapabilities(modelId: string): string[] {
  const capabilities: Record<string, string[]> = {
    'gemini-3-pro': [
      'text-generation',
      'reasoning',
      'thinking',
      'function-calling',
      'json-mode',
      'grounding',
    ],
    'gemini-3-pro-vision': [
      'text-generation',
      'reasoning',
      'thinking',
      'vision',
      'image-understanding',
      'function-calling',
    ],
    'gemini-3-pro-image-preview': [
      'image-generation',
      'text-to-image',
      'image-editing',
      'reference-images',
      '4k',
      'thinking',
    ],
    'gemini-2.5-pro': [
      'text-generation',
      'reasoning',
      'function-calling',
      'json-mode',
      'grounding',
    ],
    'gemini-2.5-flash': [
      'text-generation',
      'reasoning',
      'function-calling',
      'json-mode',
      'fast',
    ],
    'gemini-2.5-flash-vision': [
      'text-generation',
      'vision',
      'image-understanding',
      'fast',
    ],
    'gemini-2.5-flash-image': [
      'image-generation',
      'text-to-image',
      'image-editing',
    ],
    'gemini-2.5-flash-lite': [
      'text-generation',
      'fast',
      'low-latency',
      'cost-effective',
    ],
    'gemini-2.0-flash': [
      'text-generation',
      'reasoning',
      'function-calling',
    ],
    'gemini-2.0-flash-lite': [
      'text-generation',
      'fast',
      'cost-effective',
    ],
  }

  return capabilities[modelId] || []
}

/**
 * Get suggested alternative model
 */
export function getSuggestedAlternative(useCase: string): string {
  const alternatives: Record<string, string> = {
    content: 'gemini-3-pro',
    image: 'gemini-3-pro-image-preview',
    summary: 'gemini-2.5-flash-lite',
  }

  return alternatives[useCase] || 'gemini-3-pro'
}

/**
 * Validate model for specific use case
 */
export function validateModelForUseCase(
  modelId: string,
  useCase: 'content' | 'image' | 'summary'
): {
  valid: boolean
  error?: string
  suggestion?: string
} {
  // Check if model is supported
  if (!isSupportedModel(modelId)) {
    return {
      valid: false,
      error: `Model ${modelId} is not supported`,
      suggestion: `Try using ${getSuggestedAlternative(useCase)} instead`,
    }
  }

  // Check compatibility
  const compatibility = checkModelCompatibility(modelId, useCase)
  if (!compatibility.isCompatible) {
    return {
      valid: false,
      error: compatibility.reason,
      suggestion: `Try using ${compatibility.suggestedAlternative} instead`,
    }
  }

  // Check special requirements
  if (useCase === 'content' && modelId.includes('gemini-3')) {
    // Gemini 3 requires temperature 1.0
    return {
      valid: true,
    }
  }

  return {
    valid: true,
  }
}

/**
 * Get model recommendations for use case
 */
export function getModelRecommendations(
  useCase: 'content' | 'image' | 'summary'
): string[] {
  const recommendations: Record<string, string[]> = {
    content: [
      'gemini-3-pro', // Best quality
      'gemini-2.5-pro', // Good balance
      'gemini-2.5-flash', // Fast
    ],
    image: [
      'gemini-3-pro-image-preview', // Best quality
      'gemini-2.5-flash-image', // Standard
    ],
    summary: [
      'gemini-2.5-flash-lite', // Fast and efficient
      'gemini-2.5-flash', // Standard
      'gemini-3-pro', // High quality
    ],
  }

  return recommendations[useCase] || []
}

/**
 * Model validation cache
 */
const validationCache = new Map<string, ModelValidationResult>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get cached validation result
 */
export function getCachedValidation(modelId: string): ModelValidationResult | null {
  const cached = validationCache.get(modelId)
  if (!cached) return null

  const age = Date.now() - cached.timestamp.getTime()
  if (age > CACHE_TTL) {
    validationCache.delete(modelId)
    return null
  }

  return cached
}

/**
 * Cache validation result
 */
export function cacheValidation(result: ModelValidationResult): void {
  validationCache.set(result.modelId, result)
}

/**
 * Clear validation cache
 */
export function clearValidationCache(): void {
  validationCache.clear()
}
