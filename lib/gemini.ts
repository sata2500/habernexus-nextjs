import { GoogleGenAI } from '@google/genai'

/**
 * Google Gemini AI Service
 * Handles AI content generation for news articles
 */

// Initialize the Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

// Default model for content generation
const MODEL_NAME = 'gemini-2.0-flash'

/**
 * Generate a news article from RSS content
 */
export async function generateArticle(
  sourceTitle: string,
  sourceContent: string,
  category: string
): Promise<{
  title: string
  content: string
  excerpt: string
  slug: string
}> {
  const prompt = `Sen profesyonel bir haber editörüsün. Aşağıdaki haber kaynağını kullanarak özgün, SEO dostu ve okuyucu için değerli bir Türkçe haber makalesi oluştur.

KAYNAK BAŞLIK: ${sourceTitle}

KAYNAK İÇERİK: ${sourceContent}

KATEGORİ: ${category}

GÖREV:
1. Özgün ve dikkat çekici bir başlık yaz (maksimum 80 karakter)
2. Makale içeriğini yaz (minimum 300 kelime, maksimum 800 kelime)
3. Kısa bir özet yaz (maksimum 160 karakter, SEO meta description için)
4. URL-friendly bir slug oluştur (Türkçe karakterler olmadan, tire ile ayrılmış)

KURALLAR:
- İçerik %100 özgün olmalı, kaynak metni birebir kopyalama
- Tarafsız ve profesyonel bir dil kullan
- Gerçeklere dayalı bilgi ver, spekülasyon yapma
- Okuyucuya değer katan, bilgilendirici bir içerik oluştur

ÇIKTI FORMATI (JSON):
{
  "title": "Başlık burada",
  "content": "Makale içeriği burada (paragraflar \\n\\n ile ayrılmış)",
  "excerpt": "Kısa özet burada",
  "slug": "url-friendly-slug-burada"
}`

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })

    const text = response.text || ''
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini')
    }

    const result = JSON.parse(jsonMatch[0])
    
    return {
      title: result.title || sourceTitle,
      content: result.content || sourceContent,
      excerpt: result.excerpt || sourceTitle.substring(0, 160),
      slug: result.slug || generateSlug(sourceTitle),
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    // Return fallback values
    return {
      title: sourceTitle,
      content: sourceContent,
      excerpt: sourceTitle.substring(0, 160),
      slug: generateSlug(sourceTitle),
    }
  }
}

/**
 * Generate article summary
 */
export async function generateSummary(content: string): Promise<string> {
  const prompt = `Aşağıdaki haber makalesinin kısa bir özetini yaz (maksimum 2-3 cümle, 160 karakter):

${content}

Sadece özeti yaz, başka bir şey ekleme.`

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 256,
      },
    })

    return response.text?.trim() || content.substring(0, 160)
  } catch (error) {
    console.error('Gemini summary error:', error)
    return content.substring(0, 160)
  }
}

/**
 * Determine article category using AI
 */
export async function determineCategory(
  title: string,
  content: string
): Promise<string> {
  const categories = [
    'Gündem',
    'Ekonomi',
    'Teknoloji',
    'Spor',
    'Sağlık',
    'Kültür-Sanat',
    'Dünya',
    'Bilim',
  ]

  const prompt = `Aşağıdaki haber başlığı ve içeriğine göre en uygun kategoriyi seç.

BAŞLIK: ${title}

İÇERİK: ${content.substring(0, 500)}

KATEGORİLER: ${categories.join(', ')}

Sadece kategori adını yaz, başka bir şey ekleme.`

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 32,
      },
    })

    const category = response.text?.trim() || 'Gündem'
    return categories.includes(category) ? category : 'Gündem'
  } catch (error) {
    console.error('Gemini category error:', error)
    return 'Gündem'
  }
}

/**
 * Generate SEO-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
    .replace(/-$/, '')
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}
