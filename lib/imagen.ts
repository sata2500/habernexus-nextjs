import { GoogleGenAI } from '@google/genai'
import { prisma } from '@/lib/prisma'
import { getPromptByType, interpolatePrompt, getImageStyleForCategory } from '@/lib/prompts'
import { PromptType } from '@prisma/client'
import { logImageError, logImageStats, classifyErrorType } from '@/lib/image-error-tracker'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Imagen Image Generation Service
 * Handles AI-powered image generation for news articles
 * 
 * @version 4.0.0
 * @lastUpdated 17 January 2026
 * 
 * Changes in v4.0.0:
 * - Updated to use Imagen 4.0 models (Imagen 3.0 deprecated)
 * - Added all 5 working Imagen models with metadata
 * - Added model status tracking (stable/preview)
 * - Added shutdown date warnings for preview models
 * - Added average duration and size info for each model
 * 
 * Changes in v3.0.0:
 * - Improved error handling and logging
 * - Added detailed API response validation
 * - Fixed base64 image decoding issues
 * - Added retry mechanism for transient failures
 * - Added image validation before saving
 * - Improved directory creation and file handling
 */

// Initialize the Gemini client lazily to avoid issues when API key is not set
let genAI: GoogleGenAI | null = null

/**
 * Get or create the Gemini client
 */
function getGenAIClient(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in .env file')
    }
    genAI = new GoogleGenAI({ apiKey })
  }
  return genAI
}

/**
 * Reset the Gemini client (useful when API key changes)
 */
export function resetGenAIClient(): void {
  genAI = null
}

// Default model for image generation
// Note: imagen-3.0-generate-002 is deprecated, using imagen-4.0-fast-generate-001
const DEFAULT_IMAGE_MODEL = 'imagen-4.0-fast-generate-001'

// Maximum retry attempts for transient failures
const MAX_RETRIES = 2

// Delay between retries (in ms)
const RETRY_DELAY = 2000

/**
 * Image generation result interface
 */
export interface ImageGenerationResult {
  success: boolean
  imageUrl: string | null
  error?: string
  retryCount?: number
}

/**
 * Get configured image model from settings
 */
async function getConfiguredImageModel(): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'ai_model_image' },
    })
    return setting?.value || DEFAULT_IMAGE_MODEL
  } catch (error) {
    console.warn('[Imagen] Failed to get configured model, using default:', error)
    return DEFAULT_IMAGE_MODEL
  }
}

/**
 * Generate an image prompt from article title and content
 * Now uses customizable prompts from database
 */
async function generateImagePrompt(title: string, category: string): Promise<string> {
  // Get prompt template from database
  let promptTemplate = await getPromptByType('IMAGE' as PromptType)
  
  // Fallback to hardcoded prompt if not found
  if (!promptTemplate) {
    promptTemplate = `An ultra-realistic, dynamic, and emotionally resonant photograph capturing the essence of a news story.

Subject: "{{title}}"
Category: {{category}}

Scene Description:
{{style}}. The scene is rich with authentic details, conveying a powerful narrative. If people are present, their expressions and actions are natural and meaningful, reflecting the core of the news story. The environment is highly detailed and contextually appropriate.

Composition & Framing:
Masterful composition, using the rule of thirds. A compelling medium shot or a wide shot that establishes the scene. The main subject is in sharp focus, with a natural depth of field that draws the viewer's eye.

Lighting:
Dramatic and natural lighting that enhances the mood. Could be the soft glow of golden hour, the crisp light of a modern office, or the dynamic lighting of a live event. Avoid flat or artificial lighting.

Atmosphere & Mood:
The image should evoke a specific emotion relevant to the story: urgency, hope, innovation, tension, or contemplation. The overall tone is professional, suitable for a leading news publication.

Technical Details:
Shot on a Sony a7R V with a G Master lens (e.g., 50mm f/1.2 or 24-70mm f/2.8). 16:9 aspect ratio. Hyper-detailed, sharp, and clear.

Negative Prompt:
--no text, no logos, no watermarks, blurry, oversaturated, ugly, deformed, disfigured, poor details, bad hands, extra limbs, extra fingers.`
  }

  // Get category-specific style
  const style = getImageStyleForCategory(category)

  // Clean title for prompt - translate Turkish characters and limit length
  const cleanTitle = title
    .replace(/['"]/g, '')
    .substring(0, 100)

  // Interpolate variables into the prompt
  return interpolatePrompt(promptTemplate, {
    title: cleanTitle,
    category,
    style,
  })
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Validate image data from API response
 */
function validateImageData(imageData: unknown): imageData is { imageBytes: string; mimeType?: string } {
  if (!imageData || typeof imageData !== 'object') {
    return false
  }
  
  const data = imageData as Record<string, unknown>
  
  // Check for imageBytes property
  if (typeof data.imageBytes === 'string' && data.imageBytes.length > 0) {
    return true
  }
  
  return false
}

/**
 * Generate an image for an article using Imagen API
 */
export async function generateArticleImage(
  title: string,
  category: string,
  _content?: string,
  modelOverride?: string,
  articleId?: string
): Promise<ImageGenerationResult> {
  let lastError: string = 'Unknown error'
  let retryCount = 0
  const startTime = Date.now()

  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Imagen] API key not configured, using placeholder')
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
      error: 'API key not configured. Please add GEMINI_API_KEY to .env file.',
    }
  }

  let model: string = ''
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = getGenAIClient()
      model = modelOverride || await getConfiguredImageModel()
      const prompt = await generateImagePrompt(title, category)

      console.log(`[Imagen] Attempt ${attempt + 1}/${MAX_RETRIES + 1} - Generating image with model: ${model}`)
      console.log(`[Imagen] Prompt preview: ${prompt.substring(0, 150)}...`)

      // Generate image using Imagen API
      const response = await client.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9',
        },
      })

      console.log('[Imagen] API Response received')
      console.log(`[Imagen] Generated images count: ${response.generatedImages?.length || 0}`)

      // Check if we got a valid response
      if (!response.generatedImages || response.generatedImages.length === 0) {
        lastError = 'No images generated in API response'
        console.error(`[Imagen] ${lastError}`)
        
        // Check if there's a block reason
        if (response.generatedImages === null) {
          console.error('[Imagen] Response may have been blocked by safety filters')
          lastError = 'Image generation blocked by safety filters'
        }
        
        if (attempt < MAX_RETRIES) {
          console.log(`[Imagen] Retrying in ${RETRY_DELAY}ms...`)
          await sleep(RETRY_DELAY)
          retryCount++
          continue
        }
        
        return {
          success: false,
          imageUrl: null,
          error: lastError,
          retryCount,
        }
      }

      // Get the generated image
      const generatedImage = response.generatedImages[0]
      
      // Log the structure of the response for debugging
      console.log('[Imagen] Generated image structure:', {
        hasImage: !!generatedImage.image,
        imageType: typeof generatedImage.image,
        imageKeys: generatedImage.image ? Object.keys(generatedImage.image) : [],
      })

      // Validate image data
      if (!generatedImage.image || !validateImageData(generatedImage.image)) {
        lastError = 'Invalid or missing image data in response'
        console.error(`[Imagen] ${lastError}`)
        console.error('[Imagen] Image data:', JSON.stringify(generatedImage.image, null, 2).substring(0, 500))
        
        if (attempt < MAX_RETRIES) {
          console.log(`[Imagen] Retrying in ${RETRY_DELAY}ms...`)
          await sleep(RETRY_DELAY)
          retryCount++
          continue
        }
        
        return {
          success: false,
          imageUrl: null,
          error: lastError,
          retryCount,
        }
      }

      // Save the image to public folder
      const imageUrl = await saveGeneratedImage(generatedImage.image, title)
      const duration = Date.now() - startTime

      console.log(`[Imagen] Image generated and saved successfully: ${imageUrl}`)

      // Log successful generation stats
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
        retryCount,
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[Imagen] Attempt ${attempt + 1} failed:`, lastError)
      
      // Log full error for debugging
      if (error instanceof Error && error.stack) {
        console.error('[Imagen] Stack trace:', error.stack)
      }
      
      // Check for specific error types that shouldn't be retried
      if (lastError.includes('API key') || lastError.includes('authentication') || lastError.includes('quota')) {
        console.error('[Imagen] Non-retryable error, stopping attempts')
        break
      }
      
      if (attempt < MAX_RETRIES) {
        console.log(`[Imagen] Retrying in ${RETRY_DELAY}ms...`)
        await sleep(RETRY_DELAY)
        retryCount++
      }
    }
  }

  // Log failed generation
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
    error: lastError,
    retryCount,
  }
}

/**
 * Save generated image to public folder
 */
async function saveGeneratedImage(
  imageData: { imageBytes?: string; mimeType?: string },
  title: string
): Promise<string> {
  // Validate image data
  if (!imageData.imageBytes) {
    throw new Error('No image bytes in response')
  }

  // Generate unique filename from title
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
  
  // Determine file extension from mime type
  let extension = 'png'
  if (imageData.mimeType) {
    const mimeMap: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
    }
    extension = mimeMap[imageData.mimeType] || 'png'
  }
  
  const filename = `${slug}-${timestamp}.${extension}`
  
  // Ensure the images directory exists
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'generated')
  
  try {
    if (!fs.existsSync(imagesDir)) {
      console.log(`[Imagen] Creating directory: ${imagesDir}`)
      fs.mkdirSync(imagesDir, { recursive: true })
    }
  } catch (dirError) {
    console.error('[Imagen] Failed to create directory:', dirError)
    throw new Error(`Failed to create images directory: ${dirError}`)
  }

  const filePath = path.join(imagesDir, filename)

  // Decode base64 image data
  console.log(`[Imagen] Decoding base64 image data (${imageData.imageBytes.length} characters)`)
  
  try {
    // Remove potential data URL prefix if present
    let base64Data = imageData.imageBytes
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1]
    }
    
    const buffer = Buffer.from(base64Data, 'base64')
    
    // Validate buffer size
    if (buffer.length < 1000) {
      throw new Error(`Image buffer too small (${buffer.length} bytes), likely invalid data`)
    }
    
    console.log(`[Imagen] Decoded buffer size: ${buffer.length} bytes`)
    
    // Write file
    fs.writeFileSync(filePath, buffer)
    
    // Verify file was written
    if (!fs.existsSync(filePath)) {
      throw new Error('File was not created after write operation')
    }
    
    const stats = fs.statSync(filePath)
    console.log(`[Imagen] File saved: ${filePath} (${stats.size} bytes)`)
    
    if (stats.size === 0) {
      fs.unlinkSync(filePath)
      throw new Error('Written file is empty')
    }
  } catch (saveError) {
    console.error('[Imagen] Failed to save image:', saveError)
    throw saveError
  }

  // Return the public URL
  return `/images/generated/${filename}`
}

/**
 * Check if Imagen API is configured and working
 */
export function isImagenConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return false
  }
  
  // Validate API key format (basic check)
  if (apiKey.length < 20) {
    console.warn('[Imagen] API key appears to be invalid (too short)')
    return false
  }
  
  return true
}

/**
 * Test Imagen API connection
 */
export async function testImagenConnection(): Promise<{
  success: boolean
  error?: string
  model?: string
}> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: 'API key not configured. Please add GEMINI_API_KEY to .env file.',
      }
    }
    
    const model = await getConfiguredImageModel()
    const client = getGenAIClient()
    
    // Try a simple test generation with a safe prompt
    console.log('[Imagen] Testing API connection...')
    const response = await client.models.generateImages({
      model,
      prompt: 'A simple blue gradient background, abstract, minimal',
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
      },
    })
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      return {
        success: true,
        model,
      }
    }
    
    return {
      success: false,
      error: 'API responded but no images were generated',
      model,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Available Imagen models with their characteristics
 * Updated: 14 January 2026
 */
export const IMAGEN_MODELS = {
  // Stable (GA) Models - Recommended for production
  'imagen-4.0-fast-generate-001': {
    name: 'Imagen 4.0 Fast',
    description: 'Hızlı ve yüksek kaliteli görsel üretimi (~5 saniye) - Önerilen',
    isDefault: true,
    status: 'stable',
    avgDuration: 5000,
    avgSize: 1200,
  },
  'imagen-4.0-generate-001': {
    name: 'Imagen 4.0 Standard',
    description: 'En yüksek kalite, daha fazla detay (~8 saniye)',
    isDefault: false,
    status: 'stable',
    avgDuration: 8000,
    avgSize: 1300,
  },
  'imagen-4.0-ultra-generate-001': {
    name: 'Imagen 4.0 Ultra',
    description: 'Ultra yüksek kalite, 2K çözünürlük (~10 saniye)',
    isDefault: false,
    status: 'stable',
    avgDuration: 10000,
    avgSize: 1300,
  },
  // Preview Models - Will be shut down Feb 17, 2026
  'imagen-4.0-generate-preview-06-06': {
    name: 'Imagen 4.0 Preview',
    description: 'Önizleme modeli - 17 Şubat 2026\'da kapanacak',
    isDefault: false,
    status: 'preview',
    avgDuration: 8000,
    avgSize: 1200,
    shutdownDate: '2026-02-17',
  },
  'imagen-4.0-ultra-generate-preview-06-06': {
    name: 'Imagen 4.0 Ultra Preview',
    description: 'Ultra önizleme modeli - 17 Şubat 2026\'da kapanacak',
    isDefault: false,
    status: 'preview',
    avgDuration: 10000,
    avgSize: 1500,
    shutdownDate: '2026-02-17',
  },
}

/**
 * Generate placeholder image URL based on category
 */
export function getPlaceholderImage(category: string): string {
  // Category-specific placeholder images
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

  // Check if category-specific placeholder exists, otherwise use default
  const categoryPlaceholder = placeholders[category]
  
  // Since category placeholders might not exist, always fallback to main placeholder
  // This ensures images always display
  return categoryPlaceholder || '/images/placeholder.jpg'
}

/**
 * Get current image prompt template
 * Used for displaying in admin panel
 */
export async function getCurrentImagePrompt(): Promise<string> {
  const template = await getPromptByType('IMAGE' as PromptType)
  return template || 'No image prompt template found'
}
