/**
 * Image Validation System
 * Ensures articles are only published with valid images
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

import type { ImageGenerationResult } from './types'

/**
 * Placeholder image paths that should not be used for publishing
 */
const PLACEHOLDER_IMAGES = [
  '/images/placeholder-news.webp',
  '/images/placeholder.webp',
  '/placeholder-news.webp',
  '/placeholder.webp',
]

/**
 * Check if an image URL is a placeholder
 */
export function isPlaceholderImage(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return true
  
  return PLACEHOLDER_IMAGES.some(placeholder => 
    imageUrl.includes(placeholder) || imageUrl === placeholder
  )
}

/**
 * Check if image generation result is valid for publishing
 */
export function isValidImageForPublishing(result: ImageGenerationResult): boolean {
  // Image generation must be successful
  if (!result.success) {
    return false
  }
  
  // Image URL must not be null or empty
  if (!result.imageUrl) {
    return false
  }
  
  // Image must not be a placeholder
  if (isPlaceholderImage(result.imageUrl)) {
    return false
  }
  
  // Image source must not be placeholder
  if (result.imageSource === 'placeholder') {
    return false
  }
  
  return true
}

/**
 * Validate image before publishing article
 */
export function validateImageBeforePublishing(
  imageUrl: string | null | undefined,
  imageSource: string | null | undefined
): { valid: boolean; error?: string } {
  // Check if image URL exists
  if (!imageUrl) {
    return {
      valid: false,
      error: 'Makale görseli bulunamadı. Lütfen görsel oluşturmayı yeniden deneyin.',
    }
  }
  
  // Check if image is placeholder
  if (isPlaceholderImage(imageUrl)) {
    return {
      valid: false,
      error: 'Makale placeholder görsel ile yayına alınamaz. Lütfen gerçek bir görsel oluşturun.',
    }
  }
  
  // Check image source
  if (imageSource === 'placeholder' || !imageSource) {
    return {
      valid: false,
      error: 'Makale görsel kaynağı geçersiz. Lütfen görsel ayarlarını kontrol edin.',
    }
  }
  
  return { valid: true }
}

/**
 * Get image validation error message
 */
export function getImageValidationErrorMessage(result: ImageGenerationResult): string {
  if (!result.success) {
    return `Görsel oluşturma başarısız: ${result.error || 'Bilinmeyen hata'}`
  }
  
  if (!result.imageUrl) {
    return 'Görsel URL\'i boş'
  }
  
  if (isPlaceholderImage(result.imageUrl)) {
    return 'Placeholder görsel yayına alınamaz'
  }
  
  if (result.imageSource === 'placeholder') {
    return 'Görsel kaynağı placeholder olarak işaretlenmiş'
  }
  
  return 'Görsel doğrulama başarısız'
}

/**
 * Strict image validation for publishing
 * Throws error if image is not valid
 */
export function strictImageValidation(
  imageUrl: string | null | undefined,
  imageSource: string | null | undefined,
  articleTitle: string
): void {
  const validation = validateImageBeforePublishing(imageUrl, imageSource)
  
  if (!validation.valid) {
    throw new Error(
      `Makale yayına alınamadı: "${articleTitle}" - ${validation.error}`
    )
  }
}

/**
 * Log image validation failures
 */
export function logImageValidationFailure(
  articleTitle: string,
  imageUrl: string | null | undefined,
  imageSource: string | null | undefined,
  reason: string
): void {
  console.warn(
    `[ImageValidation] Article cannot be published - Title: "${articleTitle}", ImageURL: "${imageUrl}", Source: "${imageSource}", Reason: "${reason}"`
  )
}
