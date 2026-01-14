import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'
import { prisma } from '@/lib/prisma'

/**
 * Image Optimizer Service
 * Handles image downloading, optimization, and format conversion
 * 
 * @version 2.0.0
 * @lastUpdated 14 January 2026
 * 
 * Changes in v2.0.0:
 * - Improved error handling and logging
 * - Added retry mechanism for downloads
 * - Added image validation
 * - Fixed directory creation issues
 * - Added support for various image sources
 * - Improved User-Agent handling for better compatibility
 */

/**
 * Image optimization settings interface
 */
export interface ImageOptimizationSettings {
  maxWidth: number
  maxHeight: number
  quality: number
  format: 'webp' | 'avif' | 'jpeg' | 'png'
  stripMetadata: boolean
}

/**
 * Default optimization settings
 */
export const DEFAULT_IMAGE_SETTINGS: ImageOptimizationSettings = {
  maxWidth: 1200,
  maxHeight: 630,
  quality: 80,
  format: 'webp',
  stripMetadata: true,
}

/**
 * Image optimization result interface
 */
export interface ImageOptimizationResult {
  success: boolean
  localPath: string | null
  publicUrl: string | null
  originalSize: number
  optimizedSize: number
  format: string
  width: number
  height: number
  error?: string
}

// Maximum retry attempts for downloads
const MAX_DOWNLOAD_RETRIES = 3

// Delay between retries (in ms)
const RETRY_DELAY = 1000

// Download timeout (in ms)
const DOWNLOAD_TIMEOUT = 30000

// Minimum valid image size (in bytes)
const MIN_IMAGE_SIZE = 1000

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get image optimization settings from database
 */
export async function getImageSettings(): Promise<ImageOptimizationSettings> {
  try {
    const settings = await prisma.imageSettings.findMany()
    const settingsMap = new Map(settings.map(s => [s.key, s.value]))

    return {
      maxWidth: parseInt(settingsMap.get('max_width') || String(DEFAULT_IMAGE_SETTINGS.maxWidth), 10),
      maxHeight: parseInt(settingsMap.get('max_height') || String(DEFAULT_IMAGE_SETTINGS.maxHeight), 10),
      quality: parseInt(settingsMap.get('quality') || String(DEFAULT_IMAGE_SETTINGS.quality), 10),
      format: (settingsMap.get('format') as ImageOptimizationSettings['format']) || DEFAULT_IMAGE_SETTINGS.format,
      stripMetadata: settingsMap.get('strip_metadata') !== 'false',
    }
  } catch (error) {
    console.warn('[ImageOptimizer] Failed to get settings from database, using defaults:', error)
    return DEFAULT_IMAGE_SETTINGS
  }
}

/**
 * Save image optimization settings to database
 */
export async function saveImageSettings(settings: Partial<ImageOptimizationSettings>) {
  const settingsToSave = [
    { key: 'max_width', value: String(settings.maxWidth) },
    { key: 'max_height', value: String(settings.maxHeight) },
    { key: 'quality', value: String(settings.quality) },
    { key: 'format', value: settings.format },
    { key: 'strip_metadata', value: String(settings.stripMetadata) },
  ].filter(s => s.value !== undefined)

  for (const setting of settingsToSave) {
    await prisma.imageSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value! },
      create: { key: setting.key, value: setting.value! },
    })
  }
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Download an image from a URL with retry support
 */
export async function downloadImage(url: string): Promise<Buffer | null> {
  if (!isValidUrl(url)) {
    console.error(`[ImageOptimizer] Invalid URL: ${url}`)
    return null
  }

  let lastError: string = ''

  for (let attempt = 1; attempt <= MAX_DOWNLOAD_RETRIES; attempt++) {
    try {
      console.log(`[ImageOptimizer] Download attempt ${attempt}/${MAX_DOWNLOAD_RETRIES}: ${url}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
          'Cache-Control': 'no-cache',
          'Referer': new URL(url).origin,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        lastError = `HTTP ${response.status}: ${response.statusText}`
        console.error(`[ImageOptimizer] Download failed: ${lastError}`)
        
        // Don't retry on 4xx errors (except 429)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          return null
        }
        
        if (attempt < MAX_DOWNLOAD_RETRIES) {
          await sleep(RETRY_DELAY * attempt)
          continue
        }
        return null
      }

      const contentType = response.headers.get('content-type')
      
      // More lenient content type checking
      if (contentType && !contentType.includes('image') && !contentType.includes('octet-stream')) {
        console.warn(`[ImageOptimizer] Unexpected content type: ${contentType}, attempting to process anyway`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Validate buffer size
      if (buffer.length < MIN_IMAGE_SIZE) {
        lastError = `Image too small (${buffer.length} bytes)`
        console.error(`[ImageOptimizer] ${lastError}`)
        
        if (attempt < MAX_DOWNLOAD_RETRIES) {
          await sleep(RETRY_DELAY * attempt)
          continue
        }
        return null
      }

      console.log(`[ImageOptimizer] Downloaded successfully: ${buffer.length} bytes`)
      return buffer
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[ImageOptimizer] Download attempt ${attempt} error:`, lastError)
      
      if (attempt < MAX_DOWNLOAD_RETRIES) {
        await sleep(RETRY_DELAY * attempt)
      }
    }
  }

  console.error(`[ImageOptimizer] All download attempts failed: ${lastError}`)
  return null
}

/**
 * Validate image buffer using sharp
 */
async function validateImageBuffer(buffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(buffer).metadata()
    return !!(metadata.width && metadata.height && metadata.format)
  } catch {
    return false
  }
}

/**
 * Optimize an image buffer
 */
export async function optimizeImage(
  imageBuffer: Buffer,
  settings?: Partial<ImageOptimizationSettings>
): Promise<{ buffer: Buffer; info: sharp.OutputInfo } | null> {
  try {
    // Validate input buffer
    if (!await validateImageBuffer(imageBuffer)) {
      console.error('[ImageOptimizer] Invalid image buffer')
      return null
    }

    const opts = { ...DEFAULT_IMAGE_SETTINGS, ...settings }
    
    let pipeline = sharp(imageBuffer)
      .resize(opts.maxWidth, opts.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })

    // Remove metadata if requested
    if (opts.stripMetadata) {
      pipeline = pipeline.rotate() // Auto-rotate based on EXIF then strip
    }

    // Convert to target format
    switch (opts.format) {
      case 'webp':
        pipeline = pipeline.webp({ quality: opts.quality, effort: 4 })
        break
      case 'avif':
        pipeline = pipeline.avif({ quality: opts.quality, effort: 4 })
        break
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true })
        break
      case 'png':
        pipeline = pipeline.png({ quality: opts.quality, compressionLevel: 9 })
        break
    }

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })
    
    console.log(`[ImageOptimizer] Optimized: ${imageBuffer.length} -> ${data.length} bytes (${info.width}x${info.height})`)
    
    return { buffer: data, info }
  } catch (error) {
    console.error('[ImageOptimizer] Optimization error:', error)
    return null
  }
}

/**
 * Generate a unique filename for an image
 */
function generateImageFilename(title: string, format: string): string {
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
  return `${slug}-${timestamp}.${format}`
}

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    console.log(`[ImageOptimizer] Creating directory: ${dirPath}`)
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Save an optimized image to the public folder
 */
export async function saveOptimizedImage(
  buffer: Buffer,
  title: string,
  format: string,
  subDir: string = 'optimized'
): Promise<string> {
  const filename = generateImageFilename(title, format)
  const imagesDir = path.join(process.cwd(), 'public', 'images', subDir)
  
  // Ensure directory exists
  ensureDirectoryExists(imagesDir)

  const filePath = path.join(imagesDir, filename)
  
  try {
    fs.writeFileSync(filePath, buffer)
    
    // Verify file was written
    const stats = fs.statSync(filePath)
    if (stats.size === 0) {
      throw new Error('Written file is empty')
    }
    
    console.log(`[ImageOptimizer] Saved: ${filePath} (${stats.size} bytes)`)
  } catch (error) {
    console.error(`[ImageOptimizer] Failed to save image: ${error}`)
    throw error
  }

  return `/images/${subDir}/${filename}`
}

/**
 * Download and optimize an image from URL
 * Main entry point for RSS image processing
 */
export async function downloadAndOptimizeImage(
  url: string,
  title: string,
  customSettings?: Partial<ImageOptimizationSettings>
): Promise<ImageOptimizationResult> {
  const startTime = Date.now()
  
  try {
    console.log(`[ImageOptimizer] Processing image for: ${title}`)
    console.log(`[ImageOptimizer] Source URL: ${url}`)
    
    // Get settings from database or use defaults
    const dbSettings = await getImageSettings()
    const settings = { ...dbSettings, ...customSettings }

    // Download the image
    const originalBuffer = await downloadImage(url)
    if (!originalBuffer) {
      return {
        success: false,
        localPath: null,
        publicUrl: null,
        originalSize: 0,
        optimizedSize: 0,
        format: settings.format,
        width: 0,
        height: 0,
        error: 'Failed to download image',
      }
    }

    const originalSize = originalBuffer.length

    // Optimize the image
    const optimized = await optimizeImage(originalBuffer, settings)
    if (!optimized) {
      return {
        success: false,
        localPath: null,
        publicUrl: null,
        originalSize,
        optimizedSize: 0,
        format: settings.format,
        width: 0,
        height: 0,
        error: 'Failed to optimize image',
      }
    }

    // Save the optimized image
    const publicUrl = await saveOptimizedImage(
      optimized.buffer,
      title,
      settings.format,
      'rss'
    )

    const localPath = path.join(process.cwd(), 'public', publicUrl)
    const duration = Date.now() - startTime

    console.log(`[ImageOptimizer] Complete: ${originalSize} -> ${optimized.buffer.length} bytes (${Math.round((1 - optimized.buffer.length / originalSize) * 100)}% reduction) in ${duration}ms`)

    return {
      success: true,
      localPath,
      publicUrl,
      originalSize,
      optimizedSize: optimized.buffer.length,
      format: settings.format,
      width: optimized.info.width,
      height: optimized.info.height,
    }
  } catch (error) {
    console.error('[ImageOptimizer] Error:', error)
    return {
      success: false,
      localPath: null,
      publicUrl: null,
      originalSize: 0,
      optimizedSize: 0,
      format: 'webp',
      width: 0,
      height: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Determine if an article should use RSS image or AI-generated image
 * Based on category and content analysis
 * 
 * Categories that typically need real images:
 * - Spor: Match photos, athlete images
 * - Gündem: News photos, event coverage
 * - Dünya: International news photos
 * 
 * Categories where AI images work well:
 * - Teknoloji: Conceptual tech imagery
 * - Ekonomi: Abstract financial visuals
 * - Bilim: Scientific illustrations
 * - Sağlık: Medical/health imagery
 * - Kültür-Sanat: Artistic representations
 */
export function shouldUseRssImage(category: string, hasRssImage: boolean): boolean {
  // If no RSS image available, can't use it
  if (!hasRssImage) {
    return false
  }

  // Categories that typically need real images (news photos, sports, etc.)
  const realImageCategories = ['Spor', 'Gündem', 'Dünya']
  
  // For these categories, prefer real images from RSS
  if (realImageCategories.includes(category)) {
    console.log(`[ImageOptimizer] Category "${category}" prefers RSS images`)
    return true
  }

  // For other categories (Teknoloji, Ekonomi, etc.), prefer AI-generated images
  console.log(`[ImageOptimizer] Category "${category}" prefers AI-generated images`)
  return false
}

/**
 * Get image placement recommendation based on category
 */
export function getImagePlacement(category: string): 'header' | 'inline' | 'both' {
  // Categories where header image is most important
  const headerCategories = ['Teknoloji', 'Ekonomi', 'Bilim', 'Kültür-Sanat']
  
  // Categories where inline images work better
  const inlineCategories = ['Spor', 'Gündem']
  
  if (headerCategories.includes(category)) {
    return 'header'
  }
  
  if (inlineCategories.includes(category)) {
    return 'inline'
  }
  
  return 'header'
}

/**
 * Create a thumbnail from an image buffer
 */
export async function createThumbnail(
  imageBuffer: Buffer,
  width: number = 400,
  height: number = 225
): Promise<Buffer | null> {
  try {
    const thumbnail = await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'attention', // Smart crop focusing on interesting areas
      })
      .webp({ quality: 75 })
      .toBuffer()

    return thumbnail
  } catch (error) {
    console.error('[ImageOptimizer] Thumbnail creation error:', error)
    return null
  }
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imageBuffer: Buffer): Promise<sharp.Metadata | null> {
  try {
    return await sharp(imageBuffer).metadata()
  } catch (error) {
    console.error('[ImageOptimizer] Metadata error:', error)
    return null
  }
}

/**
 * Check if an image file exists and is valid
 */
export function imageFileExists(publicUrl: string): boolean {
  try {
    const filePath = path.join(process.cwd(), 'public', publicUrl)
    if (!fs.existsSync(filePath)) {
      return false
    }
    const stats = fs.statSync(filePath)
    return stats.size > MIN_IMAGE_SIZE
  } catch {
    return false
  }
}

/**
 * Clean up old generated images (utility function)
 */
export async function cleanupOldImages(
  directory: string,
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days default
): Promise<{ deleted: number; errors: number }> {
  const result = { deleted: 0, errors: 0 }
  
  try {
    const dirPath = path.join(process.cwd(), 'public', 'images', directory)
    
    if (!fs.existsSync(dirPath)) {
      return result
    }
    
    const files = fs.readdirSync(dirPath)
    const now = Date.now()
    
    for (const file of files) {
      if (file === '.gitkeep') continue
      
      try {
        const filePath = path.join(dirPath, file)
        const stats = fs.statSync(filePath)
        
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath)
          result.deleted++
        }
      } catch {
        result.errors++
      }
    }
  } catch (error) {
    console.error('[ImageOptimizer] Cleanup error:', error)
  }
  
  return result
}
