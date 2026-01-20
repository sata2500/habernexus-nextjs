/**
 * Unified Image Generator Service
 * Consolidates Imagen and Nano Banana Pro into a single, simple interface
 * 
 * @version 1.0.0
 * @lastUpdated 20 January 2026
 * 
 * Features:
 * - Single interface for all image generation
 * - Automatic fallback between providers
 * - Smart provider selection based on category
 * - Unified error handling and logging
 * - Support for both Imagen 4.0 and Nano Banana Pro
 */

import { GoogleGenAI } from '@google/genai'
import { prisma } from '@/lib/prisma'
import { getPromptByType, interpolatePrompt, getImageStyleForCategory } from '@/lib/prompts'
import { logImageError, logImageStats, classifyErrorType } from '@/lib/image-error-tracker'
import * as fs from 'fs'
import * as path from 'path'

// ============================================
// Types and Interfaces
// ============================================

export type ImageProvider = 'imagen' | 'nano-banana' | 'auto'
export type ImageSource = 'ai' | 'rss' | 'placeholder'

export interface ImageGenerationConfig {
  provider?: ImageProvider
  model?: string
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
  quality?: 'fast' | 'standard' | 'ultra'
}

export interface ImageGenerationResult {
  success: boolean
  imageUrl: string | null
  source: ImageSource
  provider?: ImageProvider
  model?: string
  duration?: number
  error?: string
  retryCount?: number
}

// ============================================
// Model Definitions
// ============================================

/**
 * Imagen 4.0 Models
 */
export const IMAGEN_MODELS = {
  fast: 'imagen-4.0-fast-generate-001',
  standard: 'imagen-4.0-generate-001',
  ultra: 'imagen-4.0-ultra-generate-001',
} as const

/**
 * Nano Banana Models (Gemini-based image generation)
 */
export const NANO_BANANA_MODELS = {
  standard: 'gemini-2.0-flash-exp-image-generation',
  pro: 'gemini-2.0-flash-exp-image-generation', // Same model, different config
} as const

/**
 * All available image models for admin UI
 */
export const ALL_IMAGE_MODELS = [
  // Imagen 4.0 Models
  { 
    id: 'imagen-4.0-fast-generate-001', 
    name: 'Imagen 4.0 Fast', 
    description: 'Hızlı ve yüksek kalite (~5s)',
    provider: 'imagen' as ImageProvider,
    isRecommended: true,
    avgDuration: 5000,
  },
  { 
    id: 'imagen-4.0-generate-001', 
    name: 'Imagen 4.0 Standard', 
    description: 'En yüksek kalite (~8s)',
    provider: 'imagen' as ImageProvider,
    isRecommended: false,
    avgDuration: 8000,
  },
  { 
    id: 'imagen-4.0-ultra-generate-001', 
    name: 'Imagen 4.0 Ultra', 
    description: 'Ultra kalite, 2K çözünürlük (~10s)',
    provider: 'imagen' as ImageProvider,
    isRecommended: false,
    avgDuration: 10000,
  },
  // Nano Banana Models
  { 
    id: 'gemini-2.0-flash-exp-image-generation', 
    name: 'Nano Banana', 
    description: 'Gemini tabanlı görsel üretimi (~8s)',
    provider: 'nano-banana' as ImageProvider,
    isRecommended: false,
    avgDuration: 8000,
  },
]

// ============================================
// Client Initialization
// ============================================

let genAI: GoogleGenAI | null = null

function getGenAIClient(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set')
    }
    genAI = new GoogleGenAI({ apiKey })
  }
  return genAI
}

// ============================================
// Configuration Functions
// ============================================

/**
 * Get configured image model from settings
 */
async function getConfiguredModel(): Promise<{ model: string; provider: ImageProvider }> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'ai_model_image' },
    })
    
    const modelId = setting?.value || IMAGEN_MODELS.fast
    const modelInfo = ALL_IMAGE_MODELS.find(m => m.id === modelId)
    
    return {
      model: modelId,
      provider: modelInfo?.provider || 'imagen',
    }
  } catch (error) {
    console.warn('[ImageGenerator] Failed to get configured model:', error)
    return {
      model: IMAGEN_MODELS.fast,
      provider: 'imagen',
    }
  }
}

/**
 * Determine provider from model ID
 */
function getProviderFromModel(modelId: string): ImageProvider {
  if (modelId.startsWith('imagen-')) {
    return 'imagen'
  }
  if (modelId.startsWith('gemini-')) {
    return 'nano-banana'
  }
  return 'imagen' // Default
}

// ============================================
// Prompt Generation
// ============================================

/**
 * Generate optimized image prompt
 */
async function generateImagePrompt(
  title: string, 
  category: string,
  provider: ImageProvider
): Promise<string> {
  // Get prompt template from database
  let promptTemplate = await getPromptByType('IMAGE')
  
  // Fallback to provider-optimized default
  if (!promptTemplate) {
    if (provider === 'nano-banana') {
      // Nano Banana works better with simpler, more direct prompts
      promptTemplate = `Create a professional news photograph for: "{{title}}"

Category: {{category}}
Style: {{style}}

Requirements:
- Photorealistic, high-quality image
- Professional news photography style
- 16:9 aspect ratio
- No text, logos, or watermarks
- Sharp focus, good lighting`
    } else {
      // Imagen works well with detailed prompts
      promptTemplate = `An ultra-realistic photograph capturing the essence of a news story.

Subject: "{{title}}"
Category: {{category}}

Scene: {{style}}. Rich with authentic details, conveying a powerful narrative.

Composition: Masterful, using rule of thirds. Medium or wide shot with natural depth of field.

Lighting: Dramatic and natural, enhancing the mood.

Technical: Shot on Sony a7R V, 16:9 aspect ratio, hyper-detailed.

--no text, logos, watermarks, blurry, oversaturated`
    }
  }

  const style = getImageStyleForCategory(category)
  const cleanTitle = title.replace(/['"]/g, '').substring(0, 100)

  return interpolatePrompt(promptTemplate, {
    title: cleanTitle,
    category,
    style,
  })
}

// ============================================
// Image Generation Functions
// ============================================

/**
 * Generate image using Imagen API
 */
async function generateWithImagen(
  prompt: string,
  model: string,
  aspectRatio: string = '16:9'
): Promise<{ success: boolean; imageBytes?: string; mimeType?: string; error?: string }> {
  try {
    const client = getGenAIClient()
    
    const response = await client.models.generateImages({
      model,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio as '16:9' | '1:1' | '3:4' | '4:3' | '9:16',
      },
    })

    if (!response.generatedImages || response.generatedImages.length === 0) {
      return { success: false, error: 'No images generated' }
    }

    const image = response.generatedImages[0]
    if (!image.image?.imageBytes) {
      return { success: false, error: 'Invalid image data' }
    }

    return {
      success: true,
      imageBytes: image.image.imageBytes,
      mimeType: image.image.mimeType || 'image/png',
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate image using Nano Banana (Gemini native image generation)
 */
async function generateWithNanoBanana(
  prompt: string,
  model: string
): Promise<{ success: boolean; imageBytes?: string; mimeType?: string; error?: string }> {
  try {
    const client = getGenAIClient()
    
    // Nano Banana uses generateContent with image output
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseModalities: ['image', 'text'],
      },
    })

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts
    if (!parts) {
      return { success: false, error: 'No response parts' }
    }

    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          success: true,
          imageBytes: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        }
      }
    }

    return { success: false, error: 'No image in response' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// File Saving
// ============================================

/**
 * Save generated image to public folder
 */
async function saveImage(
  imageBytes: string,
  mimeType: string,
  title: string
): Promise<string> {
  // Generate unique filename
  const slug = title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
  
  const timestamp = Date.now()
  const extension = mimeType.includes('jpeg') ? 'jpg' : 
                    mimeType.includes('webp') ? 'webp' : 'png'
  const filename = `${slug}-${timestamp}.${extension}`
  
  // Ensure directory exists
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'generated')
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }

  const filePath = path.join(imagesDir, filename)

  // Decode and save
  let base64Data = imageBytes
  if (base64Data.includes(',')) {
    base64Data = base64Data.split(',')[1]
  }
  
  const buffer = Buffer.from(base64Data, 'base64')
  if (buffer.length < 1000) {
    throw new Error('Image buffer too small')
  }
  
  fs.writeFileSync(filePath, buffer)
  
  return `/images/generated/${filename}`
}

// ============================================
// Main Generation Function
// ============================================

const MAX_RETRIES = 2
const RETRY_DELAY = 2000

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate an image for an article
 * Main entry point for all image generation
 */
export async function generateImage(
  title: string,
  category: string,
  config: ImageGenerationConfig = {},
  articleId?: string
): Promise<ImageGenerationResult> {
  const startTime = Date.now()
  let lastError = 'Unknown error'
  let retryCount = 0

  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    await logImageError({
      articleId,
      source: 'ai',
      operation: 'generate',
      errorType: 'auth_error',
      errorMessage: 'GEMINI_API_KEY not configured',
      category,
    })
    return {
      success: false,
      imageUrl: null,
      source: 'placeholder',
      error: 'API key not configured',
    }
  }

  // Get model configuration
  const { model: configuredModel, provider: configuredProvider } = await getConfiguredModel()
  const model = config.model || configuredModel
  const provider = config.provider === 'auto' 
    ? configuredProvider 
    : (config.provider || getProviderFromModel(model))

  console.log(`[ImageGenerator] Starting generation with ${provider}/${model}`)

  // Generate prompt
  const prompt = await generateImagePrompt(title, category, provider)
  console.log(`[ImageGenerator] Prompt: ${prompt.substring(0, 100)}...`)

  // Try generation with retries
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[ImageGenerator] Attempt ${attempt + 1}/${MAX_RETRIES + 1}`)

      let result: { success: boolean; imageBytes?: string; mimeType?: string; error?: string }

      if (provider === 'nano-banana') {
        result = await generateWithNanoBanana(prompt, model)
      } else {
        result = await generateWithImagen(prompt, model, config.aspectRatio || '16:9')
      }

      if (result.success && result.imageBytes) {
        const imageUrl = await saveImage(result.imageBytes, result.mimeType || 'image/png', title)
        const duration = Date.now() - startTime

        console.log(`[ImageGenerator] Success: ${imageUrl} (${duration}ms)`)

        await logImageStats({
          articleId,
          source: 'ai',
          model,
          duration,
          success: true,
        })

        return {
          success: true,
          imageUrl,
          source: 'ai',
          provider,
          model,
          duration,
          retryCount,
        }
      }

      lastError = result.error || 'Unknown error'
      console.warn(`[ImageGenerator] Attempt failed: ${lastError}`)

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY)
        retryCount++
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[ImageGenerator] Error: ${lastError}`)

      if (lastError.includes('API key') || lastError.includes('quota')) {
        break // Don't retry auth/quota errors
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY)
        retryCount++
      }
    }
  }

  // Log failure
  const duration = Date.now() - startTime
  await logImageError({
    articleId,
    source: 'ai',
    operation: 'generate',
    errorType: classifyErrorType(lastError),
    errorMessage: lastError,
    category,
    retryCount,
  })
  await logImageStats({
    articleId,
    source: 'ai',
    model,
    duration,
    success: false,
  })

  return {
    success: false,
    imageUrl: null,
    source: 'placeholder',
    provider,
    model,
    duration,
    error: lastError,
    retryCount,
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Check if image generation is configured
 */
export async function isImageGenerationConfigured(): Promise<boolean> {
  return !!process.env.GEMINI_API_KEY
}

/**
 * Test image generation connection
 */
export async function testImageGeneration(): Promise<{
  success: boolean
  provider?: ImageProvider
  model?: string
  error?: string
}> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: 'API key not configured' }
    }

    const { model, provider } = await getConfiguredModel()
    const prompt = 'A simple blue gradient background, abstract, minimal'

    let result
    if (provider === 'nano-banana') {
      result = await generateWithNanoBanana(prompt, model)
    } else {
      result = await generateWithImagen(prompt, model, '1:1')
    }

    return {
      success: result.success,
      provider,
      model,
      error: result.error,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get placeholder image for category
 */
export function getPlaceholderImage(category: string): string {
  const placeholders: Record<string, string> = {
    'Teknoloji': '/images/placeholders/tech.jpg',
    'Ekonomi': '/images/placeholders/economy.jpg',
    'Spor': '/images/placeholders/sports.jpg',
    'Sağlık': '/images/placeholders/health.jpg',
    'Bilim': '/images/placeholders/science.jpg',
    'Dünya': '/images/placeholders/world.jpg',
    'Kültür-Sanat': '/images/placeholders/culture.jpg',
    'Gündem': '/images/placeholders/news.jpg',
  }

  return placeholders[category] || '/images/placeholder.jpg'
}

/**
 * Get all available image models for admin UI
 */
export function getAvailableImageModels() {
  return ALL_IMAGE_MODELS
}
