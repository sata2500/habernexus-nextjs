import { GoogleGenAI } from '@google/genai'
import { prisma } from '@/lib/prisma'
import { ResearchResult, ResearchSource } from '@/lib/research-agent'
import { getPromptByType, interpolatePrompt } from '@/lib/prompts'
import { PromptType } from '@prisma/client'
import { getDefaultModel, isValidModel } from '@/lib/gemini-models'

/**
 * Content Synthesizer Service
 * Generates high-quality, original articles from research results
 * 
 * @version 1.0.0
 * @lastUpdated 20 January 2026
 * 
 * This module implements the third phase of the advanced content generation pipeline:
 * 1. Take research results
 * 2. Synthesize information into coherent narrative
 * 3. Generate original, valuable content
 * 4. Add proper citations and references
 * 5. Ensure SEO optimization
 */

// Initialize Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

/**
 * Generated article structure
 */
export interface GeneratedArticle {
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  citations: Citation[]
  seoTitle: string
  seoDescription: string
  readingTime: number
}

/**
 * Citation structure
 */
export interface Citation {
  id: number
  text: string
  source: string
  url?: string
}

/**
 * Content synthesis result
 */
export interface SynthesisResult {
  success: boolean
  article: GeneratedArticle | null
  qualityScore: number
  errors: string[]
  processingTime: number
}

/**
 * Get configured model for content generation
 */
async function getConfiguredModel(): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'ai_model_content' },
    })
    
    if (setting?.value && isValidModel(setting.value)) {
      return setting.value
    }
    
    return getDefaultModel('content')
  } catch {
    return getDefaultModel('content')
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
 * Calculate reading time in minutes
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

/**
 * Extract citations from content and format them
 */
function extractCitations(
  content: string,
  sources: ResearchSource[]
): { content: string; citations: Citation[] } {
  const citations: Citation[] = []
  let processedContent = content
  let citationId = 1

  // Find citation markers in content [kaynak], [1], etc.
  const citationPattern = /\[([^\]]+)\]/g
  const matches = content.matchAll(citationPattern)

  for (const match of matches) {
    const citationText = match[1]
    
    // Try to find matching source
    const matchingSource = sources.find(s => 
      s.title.toLowerCase().includes(citationText.toLowerCase()) ||
      citationText.toLowerCase().includes(s.title.toLowerCase().substring(0, 20))
    )

    if (matchingSource || citationText.match(/^\d+$/)) {
      citations.push({
        id: citationId,
        text: citationText,
        source: matchingSource?.title || `Kaynak ${citationId}`,
        url: matchingSource?.url,
      })
      
      // Replace with numbered citation
      processedContent = processedContent.replace(
        match[0],
        `<sup>[${citationId}]</sup>`
      )
      citationId++
    }
  }

  return { content: processedContent, citations }
}

/**
 * Generate article content from research results
 */
async function generateArticleContent(
  research: ResearchResult
): Promise<GeneratedArticle | null> {
  const modelName = await getConfiguredModel()
  
  // Prepare findings for the prompt
  const findingsText = research.findings
    .map(f => `- [${f.category}] ${f.fact} (güven: ${Math.round(f.confidence * 100)}%)`)
    .join('\n')

  // Prepare sources for the prompt
  const sourcesText = research.sources
    .map(s => `- ${s.title}: ${s.url || 'URL yok'}`)
    .join('\n')

  // Get custom prompt template or use default
  const promptTemplate = await getPromptByType('CONTENT' as PromptType)
  
  const contentPrompt = `Sen ödüllü bir haber yazarısın. Aşağıdaki araştırma sonuçlarını kullanarak özgün, değerli ve profesyonel bir haber makalesi yaz.

KONU: ${research.topic.title}
KATEGORİ: ${research.topic.category}

ARAŞTIRMA ÖZETİ:
${research.summary}

ÖNEMLİ NOKTALAR:
${research.keyPoints.map(p => `• ${p}`).join('\n')}

ARAŞTIRMA BULGULARI:
${findingsText}

KAYNAKLAR:
${sourcesText}

ÖNERİLEN AÇILAR:
${research.suggestedAngles.map(a => `• ${a}`).join('\n')}

YAZIM KURALLARI:
1. %100 özgün içerik oluştur - hiçbir kaynaktan birebir kopyalama
2. Profesyonel ve tarafsız gazetecilik dili kullan
3. Bilgileri doğal bir akışla sentezle
4. Önemli bilgileri vurgula ama abartma
5. Okuyucuya değer katan, bilgilendirici içerik oluştur
6. SEO dostu başlık ve açıklama yaz
7. Uygun yerlerde kaynak belirt [kaynak adı] formatında

MAKALE YAPISI:
- Dikkat çekici başlık (60-80 karakter)
- Güçlü giriş paragrafı (5W1H)
- Detaylı gövde (en az 400 kelime)
- Bağlam ve arka plan bilgisi
- Uzman görüşleri veya analizler (varsa)
- Sonuç veya gelecek perspektifi

ÇIKTI FORMATI (JSON):
{
  "title": "Haber başlığı",
  "content": "Tam makale içeriği (paragraflar \\n\\n ile ayrılmış)",
  "excerpt": "SEO meta açıklaması (150-160 karakter)",
  "tags": ["etiket1", "etiket2", "etiket3"],
  "seoTitle": "SEO başlığı (50-60 karakter)",
  "seoDescription": "SEO açıklaması (150-160 karakter)"
}`

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: promptTemplate 
        ? interpolatePrompt(promptTemplate, { 
            title: research.topic.title,
            content: contentPrompt,
            category: research.topic.category 
          })
        : contentPrompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      },
    })

    const text = response.text || ''
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[ContentSynthesizer] Invalid response format')
      return null
    }

    const result = JSON.parse(jsonMatch[0])
    
    // Process citations
    const { content: processedContent, citations } = extractCitations(
      result.content || '',
      research.sources
    )

    const article: GeneratedArticle = {
      title: result.title || research.topic.title,
      slug: generateSlug(result.title || research.topic.title),
      content: processedContent,
      excerpt: result.excerpt || research.summary.substring(0, 160),
      category: research.topic.category,
      tags: result.tags || research.topic.keywords,
      citations,
      seoTitle: result.seoTitle || result.title,
      seoDescription: result.seoDescription || result.excerpt,
      readingTime: calculateReadingTime(processedContent),
    }

    return article

  } catch (error) {
    console.error('[ContentSynthesizer] Content generation error:', error)
    return null
  }
}

/**
 * Evaluate article quality
 */
async function evaluateQuality(article: GeneratedArticle): Promise<number> {
  // Simple quality scoring based on content characteristics
  let score = 0
  
  // Title quality (0-15)
  if (article.title.length >= 30 && article.title.length <= 80) score += 10
  if (!article.title.includes('!') && !article.title.includes('?')) score += 5
  
  // Content length (0-25)
  const wordCount = article.content.split(/\s+/).length
  if (wordCount >= 300) score += 10
  if (wordCount >= 500) score += 10
  if (wordCount >= 700) score += 5
  
  // Structure (0-20)
  const paragraphs = article.content.split('\n\n').filter(p => p.trim().length > 0)
  if (paragraphs.length >= 4) score += 10
  if (paragraphs.length >= 6) score += 10
  
  // SEO (0-20)
  if (article.excerpt.length >= 100 && article.excerpt.length <= 160) score += 10
  if (article.tags.length >= 3) score += 5
  if (article.seoTitle && article.seoDescription) score += 5
  
  // Citations (0-20)
  if (article.citations.length > 0) score += 10
  if (article.citations.length >= 2) score += 10
  
  return Math.min(100, score)
}

/**
 * Main function: Synthesize content from research results
 */
export async function synthesizeContent(
  research: ResearchResult
): Promise<SynthesisResult> {
  const startTime = Date.now()
  const result: SynthesisResult = {
    success: false,
    article: null,
    qualityScore: 0,
    errors: [],
    processingTime: 0,
  }

  console.log(`[ContentSynthesizer] Starting synthesis for: ${research.topic.title}`)

  try {
    // Check if research was successful
    if (!research.success || research.findings.length === 0) {
      result.errors.push('Insufficient research data for content synthesis')
      return result
    }

    // Generate article content
    console.log('[ContentSynthesizer] Generating article content...')
    const article = await generateArticleContent(research)
    
    if (!article) {
      result.errors.push('Failed to generate article content')
      return result
    }

    // Evaluate quality
    console.log('[ContentSynthesizer] Evaluating article quality...')
    const qualityScore = await evaluateQuality(article)

    result.article = article
    result.qualityScore = qualityScore
    result.success = qualityScore >= 50 // Minimum quality threshold
    result.processingTime = Date.now() - startTime

    console.log(`[ContentSynthesizer] Synthesis completed. Quality: ${qualityScore}/100`)

  } catch (error) {
    result.errors.push(`Synthesis error: ${error}`)
    console.error('[ContentSynthesizer] Error:', error)
  }

  result.processingTime = Date.now() - startTime
  return result
}

/**
 * Synthesize multiple articles from research results
 */
export async function synthesizeMultiple(
  researchResults: ResearchResult[]
): Promise<SynthesisResult[]> {
  const results: SynthesisResult[] = []
  
  for (const research of researchResults) {
    const result = await synthesizeContent(research)
    results.push(result)
    
    // Small delay between syntheses
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

/**
 * Format article content with proper HTML structure
 */
export function formatArticleHtml(article: GeneratedArticle): string {
  let html = ''
  
  // Split content into paragraphs
  const paragraphs = article.content.split('\n\n')
  
  for (const para of paragraphs) {
    if (para.trim()) {
      // Check if it's a heading
      if (para.startsWith('##')) {
        html += `<h2>${para.replace(/^##\s*/, '')}</h2>\n`
      } else if (para.startsWith('#')) {
        html += `<h3>${para.replace(/^#\s*/, '')}</h3>\n`
      } else {
        html += `<p>${para.trim()}</p>\n`
      }
    }
  }
  
  // Add citations section if there are citations
  if (article.citations.length > 0) {
    html += '\n<div class="citations">\n<h4>Kaynaklar</h4>\n<ol>\n'
    for (const citation of article.citations) {
      if (citation.url) {
        html += `<li id="cite-${citation.id}"><a href="${citation.url}" target="_blank" rel="noopener">${citation.source}</a></li>\n`
      } else {
        html += `<li id="cite-${citation.id}">${citation.source}</li>\n`
      }
    }
    html += '</ol>\n</div>'
  }
  
  return html
}

/**
 * Check if content synthesizer is configured
 */
export function isContentSynthesizerConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}
