/**
 * Content Engine v3.0 - Image Handler
 * 
 * @version 3.0.0
 * @lastUpdated 20 January 2026
 * 
 * This module handles image generation and optimization with three modes:
 * 1. RSS: Use original image from RSS feed
 * 2. AI Original: Generate completely original image with AI
 * 3. AI Similar: Generate AI image similar to RSS image
 * 4. Auto: Let AI decide the best mode
 */

import { GoogleGenAI } from '@google/genai'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import type {
  ImageMode,
  ImageGenerationResult,
  ScoredTopic,
  EngineLogEntry,
} from './types'

// Initialize Gemini client dynamically to support runtime API key changes
function getGenAI() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
  })
}

// Image output directory
const IMAGE_OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'generated')

// Placeholder image path
const PLACEHOLDER_IMAGE = '/images/placeholder-news.webp'

/**
 * Ensure output directory exists
 */
async function ensureOutputDir(): Promise<void> {
  try {
    await fs.access(IMAGE_OUTPUT_DIR)
  } catch {
    await fs.mkdir(IMAGE_OUTPUT_DIR, { recursive: true })
  }
}

/**
 * Download and optimize image from URL
 */
async function downloadAndOptimize(
  url: string,
  slug: string,
  maxWidth: number = 1200,
  quality: number = 85
): Promise<{ path: string; originalSize: number; optimizedSize: number; width: number; height: number } | null> {
  try {
    // Fetch image
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HaberNexus/1.0)',
      },
      signal: AbortSignal.timeout(30000),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const buffer = Buffer.from(await response.arrayBuffer())
    const originalSize = buffer.length
    
    // Process with sharp
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    // Resize if needed
    let processedImage = image
    if (metadata.width && metadata.width > maxWidth) {
      processedImage = image.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
    }
    
    // Convert to WebP
    const outputBuffer = await processedImage
      .webp({ quality })
      .toBuffer()
    
    // Generate filename
    const filename = `${slug}-${Date.now()}.webp`
    const outputPath = path.join(IMAGE_OUTPUT_DIR, filename)
    
    // Save file
    await ensureOutputDir()
    await fs.writeFile(outputPath, outputBuffer)
    
    // Get final dimensions
    const finalMetadata = await sharp(outputBuffer).metadata()
    
    return {
      path: `/images/generated/${filename}`,
      originalSize,
      optimizedSize: outputBuffer.length,
      width: finalMetadata.width || 0,
      height: finalMetadata.height || 0,
    }
  } catch (error) {
    console.error('[ImageHandler] Download error:', error)
    return null
  }
}

/**
 * Generate image using Imagen API
 */
async function generateWithImagen(
  prompt: string,
  slug: string,
  aspectRatio: string = '16:9'
): Promise<{ path: string; size: number; width: number; height: number } | null> {
  try {
    const response = await getGenAI().models.generateImages({
      model: 'imagen-4.0-fast-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
      },
    })
    
    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No images generated')
    }
    
    const generatedImage = response.generatedImages[0]
    
    // Get image data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageData = (generatedImage as any).image
    if (!imageData || !imageData.imageBytes) {
      throw new Error('No image data in response')
    }
    
    // Decode base64
    const buffer = Buffer.from(imageData.imageBytes, 'base64')
    
    // Optimize with sharp
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer()
    
    // Generate filename
    const filename = `${slug}-ai-${Date.now()}.webp`
    const outputPath = path.join(IMAGE_OUTPUT_DIR, filename)
    
    // Save file
    await ensureOutputDir()
    await fs.writeFile(outputPath, optimizedBuffer)
    
    // Get dimensions
    const metadata = await sharp(optimizedBuffer).metadata()
    
    return {
      path: `/images/generated/${filename}`,
      size: optimizedBuffer.length,
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  } catch (error) {
    console.error('[ImageHandler] Imagen generation error:', error)
    return null
  }
}

/**
 * Generate image using Nano Banana (Gemini native image generation)
 */
async function generateWithNanoBanana(
  prompt: string,
  slug: string
): Promise<{ path: string; size: number; width: number; height: number } | null> {
  try {
    const response = await getGenAI().models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [prompt],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    })
    
    // Find image part in response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseParts = (response as any).parts || (response as any).candidates?.[0]?.content?.parts || []
    for (const part of responseParts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inlineData = (part as any).inlineData
      if (inlineData && inlineData.data) {
        const buffer = Buffer.from(inlineData.data, 'base64')
        
        // Optimize with sharp
        const optimizedBuffer = await sharp(buffer)
          .webp({ quality: 85 })
          .toBuffer()
        
        // Generate filename
        const filename = `${slug}-nb-${Date.now()}.webp`
        const outputPath = path.join(IMAGE_OUTPUT_DIR, filename)
        
        // Save file
        await ensureOutputDir()
        await fs.writeFile(outputPath, optimizedBuffer)
        
        // Get dimensions
        const metadata = await sharp(optimizedBuffer).metadata()
        
        return {
          path: `/images/generated/${filename}`,
          size: optimizedBuffer.length,
          width: metadata.width || 0,
          height: metadata.height || 0,
        }
      }
    }
    
    throw new Error('No image in response')
  } catch (error) {
    console.error('[ImageHandler] Nano Banana generation error:', error)
    return null
  }
}

/**
 * Determine best image mode using AI
 */
async function determineImageMode(
  topic: ScoredTopic,
  hasRssImage: boolean
): Promise<ImageMode> {
  if (!hasRssImage) {
    return 'ai_original'
  }
  
  try {
    const prompt = `Bir haber editörü olarak, aşağıdaki haber için en uygun görsel kaynağını belirle.

HABER BAŞLIĞI: ${topic.title}
KATEGORİ: ${topic.category}
RSS GÖRSELİ MEVCUT: Evet

SEÇENEKLER:
1. "rss" - RSS'den gelen orijinal görseli kullan (haber ajansı fotoğrafları, resmi görseller için uygun)
2. "ai_original" - Tamamen özgün AI görseli oluştur (yaratıcı içerikler, illüstrasyonlar için uygun)
3. "ai_similar" - RSS görseline benzer AI görseli oluştur (telif hakları endişesi varsa)

KARAR KRİTERLERİ:
- Haber ajansı veya resmi kaynaklardan gelen görseller genellikle "rss" ile kullanılabilir
- Telif hakları belirsiz veya stok fotoğraf görünümlü görseller için "ai_similar" tercih et
- Soyut konular veya görsel gerektirmeyen haberler için "ai_original" tercih et

Sadece "rss", "ai_original" veya "ai_similar" olarak yanıt ver.`

    const response = await getGenAI().models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 32,
      },
    })
    
    const text = response.text?.toLowerCase().trim() || ''
    
    if (text.includes('ai_original')) return 'ai_original'
    if (text.includes('ai_similar')) return 'ai_similar'
    if (text.includes('rss')) return 'rss'
    
    return 'rss' // Default to RSS if available
  } catch {
    return 'rss' // Fallback to RSS on error
  }
}

/**
 * Generate image prompt for AI generation
 */
function generateImagePrompt(topic: ScoredTopic, mode: 'original' | 'similar', rssImageDescription?: string): string {
  const basePrompt = `Professional news photograph for a Turkish news article. Topic: ${topic.title}. Category: ${topic.category}.`
  
  if (mode === 'similar' && rssImageDescription) {
    return `${basePrompt} Style similar to: ${rssImageDescription}. High quality, photorealistic, news media style.`
  }
  
  return `${basePrompt} High quality, photorealistic, professional journalism style. Suitable for a major news website.`
}

/**
 * Main function: Handle image for article
 */
export async function handleImage(
  topic: ScoredTopic,
  slug: string,
  logs: EngineLogEntry[] = []
): Promise<ImageGenerationResult> {
  const startTime = Date.now()
  let mode = topic.imageMode
  
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `Starting image handling for: ${topic.title}`,
    data: { mode, hasRssImage: !!topic.sourceImageUrl },
  })
  
  // Determine mode if auto
  if (mode === 'auto') {
    mode = await determineImageMode(topic, !!topic.sourceImageUrl)
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Auto mode determined: ${mode}`,
    })
  }
  
  try {
    // Mode: RSS - Use original image
    if (mode === 'rss' && topic.sourceImageUrl) {
      const result = await downloadAndOptimize(topic.sourceImageUrl, slug)
      
      if (result) {
        logs.push({
          timestamp: new Date(),
          level: 'info',
          message: `RSS image downloaded and optimized`,
          data: { originalSize: result.originalSize, optimizedSize: result.optimizedSize },
        })
        
        return {
          success: true,
          imageUrl: result.path,
          imageSource: 'rss',
          mode: 'rss',
          originalSize: result.originalSize,
          optimizedSize: result.optimizedSize,
          width: result.width,
          height: result.height,
          generationDuration: Date.now() - startTime,
        }
      }
      
      // Fallback to AI if RSS download fails
      logs.push({
        timestamp: new Date(),
        level: 'warn',
        message: `RSS image download failed, falling back to AI generation`,
      })
      mode = 'ai_original'
    }
    
    // Mode: AI Original or AI Similar
    const prompt = generateImagePrompt(
      topic,
      mode === 'ai_similar' ? 'similar' : 'original',
      mode === 'ai_similar' ? topic.sourceImageUrl : undefined
    )
    
    // Try Imagen first
    let result = await generateWithImagen(prompt, slug)
    
    // Fallback to Nano Banana if Imagen fails
    if (!result) {
      logs.push({
        timestamp: new Date(),
        level: 'warn',
        message: `Imagen generation failed, trying Nano Banana`,
      })
      result = await generateWithNanoBanana(prompt, slug)
    }
    
    if (result) {
      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `AI image generated successfully`,
        data: { size: result.size, width: result.width, height: result.height },
      })
      
      return {
        success: true,
        imageUrl: result.path,
        imageSource: 'ai',
        mode: mode as ImageMode,
        optimizedSize: result.size,
        width: result.width,
        height: result.height,
        generationDuration: Date.now() - startTime,
      }
    }
    
    throw new Error('All image generation methods failed')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    logs.push({
      timestamp: new Date(),
      level: 'error',
      message: `Image handling failed: ${errorMessage}`,
    })
    
    // Return placeholder
    return {
      success: false,
      imageUrl: PLACEHOLDER_IMAGE,
      imageSource: 'placeholder',
      mode: mode as ImageMode,
      error: errorMessage,
      generationDuration: Date.now() - startTime,
    }
  }
}

/**
 * Generate additional content images
 */
export async function generateContentImages(
  topic: ScoredTopic,
  slug: string,
  count: number = 1,
  logs: EngineLogEntry[] = []
): Promise<string[]> {
  const images: string[] = []
  
  for (let i = 0; i < count; i++) {
    const prompt = `Supplementary image for news article about: ${topic.title}. Image ${i + 1} of ${count}. Professional, informative, suitable for inline content.`
    
    try {
      const result = await generateWithImagen(prompt, `${slug}-content-${i}`)
      if (result) {
        images.push(result.path)
      }
    } catch (error) {
      logs.push({
        timestamp: new Date(),
        level: 'warn',
        message: `Failed to generate content image ${i + 1}`,
        data: { error: String(error) },
      })
    }
    
    // Delay between generations
    if (i < count - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  
  return images
}

/**
 * Check if image handler is properly configured
 */
export function isImageHandlerConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}
