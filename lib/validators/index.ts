/**
 * Input Validation Utilities
 * 
 * Form ve API girdilerini doğrulamak için kullanılan fonksiyonlar.
 * 
 * @version 1.0.0
 * @lastUpdated 21 Ocak 2026
 */

/**
 * Email doğrulaması
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * URL doğrulaması
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Slug doğrulaması
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

/**
 * Başlık doğrulaması
 */
export function isValidTitle(title: string): boolean {
  return title.trim().length >= 3 && title.trim().length <= 200
}

/**
 * İçerik doğrulaması
 */
export function isValidContent(content: string): boolean {
  return content.trim().length >= 10 && content.trim().length <= 50000
}

/**
 * Kategori doğrulaması
 */
export function isValidCategory(category: string): boolean {
  const validCategories = [
    'teknoloji',
    'spor',
    'siyaset',
    'ekonomi',
    'sağlık',
    'eğitim',
    'kültür',
    'diğer',
  ]
  return validCategories.includes(category.toLowerCase())
}

/**
 * Makale verisi doğrulaması
 */
export interface ArticleValidationData {
  title: string
  content: string
  category: string
  excerpt?: string
  imageUrl?: string
}

export function validateArticleData(data: ArticleValidationData): {
  valid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!isValidTitle(data.title)) {
    errors.title = 'Başlık 3-200 karakter arasında olmalıdır'
  }

  if (!isValidContent(data.content)) {
    errors.content = 'İçerik 10-50000 karakter arasında olmalıdır'
  }

  if (!isValidCategory(data.category)) {
    errors.category = 'Geçersiz kategori'
  }

  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    errors.imageUrl = 'Geçersiz resim URL'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Sanitize HTML
 * 
 * XSS saldırılarını önlemek için HTML'i temizle
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

/**
 * Sanitize URL
 * 
 * Tehlikeli URL'leri filtrele
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return url
  } catch {
    return null
  }
}

/**
 * Sanitize input
 * 
 * Kullanıcı girdisini temizle
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000)
}
