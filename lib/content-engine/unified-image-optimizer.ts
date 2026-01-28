/**
 * Unified Image Optimizer System
 * Integrates image-optimizer.ts and image-handler.ts
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import type { ImageMode } from './types'

/**
 * Image optimization settings
 */
export interface UnifiedImageOptimizationSettings {
  maxWidth: number
  maxHeight: number
  quality: number
  format: 'webp' | 'avif' | 'jpeg' | 'png'
  stripMetadata: boolean
  enableCaching: boolean
  cacheMaxAge: number // in seconds
}

/**
 * Default optimization settings
 */
export const DEFAULT_OPTIMIZATION_SETTINGS: UnifiedImageOptimizationSettings = {
  maxWidth: 1200,
  maxHeight: 630,
  quality: 85,
  format: 'webp',
  stripMetadata: true,
  enableCaching: true,
  cacheMaxAge: 86400 * 30, // 30 days
}

/**
 * Image optimization result
 */
export interface UnifiedImageOptimizationResult {
  success: boolean
  path: string | null
  url: string | null
  originalSize: number
  optimizedSize: number
  width: number
  height: number
  format: string
  compressionRatio: number
  error?: string
  cached?: boolean
}

/**
 * Download image with retry logic
 */
export async function downloadImageWithRetry(
  url: string,
  maxRetries: number = 3,
  timeout: number = 30000
): Promise<Buffer | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[UnifiedImageOptimizer] Download attempt ${attempt}/${maxRetries}: ${url}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HaberNexus/1.0)',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const buffer = Buffer.from(await response.arrayBuffer())
      
      if (buffer.length < 1000) {
        throw new Error('Image too small')
      }
      
      return buffer
    } catch (error) {
      console.warn(
        `[UnifiedImageOptimizer] Download attempt ${attempt} failed: ${error}`
      )
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  return null
}

/**
 * Optimize image buffer
 */
export async function optimizeImageBuffer(
  buffer: Buffer,
  settings: Partial<UnifiedImageOptimizationSettings> = {}
): Promise<{ buffer: Buffer; metadata: { width: number; height: number } } | null> {
  try {
    const config = { ...DEFAULT_OPTIMIZATION_SETTINGS, ...settings }
    
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image metadata')
    }
    
    // Resize if needed
    let processedImage = image
    if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
      processedImage = image.resize(config.maxWidth, config.maxHeight, {
        withoutEnlargement: true,
        fit: 'inside',
      })
    }
    
    // Strip metadata if needed
    if (config.stripMetadata) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      processedImage = (processedImage as any).withMetadata(false)
    }
    
    // Convert to target format
    let optimizedBuffer: Buffer
    
    switch (config.format) {
      case 'webp':
        optimizedBuffer = await processedImage.webp({ quality: config.quality }).toBuffer()
        break
      case 'avif':
        optimizedBuffer = await processedImage.avif({ quality: config.quality }).toBuffer()
        break
      case 'jpeg':
        optimizedBuffer = await processedImage.jpeg({ quality: config.quality }).toBuffer()
        break
      case 'png':
        optimizedBuffer = await processedImage.png().toBuffer()
        break
      default:
        optimizedBuffer = await processedImage.webp({ quality: config.quality }).toBuffer()
    }
    
    // Get final metadata
    const finalMetadata = await sharp(optimizedBuffer).metadata()
    
    return {
      buffer: optimizedBuffer,
      metadata: {
        width: finalMetadata.width || 0,
        height: finalMetadata.height || 0,
      },
    }
  } catch (error) {
    console.error('[UnifiedImageOptimizer] Optimization error:', error)
    return null
  }
}

/**
 * Save optimized image to disk
 */
export async function saveOptimizedImage(
  buffer: Buffer,
  slug: string,
  outputDir: string = path.join(process.cwd(), 'public', 'images', 'generated')
): Promise<{ path: string; url: string } | null> {
  try {
    // Ensure directory exists
    await fs.mkdir(outputDir, { recursive: true })
    
    // Generate filename
    const filename = `${slug}-${Date.now()}.webp`
    const filePath = path.join(outputDir, filename)
    
    // Save file
    await fs.writeFile(filePath, buffer)
    
    return {
      path: filePath,
      url: `/images/generated/${filename}`,
    }
  } catch (error) {
    console.error('[UnifiedImageOptimizer] Save error:', error)
    return null
  }
}

/**
 * Full image optimization pipeline
 */
export async function optimizeImageFull(
  imageUrl: string,
  slug: string,
  settings: Partial<UnifiedImageOptimizationSettings> = {}
): Promise<UnifiedImageOptimizationResult> {
  try {
    // Step 1: Download
    const buffer = await downloadImageWithRetry(imageUrl)
    if (!buffer) {
      return {
        success: false,
        path: null,
        url: null,
        originalSize: 0,
        optimizedSize: 0,
        width: 0,
        height: 0,
        format: 'unknown',
        compressionRatio: 0,
        error: 'Failed to download image',
      }
    }
    
    // Step 2: Optimize
    const optimized = await optimizeImageBuffer(buffer, settings)
    if (!optimized) {
      return {
        success: false,
        path: null,
        url: null,
        originalSize: buffer.length,
        optimizedSize: 0,
        width: 0,
        height: 0,
        format: 'unknown',
        compressionRatio: 0,
        error: 'Failed to optimize image',
      }
    }
    
    // Step 3: Save
    const saved = await saveOptimizedImage(optimized.buffer, slug)
    if (!saved) {
      return {
        success: false,
        path: null,
        url: null,
        originalSize: buffer.length,
        optimizedSize: optimized.buffer.length,
        width: optimized.metadata.width,
        height: optimized.metadata.height,
        format: 'webp',
        compressionRatio: (optimized.buffer.length / buffer.length) * 100,
        error: 'Failed to save image',
      }
    }
    
    return {
      success: true,
      path: saved.path,
      url: saved.url,
      originalSize: buffer.length,
      optimizedSize: optimized.buffer.length,
      width: optimized.metadata.width,
      height: optimized.metadata.height,
      format: 'webp',
      compressionRatio: (optimized.buffer.length / buffer.length) * 100,
    }
  } catch (error) {
    return {
      success: false,
      path: null,
      url: null,
      originalSize: 0,
      optimizedSize: 0,
      width: 0,
      height: 0,
      format: 'unknown',
      compressionRatio: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Get image format from URL
 */
export function getImageFormatFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const ext = path.extname(pathname).toLowerCase().slice(1)
    return ext || 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Log image optimization
 */
export function logImageOptimization(
  slug: string,
  result: UnifiedImageOptimizationResult,
  mode: ImageMode
): void {
  if (result.success) {
    console.log(
      `[UnifiedImageOptimizer] Success - Slug: ${slug}, Mode: ${mode}, ` +
      `Original: ${result.originalSize}B, Optimized: ${result.optimizedSize}B, ` +
      `Ratio: ${result.compressionRatio.toFixed(1)}%, Size: ${result.width}x${result.height}`
    )
  } else {
    console.error(
      `[UnifiedImageOptimizer] Failed - Slug: ${slug}, Mode: ${mode}, Error: ${result.error}`
    )
  }
}
