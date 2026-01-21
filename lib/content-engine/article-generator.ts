/**
 * Content Engine v3.0 - Article Generator
 * 
 * @version 3.0.0
 * @lastUpdated 20 January 2026
 * 
 * This module generates professional news articles using AI with
 * Google Search grounding for deep research and accurate information.
 */

import { GoogleGenAI } from '@google/genai'
import type {
  ScoredTopic,
  GeneratedContent,
  ArticleGenerationResult,
  ResearchSource,
  EngineLogEntry,
} from './types'

// Initialize Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  // Turkish character mapping
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  }
  
  let slug = title.toLowerCase()
  
  // Replace Turkish characters
  for (const [tr, en] of Object.entries(turkishMap)) {
    slug = slug.replace(new RegExp(tr, 'g'), en)
  }
  
  // Remove special characters and replace spaces with hyphens
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
    .replace(/^-|-$/g, '')
  
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString(36)
  return `${slug}-${timestamp}`
}

/**
 * Extract research sources from grounding metadata
 */
function extractSources(response: { candidates?: Array<{ groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> } }> }): ResearchSource[] {
  const sources: ResearchSource[] = []
  
  const groundingMetadata = response.candidates?.[0]?.groundingMetadata
  if (groundingMetadata?.groundingChunks) {
    for (const chunk of groundingMetadata.groundingChunks) {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Kaynak',
          url: chunk.web.uri || '',
        })
      }
    }
  }
  
  return sources
}

/**
 * Generate article content using AI with Google Search grounding
 */
export async function generateArticle(
  topic: ScoredTopic,
  logs: EngineLogEntry[] = []
): Promise<ArticleGenerationResult> {
  const startTime = Date.now()
  
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `Starting article generation for: ${topic.title}`,
    data: { topic: topic.title, category: topic.category },
  })
  
  try {
    // Main content generation prompt with research instructions
    const contentPrompt = `Sen deneyimli bir Türk haber yazarısın. Aşağıdaki konu hakkında profesyonel, özgün ve SEO uyumlu bir haber makalesi yaz.

KONU: ${topic.title}
AÇIKLAMA: ${topic.description}
KATEGORİ: ${topic.category}
ANAHTAR KELİMELER: ${topic.keywords.join(', ')}

GÖREV:
1. Bu konu hakkında güncel ve doğru bilgiler topla
2. Profesyonel bir haber makalesi yaz
3. SEO için optimize edilmiş başlık ve meta açıklama oluştur
4. Duygu analizi yap

MAKALE KURALLARI:
- Minimum 800, maksimum 1500 kelime
- Profesyonel ve tarafsız haber dili
- Türkçe dilbilgisi kurallarına uygun
- Paragraflar arası akıcı geçişler
- Gerçeklere dayalı, spekülasyondan kaçın
- Kaynaklara atıf yap

YAPI:
1. Dikkat çekici giriş paragrafı (5W1H)
2. Detaylı gelişme bölümü (en az 3 paragraf)
3. Arka plan ve bağlam bilgisi
4. Uzman görüşleri veya istatistikler (varsa)
5. Sonuç ve gelecek perspektifi

SEO KURALLARI:
- Başlık: 50-60 karakter, anahtar kelime içermeli
- Meta açıklama: 150-160 karakter, özet ve çağrı
- Doğal anahtar kelime kullanımı

ÇIKTI FORMATI (JSON):
{
  "title": "SEO uyumlu haber başlığı",
  "content": "Tam makale içeriği (HTML formatında, <p>, <h2>, <h3>, <ul>, <li> etiketleri kullanılabilir)",
  "excerpt": "Kısa özet (2-3 cümle)",
  "metaTitle": "SEO meta başlığı (50-60 karakter)",
  "metaDescription": "SEO meta açıklaması (150-160 karakter)",
  "keywords": ["anahtar", "kelimeler", "listesi"],
  "sentiment": "POSITIVE veya NEGATIVE veya NEUTRAL",
  "sentimentScore": 0.75
}`

    // Generate content with Google Search grounding
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contentPrompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 8192,
        tools: [{
          googleSearch: {}
        }],
      },
    })
    
    const text = response.text || ''
    
    // Extract research sources from grounding
    const researchSources = extractSources(response as { candidates?: Array<{ groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> } }> })
    
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Found ${researchSources.length} research sources`,
    })
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON')
    }
    
    const result = JSON.parse(jsonMatch[0])
    
    // Validate required fields
    if (!result.title || !result.content) {
      throw new Error('Missing required fields in AI response')
    }
    
    // Generate slug
    const slug = generateSlug(result.title)
    
    // Build content object
    const content: GeneratedContent = {
      title: result.title,
      slug,
      content: result.content,
      excerpt: result.excerpt || result.content.substring(0, 200) + '...',
      metaTitle: result.metaTitle || result.title,
      metaDescription: result.metaDescription || result.excerpt || '',
      keywords: result.keywords || topic.keywords,
      sentiment: result.sentiment || 'NEUTRAL',
      sentimentScore: result.sentimentScore || 0.5,
      researchSources,
    }
    
    const duration = Date.now() - startTime
    
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Article generated successfully in ${duration}ms`,
      data: { title: content.title, wordCount: content.content.split(/\s+/).length },
    })
    
    return {
      success: true,
      topic,
      content,
      generationDuration: duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    logs.push({
      timestamp: new Date(),
      level: 'error',
      message: `Article generation failed: ${errorMessage}`,
      data: { topic: topic.title, error: errorMessage },
    })
    
    return {
      success: false,
      topic,
      error: errorMessage,
      generationDuration: duration,
    }
  }
}

/**
 * Generate articles for multiple topics
 * Uses parallel processing with controlled concurrency
 */
export async function generateArticles(
  topics: ScoredTopic[],
  maxConcurrent: number = 3,
  logs: EngineLogEntry[] = []
): Promise<ArticleGenerationResult[]> {
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `Generating ${topics.length} articles with concurrency ${maxConcurrent}`,
  })
  
  const results: ArticleGenerationResult[] = []
  
  // Process topics in batches for controlled parallelization
  for (let i = 0; i < topics.length; i += maxConcurrent) {
    const batch = topics.slice(i, i + maxConcurrent)
    
    logs.push({
      timestamp: new Date(),
      level: 'debug',
      message: `Processing batch ${Math.floor(i / maxConcurrent) + 1}: ${batch.length} articles`,
    })
    
    // Generate articles in parallel within batch
    const batchResults = await Promise.all(
      batch.map(topic => generateArticle(topic, logs))
    )
    
    results.push(...batchResults)
    
    // Delay between batches
    if (i + maxConcurrent < topics.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
  
  return results
}

/**
 * Generate cached summary for an article
 */
export async function generateSummary(
  articleId: string,
  content: string,
  logs: EngineLogEntry[] = []
): Promise<string | null> {
  try {
    const prompt = `Aşağıdaki haber makalesinin kısa ve öz bir özetini oluştur. Özet 2-3 cümle olmalı ve makalenin ana noktalarını kapsamalı.

MAKALE:
${content.substring(0, 3000)}

ÖZET:`

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 256,
      },
    })
    
    const summary = response.text?.trim() || null
    
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Summary generated for article ${articleId}`,
    })
    
    return summary
  } catch (error) {
    logs.push({
      timestamp: new Date(),
      level: 'error',
      message: `Summary generation failed for article ${articleId}`,
      data: { error: String(error) },
    })
    return null
  }
}

/**
 * Check if article generator is properly configured
 */
export function isArticleGeneratorConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}
