import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'
import { prisma } from '@/lib/prisma'

/**
 * Image Optimizer Service
 * Handles image downloading, optimization, and format conversion
 * 
 * @version 1.0.0
 * @lastUpdated 13 January 2026
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
  } catch {
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
 * Download an image from a URL
 */
export async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    console.log(`[ImageOptimizer] Downloading image from: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HaberNexus/1.0 (Image Downloader)',
        'Accept': 'image/*',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      console.error(`[ImageOptimizer] Failed to download image: ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      console.error(`[ImageOptimizer] Invalid content type: ${contentType}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error('[ImageOptimizer] Download error:', error)
    return null
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
    .substring(0, 50)
    .replace(/-$/, '')

  const timestamp = Date.now()
  return `${slug}-${timestamp}.${format}`
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
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true })
  }

  const filePath = path.join(imagesDir, filename)
  fs.writeFileSync(filePath, buffer)

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
  try {
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

    console.log(`[ImageOptimizer] Image optimized: ${originalSize} -> ${optimized.buffer.length} bytes (${Math.round((1 - optimized.buffer.length / originalSize) * 100)}% reduction)`)

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
 */
export function shouldUseRssImage(category: string, hasRssImage: boolean): boolean {
  // Categories that typically need real images (news photos, sports, etc.)
  const realImageCategories = ['Spor', 'Gündem', 'Dünya']
  
  if (!hasRssImage) {
    return false
  }

  // For these categories, prefer real images from RSS
  if (realImageCategories.includes(category)) {
    return true
  }

  // For other categories (Teknoloji, Ekonomi, etc.), prefer AI-generated images
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
