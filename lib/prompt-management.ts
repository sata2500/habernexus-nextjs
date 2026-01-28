/**
 * Prompt Management System
 * Manages and validates prompts for different AI operations
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

export type PromptType = 'content' | 'image' | 'summary'
export type PromptTier = 'basic' | 'standard' | 'advanced'

/**
 * Prompt template with variables and validation
 */
export interface PromptTemplate {
  id: string
  name: string
  type: PromptType
  tier: PromptTier
  template: string
  variables: string[]
  description: string
  examples?: string[]
  minLength?: number
  maxLength?: number
  tags?: string[]
  isDefault?: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Prompt context for rendering
 */
export interface PromptContext {
  [key: string]: string | number | boolean | string[]
}

/**
 * Default prompts for different operations
 */
export const DEFAULT_PROMPTS: Record<PromptType, PromptTemplate[]> = {
  content: [
    {
      id: 'content-news-article',
      name: 'Haber Makalesi',
      type: 'content',
      tier: 'standard',
      template: `Aşağıdaki konular hakkında Türkçe haber makalesi yaz:

Konular: {{topics}}
Kategori: {{category}}
Stil: {{style}}
Uzunluk: {{length}} kelime

Gereksinimler:
- Profesyonel ve tarafsız ton
- SEO optimized başlık
- Giriş, ana içerik, sonuç yapısı
- Güncel ve doğru bilgiler
- İlgili anahtar kelimeler

Makaleyi JSON formatında döndür:
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "content": "...",
  "keywords": ["..."]
}`,
      variables: ['topics', 'category', 'style', 'length'],
      description: 'Trend konulardan haber makalesi üretimi',
      examples: [
        'Yapay Zeka, Teknoloji, Haberci, 800',
        'Spor, Futbol, Haber, 600',
      ],
      minLength: 300,
      maxLength: 2000,
      tags: ['news', 'article', 'trending'],
      isDefault: true,
    },
    {
      id: 'content-analysis-article',
      name: 'Analiz Makalesi',
      type: 'content',
      tier: 'advanced',
      template: `Aşağıdaki konu hakkında derinlemesine analiz makalesi yaz:

Konu: {{topic}}
Açı: {{angle}}
Hedef Kitle: {{audience}}

Gereksinimler:
- Derinlemesine araştırma ve analiz
- Birden fazla perspektif
- Veri ve istatistikler
- Sonuç ve öneriler
- Akademik ton

Makaleyi JSON formatında döndür:
{
  "title": "...",
  "slug": "...",
  "excerpt": "...",
  "content": "...",
  "sources": ["..."],
  "keywords": ["..."]
}`,
      variables: ['topic', 'angle', 'audience'],
      description: 'Konuların derinlemesine analizi',
      tags: ['analysis', 'opinion', 'deep-dive'],
      minLength: 1000,
      maxLength: 3000,
    },
  ],

  image: [
    {
      id: 'image-news-illustration',
      name: 'Haber İllüstrasyonu',
      type: 'image',
      tier: 'standard',
      template: `Aşağıdaki haber konusu için profesyonel görsel oluştur:

Başlık: {{title}}
Konu: {{topic}}
Stil: {{style}}
Ton: {{tone}}

Gereksinimler:
- Profesyonel ve modern tasarım
- Yüksek kalite ve detay
- Tema renklerine uygun
- Metin ve grafik elemanlar
- Sosyal medya uyumlu

Görsel {{width}}x{{height}} piksel olmalı.`,
      variables: ['title', 'topic', 'style', 'tone', 'width', 'height'],
      description: 'Haberler için profesyonel görsel üretimi',
      examples: [
        'Yapay Zeka Devrim, Teknoloji, Modern, Profesyonel, 1200, 630',
        'Spor Haberi, Futbol, Dinamik, Enerji, 1200, 630',
      ],
      tags: ['illustration', 'news', 'social-media'],
      isDefault: true,
    },
    {
      id: 'image-featured-image',
      name: 'Öne Çıkan Görsel',
      type: 'image',
      tier: 'advanced',
      template: `Aşağıdaki makale için öne çıkan görsel oluştur:

Makale Başlığı: {{title}}
Makale Özeti: {{summary}}
Kategori: {{category}}
Ruh Hali: {{mood}}

Gereksinimler:
- Makaleyi en iyi şekilde temsil et
- Dikkat çekici ve benzersiz
- Yüksek çözünürlük
- Profesyonel tasarım
- Metin overlay uygun

Görsel {{width}}x{{height}} piksel olmalı.`,
      variables: ['title', 'summary', 'category', 'mood', 'width', 'height'],
      description: 'Makaleler için öne çıkan görseller',
      tags: ['featured', 'article', 'thumbnail'],
    },
  ],

  summary: [
    {
      id: 'summary-short',
      name: 'Kısa Özet',
      type: 'summary',
      tier: 'basic',
      template: `Aşağıdaki metni {{language}} dilinde {{length}} kelimelik kısa bir özete dönüştür:

Metin:
{{content}}

Gereksinimler:
- Temel noktaları vurgula
- Basit ve anlaşılır dil
- Başında ve sonunda özet işareti
- Anahtar kelimeleri koruya

Sadece özeti döndür, başka hiçbir şey ekleme.`,
      variables: ['content', 'language', 'length'],
      description: 'Hızlı ve kısa özet oluşturma',
      examples: ['Makale metni, Türkçe, 50'],
      minLength: 50,
      maxLength: 200,
      tags: ['summary', 'short', 'quick'],
      isDefault: true,
    },
    {
      id: 'summary-detailed',
      name: 'Detaylı Özet',
      type: 'summary',
      tier: 'standard',
      template: `Aşağıdaki metni {{language}} dilinde detaylı bir özete dönüştür:

Metin:
{{content}}

Gereksinimler:
- Ana noktaları ve detayları koru
- Yapılandırılmış format (başlık, alt başlıklar)
- Önemli istatistikleri ve rakamları koru
- Sonuç ve öneriler
- Profesyonel ton

Özeti JSON formatında döndür:
{
  "summary": "...",
  "keyPoints": ["..."],
  "statistics": ["..."],
  "conclusion": "..."
}`,
      variables: ['content', 'language'],
      description: 'Detaylı ve yapılandırılmış özet',
      tags: ['summary', 'detailed', 'structured'],
      minLength: 200,
      maxLength: 500,
    },
  ],
}

/**
 * Render prompt template with context
 */
export function renderPrompt(template: string, context: PromptContext): string {
  let rendered = template

  for (const [key, value] of Object.entries(context)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    const stringValue = Array.isArray(value) ? value.join(', ') : String(value)
    rendered = rendered.replace(regex, stringValue)
  }

  // Check for unreplaced variables
  const unreplaced = rendered.match(/{{[^}]+}}/g)
  if (unreplaced) {
    console.warn('[PromptManagement] Unreplaced variables:', unreplaced)
  }

  return rendered
}

/**
 * Validate prompt template
 */
export function validatePrompt(
  template: string,
  context: PromptContext
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for required variables
  const variables = template.match(/{{([^}]+)}}/g) || []
  const variableNames = variables.map(v => v.replace(/{{|}}/g, ''))

  for (const varName of variableNames) {
    if (!(varName in context)) {
      errors.push(`Missing required variable: {{${varName}}}`)
    }
  }

  // Check template length
  if (template.length < 10) {
    errors.push('Template is too short')
  }

  if (template.length > 10000) {
    errors.push('Template is too long')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get prompt template by ID
 */
export function getPromptTemplate(id: string): PromptTemplate | null {
  for (const prompts of Object.values(DEFAULT_PROMPTS)) {
    const found = prompts.find(p => p.id === id)
    if (found) return found
  }
  return null
}

/**
 * Get all prompts of a specific type
 */
export function getPromptsByType(type: PromptType): PromptTemplate[] {
  return DEFAULT_PROMPTS[type] || []
}

/**
 * Get default prompt for a type
 */
export function getDefaultPrompt(type: PromptType): PromptTemplate | null {
  const prompts = getPromptsByType(type)
  return prompts.find(p => p.isDefault) || prompts[0] || null
}

/**
 * Get prompts by tier
 */
export function getPromptsByTier(type: PromptType, tier: PromptTier): PromptTemplate[] {
  return getPromptsByType(type).filter(p => p.tier === tier)
}

/**
 * Search prompts
 */
export function searchPrompts(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase()
  const results: PromptTemplate[] = []

  for (const prompts of Object.values(DEFAULT_PROMPTS)) {
    for (const prompt of prompts) {
      if (
        prompt.name.toLowerCase().includes(lowerQuery) ||
        prompt.description.toLowerCase().includes(lowerQuery) ||
        prompt.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push(prompt)
      }
    }
  }

  return results
}

/**
 * Get prompt statistics
 */
export function getPromptStats() {
  let total = 0
  const byType: Record<PromptType, number> = {
    content: 0,
    image: 0,
    summary: 0,
  }
  const byTier: Record<PromptTier, number> = {
    basic: 0,
    standard: 0,
    advanced: 0,
  }

  for (const [type, prompts] of Object.entries(DEFAULT_PROMPTS)) {
    byType[type as PromptType] = prompts.length
    total += prompts.length

    for (const prompt of prompts) {
      byTier[prompt.tier]++
    }
  }

  return {
    total,
    byType,
    byTier,
  }
}

/**
 * Export prompts as JSON
 */
export function exportPrompts(): string {
  return JSON.stringify(DEFAULT_PROMPTS, null, 2)
}

/**
 * Import prompts from JSON
 */
export function importPrompts(json: string): { success: boolean; error?: string } {
  try {
    const imported = JSON.parse(json)
    // Validate structure
    if (typeof imported !== 'object') {
      return { success: false, error: 'Invalid JSON structure' }
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
