import { GoogleGenAI, PersonGeneration } from '@google/genai'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Imagen Image Generation Service
 * Handles AI-powered image generation for news articles
 * 
 * @version 1.0.0
 * @lastUpdated 13 January 2026
 */

// Initialize the Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

// Default model for image generation
const DEFAULT_IMAGE_MODEL = 'imagen-3.0-generate-002'

/**
 * Image generation result interface
 */
export interface ImageGenerationResult {
  success: boolean
  imageUrl: string | null
  error?: string
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
  } catch {
    return DEFAULT_IMAGE_MODEL
  }
}

/**
 * Generate an image prompt from article title and content
 */
function generateImagePrompt(title: string, category: string, content?: string): string {
  // Extract key themes from title
  const cleanTitle = title
    .replace(/['"]/g, '')
    .substring(0, 100)

  // Category-specific style hints
  const categoryStyles: Record<string, string> = {
    'Teknoloji': 'modern, digital, futuristic, tech-inspired',
    'Ekonomi': 'professional, business, financial, corporate',
    'Spor': 'dynamic, energetic, athletic, action',
    'Sağlık': 'clean, medical, wellness, healthy lifestyle',
    'Bilim': 'scientific, research, discovery, innovation',
    'Dünya': 'global, international, world news, diverse',
    'Kültür-Sanat': 'artistic, creative, cultural, colorful',
    'Gündem': 'news, current events, journalistic, informative',
  }

  const style = categoryStyles[category] || 'professional, news, journalistic'

  // Build the prompt
  const prompt = `A high-quality, professional news article header image. 
Topic: ${cleanTitle}
Style: ${style}, photorealistic, editorial quality, 16:9 aspect ratio, no text overlay, suitable for news website.
The image should be visually appealing and relevant to the topic without showing any specific people's faces.`

  return prompt
}

/**
 * Generate an image for an article using Imagen API
 */
export async function generateArticleImage(
  title: string,
  category: string,
  content?: string,
  modelOverride?: string
): Promise<ImageGenerationResult> {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn('[Imagen] API key not configured, using placeholder')
      return {
        success: false,
        imageUrl: null,
        error: 'API key not configured',
      }
    }

    const model = modelOverride || await getConfiguredImageModel()
    const prompt = generateImagePrompt(title, category, content)

    console.log(`[Imagen] Generating image with model: ${model}`)
    console.log(`[Imagen] Prompt: ${prompt.substring(0, 100)}...`)

    // Generate image using Imagen API
    const response = await genAI.models.generateImages({
      model,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        // Don't generate people to avoid issues
        personGeneration: PersonGeneration.DONT_ALLOW,
      },
    })

    // Check if we got a valid response
    if (!response.generatedImages || response.generatedImages.length === 0) {
      console.error('[Imagen] No images generated')
      return {
        success: false,
        imageUrl: null,
        error: 'No images generated',
      }
    }

    // Get the generated image
    const generatedImage = response.generatedImages[0]
    
    // Check if image data exists
    if (!generatedImage.image) {
      console.error('[Imagen] No image data in response')
      return {
        success: false,
        imageUrl: null,
        error: 'No image data in response',
      }
    }

    // Save the image to public folder
    const imageUrl = await saveGeneratedImage(generatedImage.image, title)

    console.log(`[Imagen] Image generated successfully: ${imageUrl}`)

    return {
      success: true,
      imageUrl,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Imagen] Image generation failed:', errorMessage)
    
    return {
      success: false,
      imageUrl: null,
      error: errorMessage,
    }
  }
}

/**
 * Save generated image to public folder
 */
async function saveGeneratedImage(
  imageData: { imageBytes?: string; mimeType?: string },
  title: string
): Promise<string> {
  try {
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
      .substring(0, 50)
    
    const timestamp = Date.now()
    const filename = `${slug}-${timestamp}.png`
    
    // Ensure the images directory exists
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'generated')
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
    }

    const filePath = path.join(imagesDir, filename)

    // Decode base64 image data and save
    if (imageData.imageBytes) {
      const buffer = Buffer.from(imageData.imageBytes, 'base64')
      fs.writeFileSync(filePath, buffer)
    } else {
      throw new Error('No image bytes in response')
    }

    // Return the public URL
    return `/images/generated/${filename}`
  } catch (error) {
    console.error('[Imagen] Failed to save image:', error)
    throw error
  }
}

/**
 * Check if Imagen API is configured and working
 */
export async function isImagenConfigured(): Promise<boolean> {
  return !!process.env.GEMINI_API_KEY
}

/**
 * Get available Imagen models
 */
export const IMAGEN_MODELS = {
  'imagen-3.0-generate-002': {
    name: 'Imagen 3.0',
    description: 'Yüksek kaliteli görsel üretimi',
    isDefault: true,
  },
  'imagen-4.0-generate-001': {
    name: 'Imagen 4.0',
    description: 'En yeni model - Daha yüksek kalite',
    isDefault: false,
  },
  'imagen-4.0-fast-generate-001': {
    name: 'Imagen 4.0 Fast',
    description: 'Hızlı görsel üretimi',
    isDefault: false,
  },
  'imagen-4.0-ultra-generate-001': {
    name: 'Imagen 4.0 Ultra',
    description: 'Ultra yüksek kalite (2K)',
    isDefault: false,
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

  return placeholders[category] || '/images/placeholder.jpg'
}
