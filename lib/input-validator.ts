/**
 * Input Validation Service
 * Validates and sanitizes user input to prevent security issues
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return url.length <= 2048
  } catch {
    return false
  }
}

/**
 * Validate slug format (alphanumeric, hyphens, underscores)
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-_]+$/
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 200
}

/**
 * Validate article title
 */
export function validateTitle(title: string): boolean {
  return title.length > 0 && title.length <= 500
}

/**
 * Validate article content
 */
export function validateContent(content: string): boolean {
  return content.length > 0 && content.length <= 50000
}

/**
 * Validate category name
 */
export function validateCategory(category: string): boolean {
  return category.length > 0 && category.length <= 100
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove dangerous protocols
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/data:text\/html/gi, '')

  return sanitized
}

/**
 * Sanitize user input string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  // Trim whitespace
  let sanitized = input.trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

  return sanitized
}

/**
 * Validate and sanitize article input
 */
export function validateArticleInput(data: any) {
  const errors: ValidationError[] = []

  // Validate title
  if (!data.title || !validateTitle(data.title)) {
    errors.push(
      new ValidationError('title', 'Başlık 1-500 karakter olmalıdır', 'INVALID_TITLE')
    )
  }

  // Validate content
  if (!data.content || !validateContent(data.content)) {
    errors.push(
      new ValidationError('content', 'İçerik 1-50000 karakter olmalıdır', 'INVALID_CONTENT')
    )
  }

  // Validate category
  if (!data.category || !validateCategory(data.category)) {
    errors.push(
      new ValidationError('category', 'Kategori 1-100 karakter olmalıdır', 'INVALID_CATEGORY')
    )
  }

  // Validate slug if provided
  if (data.slug && !validateSlug(data.slug)) {
    errors.push(
      new ValidationError('slug', 'Slug geçersiz karakterler içeriyor', 'INVALID_SLUG')
    )
  }

  // Validate image URL if provided
  if (data.imageUrl && !validateUrl(data.imageUrl)) {
    errors.push(
      new ValidationError('imageUrl', 'Görsel URL geçersiz', 'INVALID_IMAGE_URL')
    )
  }

  if (errors.length > 0) {
    throw errors
  }

  // Sanitize strings
  return {
    title: sanitizeString(data.title, 500),
    content: sanitizeString(data.content, 50000),
    category: sanitizeString(data.category, 100),
    slug: data.slug ? sanitizeString(data.slug, 200) : undefined,
    imageUrl: data.imageUrl ? sanitizeString(data.imageUrl, 2048) : undefined,
    excerpt: data.excerpt ? sanitizeString(data.excerpt, 500) : undefined,
  }
}

/**
 * Validate and sanitize comment input
 */
export function validateCommentInput(data: any) {
  const errors: ValidationError[] = []

  // Validate content
  if (!data.content || data.content.trim().length === 0) {
    errors.push(
      new ValidationError('content', 'Yorum boş olamaz', 'EMPTY_COMMENT')
    )
  }

  if (data.content && data.content.length > 5000) {
    errors.push(
      new ValidationError('content', 'Yorum 5000 karakteri geçemez', 'COMMENT_TOO_LONG')
    )
  }

  if (errors.length > 0) {
    throw errors
  }

  return {
    content: sanitizeString(data.content, 5000),
  }
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query: string): string {
  if (!query || query.trim().length === 0) {
    throw new ValidationError('query', 'Arama sorgusu boş olamaz', 'EMPTY_QUERY')
  }

  if (query.length > 200) {
    throw new ValidationError('query', 'Arama sorgusu 200 karakteri geçemez', 'QUERY_TOO_LONG')
  }

  // Remove special characters that could be used for SQL injection or similar attacks
  const sanitized = query
    .replace(/[;'"\\]/g, '')
    .trim()

  return sanitized
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(page: any, limit: any) {
  const errors: ValidationError[] = []

  const pageNum = parseInt(page, 10)
  const limitNum = parseInt(limit, 10)

  if (isNaN(pageNum) || pageNum < 1) {
    errors.push(
      new ValidationError('page', 'Sayfa numarası 1 veya daha büyük olmalıdır', 'INVALID_PAGE')
    )
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    errors.push(
      new ValidationError('limit', 'Limit 1-100 arasında olmalıdır', 'INVALID_LIMIT')
    )
  }

  if (errors.length > 0) {
    throw errors
  }

  return {
    page: pageNum,
    limit: limitNum,
  }
}
