import { GoogleGenAI } from '@google/genai'
import { prisma } from '@/lib/prisma'
import { getDefaultModel, isValidModel } from '@/lib/gemini-models'
import { getPromptByType, interpolatePrompt } from '@/lib/prompts'
import { PromptType } from '@prisma/client'

/**
 * Google Gemini AI Service
 * Handles AI content generation for news articles
 * 
 * @version 4.0.0
 * @lastUpdated 20 January 2026
 * 
 * Changes in v4.0.0:
 * - Added Google Search grounding support for real-time web research
 * - Improved content generation with web-sourced information
 * - Enhanced prompts for better article quality
 */

// Initialize the Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

/**
 * Get the configured model for a specific use case from system settings
 * Falls back to default if not configured
 */
async function getConfiguredModel(useCase: 'content' | 'sentiment' | 'category' | 'summary'): Promise<string> {
  try {
    const settingKey = `ai_model_${useCase}`
    const setting = await prisma.systemSetting.findUnique({
      where: { key: settingKey },
    })
    
    if (setting?.value && isValidModel(setting.value)) {
      return setting.value
    }
    
    // Fallback to general content model setting
    if (useCase !== 'content') {
      const contentSetting = await prisma.systemSetting.findUnique({
        where: { key: 'ai_model_content' },
      })
      if (contentSetting?.value && isValidModel(contentSetting.value)) {
        return contentSetting.value
      }
    }
    
    return getDefaultModel(useCase)
  } catch {
    return getDefaultModel(useCase)
  }
}

/**
 * Sentiment analysis result type
 */
export interface SentimentResult {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  score: number // 0-1 confidence score
  summary: string // Brief explanation
}

/**
 * Article generation result with sources
 */
export interface ArticleGenerationResult {
  title: string
  content: string
  excerpt: string
  slug: string
  sources?: Array<{ title: string; url: string }>
  searchQueries?: string[]
}

/**
 * Generate a news article from RSS content with Google Search grounding
 * Uses Gemini's web search capability to research and enrich the content
 */
export async function generateArticle(
  sourceTitle: string,
  sourceContent: string,
  category: string,
  modelOverride?: string
): Promise<ArticleGenerationResult> {
  const modelName = modelOverride && isValidModel(modelOverride) 
    ? modelOverride 
    : await getConfiguredModel('content')

  // Get prompt template from database
  let promptTemplate = await getPromptByType('CONTENT' as PromptType)
  
  // Fallback to enhanced prompt with web research instructions
  if (!promptTemplate) {
    promptTemplate = `Sen profesyonel bir araştırmacı haber editörüsün. Aşağıdaki haber kaynağını kullanarak kapsamlı bir araştırma yap ve özgün, SEO dostu, okuyucu için değerli bir Türkçe haber makalesi oluştur.

KAYNAK BAŞLIK: {{title}}

KAYNAK İÇERİK: {{content}}

KATEGORİ: {{category}}

GÖREV:
1. Bu konuyu internette araştır ve güncel bilgileri topla
2. Birden fazla kaynaktan bilgi sentezle
3. Özgün ve dikkat çekici bir başlık yaz (maksimum 80 karakter)
4. Makale içeriğini yaz (minimum 400 kelime, maksimum 1000 kelime)
5. Kısa bir özet yaz (maksimum 160 karakter, SEO meta description için)
6. URL-friendly bir slug oluştur (Türkçe karakterler olmadan, tire ile ayrılmış)

KURALLAR:
- İçerik %100 özgün olmalı, kaynak metni birebir kopyalama
- Tarafsız ve profesyonel bir dil kullan
- Gerçeklere dayalı bilgi ver, spekülasyon yapma
- Okuyucuya değer katan, bilgilendirici bir içerik oluştur
- Konuyu derinlemesine araştır ve zenginleştir
- Güncel ve doğrulanmış bilgiler kullan

ÇIKTI FORMATI:
{
  "title": "Başlık burada",
  "content": "Makale içeriği burada (paragraflar \\n\\n ile ayrılmış)",
  "excerpt": "Kısa özet burada",
  "slug": "url-friendly-slug-burada"
}`
  }

  // Interpolate variables into the prompt
  const prompt = interpolatePrompt(promptTemplate, {
    title: sourceTitle,
    content: sourceContent,
    category: category,
  })

  try {
    // Use Google Search grounding for real-time web research
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json', // Force JSON output
        tools: [{ googleSearch: {} }],
      },
    })

    const text = response.text || ''
    
    // Extract grounding metadata if available
    let sources: Array<{ title: string; url: string }> = []
    let searchQueries: string[] = []
    
    // Check for grounding metadata in the response
    const candidate = response.candidates?.[0]
    if (candidate?.groundingMetadata) {
      const metadata = candidate.groundingMetadata
      
      // Extract search queries
      if (metadata.webSearchQueries) {
        searchQueries = metadata.webSearchQueries
      }
      
      // Extract source URLs
      if (metadata.groundingChunks) {
        sources = metadata.groundingChunks
          .filter((chunk: { web?: { uri?: string; title?: string } }) => chunk.web?.uri)
          .map((chunk: { web?: { uri?: string; title?: string } }) => ({
            title: chunk.web?.title || 'Kaynak',
            url: chunk.web?.uri || '',
          }))
      }
    }
    
    // Clean and parse the response
    const cleanText = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
    
    let result: Record<string, unknown> | null = null
    try {
      // 1. Try direct parsing
      result = JSON.parse(cleanText) as Record<string, unknown>
    } catch {
      try {
        // 2. Try extracting JSON object with regex
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]) as Record<string, unknown>
        } else {
          throw new Error('No JSON object found')
        }
      } catch {
        // 3. Fallback: Regex extraction for individual fields (Best Effort)
        console.warn('[Gemini] JSON parse failed, attempting regex fallback extraction')
        
        const titleMatch = cleanText.match(/"title"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)
        const contentMatch = cleanText.match(/"content"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)
        const excerptMatch = cleanText.match(/"excerpt"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)
        const slugMatch = cleanText.match(/"slug"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)
        
        if (titleMatch || contentMatch) {
          result = {
            title: titleMatch ? titleMatch[1].replace(/\\"/g, '"') : sourceTitle,
            content: contentMatch ? contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : sourceContent,
            excerpt: excerptMatch ? excerptMatch[1] : undefined,
            slug: slugMatch ? slugMatch[1] : undefined
          }
        } else {
          // 4. Last Resort: Treat whole text as content if it doesn't look like JSON at all
          // But check if it starts with "{" to avoid using the raw JSON string
          if (!cleanText.trim().startsWith('{')) {
             result = {
               title: sourceTitle,
               content: cleanText,
             }
          } else {
             throw new Error('Failed to parse response')
          }
        }
      }
    }
    
    console.log(`[Gemini] Article generated with ${sources.length} sources, ${searchQueries.length} search queries`)
    
    return {
      title: String(result?.title) || sourceTitle,
      content: String(result?.content) || sourceContent,
      excerpt: String(result?.excerpt) || sourceTitle.substring(0, 160),
      slug: String(result?.slug) || generateSlug(String(result?.title) || sourceTitle),
      sources: sources.length > 0 ? sources : undefined,
      searchQueries: searchQueries.length > 0 ? searchQueries : undefined,
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
 * Generate article summary with key points and reading time
 * Returns structured data for the UI
 */
export async function generateStructuredSummary(
  title: string,
  content: string,
  modelOverride?: string
): Promise<{ summary: string; keyPoints: string[]; readingTime: string }> {
  const modelName = modelOverride && isValidModel(modelOverride)
    ? modelOverride
    : await getConfiguredModel('summary')

  // Model-specific configuration
  // Defaulting to the user-preferred "Lite" style (Concise, Social Media focused)
  let config = {
    role: 'Sen sosyal medya odaklı profesyonel bir özet asistanısın.',
    wordCount: '150', // Keep it punchy
    bulletCount: '3',
    depth: 'Sadece manşetlik bilgileri ver. Çok kısa ve öz tut.',
    readingTime: '1 dakika',
    style: 'Basit, çarpıcı ve net'
  }

  // Customize QUALITY/INTELLIGENCE based on model, but keep the STYLE/FORMAT consistent
  switch (modelName) {
    case 'gemini-3-pro':
    case 'gemini-3-pro-001':
      config = {
        role: 'Sen ödüllü bir haber stratejistisin.',
        wordCount: '200',
        bulletCount: '4', // Slightly more detail
        depth: 'Haberin "neden önemli olduğunu" ve "perde arkasını" analiz et. Sadece ne olduğunu değil, ne anlama geldiğini de yaz. Ama kısa tut.',
        readingTime: '2 dakika',
        style: 'Özgün, vurucu ve içgörü dolu'
      }
      break
    
    case 'gemini-3-flash':
      config = {
        role: 'Sen kıdemli bir haber editörüsün.',
        wordCount: '180',
        bulletCount: '3',
        depth: 'Haberin en can alıcı noktalarını seç. Okuyucunun vaktini alma, direkt konuya gir.',
        readingTime: '1 dakika',
        style: 'Hızlı, dinamik ve net'
      }
      break

    case 'gemini-2.5-pro':
      config = {
        role: 'Sen teknik ve detaycı bir analiz asistanısın.',
        wordCount: '200',
        bulletCount: '4',
        depth: 'Haberdeki en kritik verileri ve olguları süz. Spekülasyon yapma, net gerçekleri yaz.',
        readingTime: '2 dakika',
        style: 'Bilgi yoğunluğu yüksek ama kısa'
      }
      break

    case 'gemini-2.5-flash':
    case 'gemini-2.5-flash-lite':
    default:
      // Keep the "Lite" style that the user loved
      config = {
        role: 'Sen sosyal medya odaklı bir özet asistanısın.',
        wordCount: '150',
        bulletCount: '3',
        depth: 'Sadece manşetlik bilgileri ver. Çok kısa ve öz tut. En basit haliyle anlat.',
        readingTime: '1 dakika',
        style: 'Basit, kısa ve maddeler halinde'
      }
      break
  }

  const prompt = `${config.role} Aşağıdaki haber makalesini "${config.style}" bir dille okuyucular için özetle.

BAŞLIK: ${title}

İÇERİK:
${content.substring(0, 8000)}

GÖREV:
1. ${config.depth}
2. Genel özet yaklaşık ${config.wordCount} kelime olsun.
3. Makalenin en kritik noktalarını ${config.bulletCount} madde halinde listele.
4. Her madde açıklayıcı olsun (sadece başlık değil).
5. Tarafsız ve profesyonel bir dil kullan.
6. Türkçe yaz.

ÇIKTI FORMATI (JSON):
{
  "summary": "<h2>Çarpıcı Bir Başlık</h2><p>Genel özet metni buraya (HTML formatında paragraflar).</p>",
  "keyPoints": ["Madde 1", "Madde 2", "Madde 3"],
  "readingTime": "${config.readingTime}"
}`

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: modelName.includes('pro') ? 0.7 : 0.5,
        topP: 0.9,
        maxOutputTokens: 2048, 
        responseMimeType: 'application/json',
      },
    })

    const text = response.text || ''
    const cleanText = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
    let result

    try {
      result = JSON.parse(cleanText)
    } catch {
       const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
       if (jsonMatch) {
         result = JSON.parse(jsonMatch[0])
       } else {
         throw new Error('JSON parsing failed')
       }
    }

    return {
      summary: result.summary || 'Özet oluşturulamadı',
      keyPoints: result.keyPoints || [],
      readingTime: result.readingTime || config.readingTime,
    }
  } catch (error) {
    console.error('Gemini structured summary error:', error)
    // Fallback
    return {
      summary: content.substring(0, 300) + '...',
      keyPoints: [],
      readingTime: '3 dakika'
    }
  }
}

/**
 * Generate article summary (Simple version for backward compatibility)
 * Now uses customizable prompts from database
 */
export async function generateSummary(
  content: string,
  modelOverride?: string
): Promise<string> {
  const modelName = modelOverride && isValidModel(modelOverride)
    ? modelOverride
    : await getConfiguredModel('summary')

  // Get prompt template from database
  let promptTemplate = await getPromptByType('SUMMARY' as PromptType)
  
  // Fallback to hardcoded prompt if not found
  if (!promptTemplate) {
    promptTemplate = `Aşağıdaki haber makalesinin kısa bir özetini yaz (maksimum 2-3 cümle, 160 karakter):

{{content}}

Sadece özeti yaz, başka bir şey ekleme.`
  }

  const prompt = interpolatePrompt(promptTemplate, { content })

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
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
 * Analyze sentiment of an article using AI
 * Now uses customizable prompts from database
 */
export async function analyzeSentiment(
  title: string,
  content: string,
  modelOverride?: string
): Promise<SentimentResult> {
  const modelName = modelOverride && isValidModel(modelOverride)
    ? modelOverride
    : await getConfiguredModel('sentiment')

  // Get prompt template from database
  let promptTemplate = await getPromptByType('SENTIMENT' as PromptType)
  
  // Fallback to hardcoded prompt if not found
  if (!promptTemplate) {
    promptTemplate = `Sen bir duygu analizi uzmanısın. Aşağıdaki haber başlığı ve içeriğini analiz ederek haberin genel duygusal tonunu belirle.

BAŞLIK: {{title}}

İÇERİK: {{content}}

GÖREV:
1. Haberin genel duygusal tonunu belirle (POSITIVE, NEGATIVE veya NEUTRAL)
2. Güven skorunu belirle (0-1 arası, 1 en yüksek güven)
3. Kısa bir açıklama yaz (maksimum 100 karakter)

KRİTERLER:
- POSITIVE: İyi haberler, başarılar, olumlu gelişmeler, umut verici konular
- NEGATIVE: Kötü haberler, sorunlar, olumsuz gelişmeler, endişe verici konular
- NEUTRAL: Tarafsız haberler, bilgilendirici içerik, olgu aktarımı

ÇIKTI FORMATI (JSON):
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "score": 0.85,
  "summary": "Kısa açıklama"
}`
  }

  const prompt = interpolatePrompt(promptTemplate, {
    title,
    content: content.substring(0, 1500),
  })

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 256,
        responseMimeType: 'application/json',
      },
    })

    const text = response.text || ''
    
    // Clean markdown code blocks and parse JSON
    const cleanText = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
    
    // Try direct parse first
    let result
    try {
      result = JSON.parse(cleanText)
    } catch {
      // Fallback to regex extraction
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini')
      }
      result = JSON.parse(jsonMatch[0])
    }
    
    // Validate sentiment value
    const validSentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL']
    const sentiment = validSentiments.includes(result.sentiment) 
      ? result.sentiment 
      : 'NEUTRAL'
    
    // Validate score
    const score = typeof result.score === 'number' 
      ? Math.min(1, Math.max(0, result.score))
      : 0.5

    return {
      sentiment: sentiment as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
      score,
      summary: result.summary || 'Duygu analizi tamamlandı',
    }
  } catch (error) {
    console.error('Gemini sentiment analysis error:', error)
    return {
      sentiment: 'NEUTRAL',
      score: 0.5,
      summary: 'Analiz yapılamadı',
    }
  }
}

/**
 * Batch analyze sentiment for multiple articles
 */
export async function batchAnalyzeSentiment(
  articles: Array<{ id: string; title: string; content: string }>,
  modelOverride?: string
): Promise<Map<string, SentimentResult>> {
  const results = new Map<string, SentimentResult>()
  
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize)
    
    const batchResults = await Promise.all(
      batch.map(async (article) => {
        const result = await analyzeSentiment(article.title, article.content, modelOverride)
        return { id: article.id, result }
      })
    )
    
    batchResults.forEach(({ id, result }) => {
      results.set(id, result)
    })
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

/**
 * Determine article category using AI
 * Now uses customizable prompts from database
 */
export async function determineCategory(
  title: string,
  content: string,
  modelOverride?: string
): Promise<string> {
  const modelName = modelOverride && isValidModel(modelOverride)
    ? modelOverride
    : await getConfiguredModel('category')

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

  // Get prompt template from database
  let promptTemplate = await getPromptByType('CATEGORY' as PromptType)
  
  // Fallback to hardcoded prompt if not found
  if (!promptTemplate) {
    promptTemplate = `Aşağıdaki haber başlığı ve içeriğine göre en uygun kategoriyi seç.

BAŞLIK: {{title}}

İÇERİK: {{content}}

KATEGORİLER: {{categories}}

Sadece kategori adını yaz, başka bir şey ekleme.`
  }

  const prompt = interpolatePrompt(promptTemplate, {
    title,
    content: content.substring(0, 500),
    categories: categories.join(', '),
  })

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
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

/**
 * Get current model configuration
 */
export async function getCurrentModelConfig(): Promise<{
  content: string
  sentiment: string
  category: string
  summary: string
}> {
  const [content, sentiment, category, summary] = await Promise.all([
    getConfiguredModel('content'),
    getConfiguredModel('sentiment'),
    getConfiguredModel('category'),
    getConfiguredModel('summary'),
  ])
  
  return { content, sentiment, category, summary }
}
