import { GoogleGenAI } from '@google/genai'
import { ScoredTopic } from '@/lib/topic-selector'

/**
 * Research Agent Service
 * Conducts deep web research on selected topics using AI
 * 
 * @version 1.0.0
 * @lastUpdated 20 January 2026
 * 
 * This module implements the second phase of the advanced content generation pipeline:
 * 1. Take a selected topic
 * 2. Generate search queries
 * 3. Search the web using Gemini's grounding capability
 * 4. Extract and structure relevant information
 * 5. Return comprehensive research results
 */

// Initialize Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

/**
 * Research source information
 */
export interface ResearchSource {
  title: string
  url: string
  snippet: string
  relevanceScore: number
  publishedDate?: string
}

/**
 * Research finding - a piece of information extracted from sources
 */
export interface ResearchFinding {
  fact: string
  sources: string[]
  confidence: number
  category: 'background' | 'current' | 'analysis' | 'quote' | 'statistic'
}

/**
 * Complete research result for a topic
 */
export interface ResearchResult {
  topic: ScoredTopic
  success: boolean
  findings: ResearchFinding[]
  sources: ResearchSource[]
  summary: string
  keyPoints: string[]
  suggestedAngles: string[]
  researchDuration: number
  errors: string[]
}

/**
 * Generate search queries for a topic
 */
async function generateSearchQueries(topic: ScoredTopic): Promise<string[]> {
  const prompt = `Bir haber araştırmacısı olarak, aşağıdaki konu hakkında kapsamlı araştırma yapmak için en etkili arama sorgularını oluştur.

KONU: ${topic.title}
AÇIKLAMA: ${topic.description}
KATEGORİ: ${topic.category}
ANAHTAR KELİMELER: ${topic.keywords.join(', ')}

GÖREV:
5 farklı arama sorgusu oluştur:
1. Ana konu hakkında genel bilgi
2. Son gelişmeler ve güncel haberler
3. Uzman görüşleri ve analizler
4. İstatistikler ve veriler
5. Arka plan ve bağlam bilgisi

KURALLAR:
- Sorgular Türkçe olmalı
- Her sorgu 3-6 kelime arasında olmalı
- Spesifik ve hedefli sorgular oluştur

ÇIKTI FORMATI (JSON):
{
  "queries": ["sorgu1", "sorgu2", "sorgu3", "sorgu4", "sorgu5"]
}`

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 512,
      },
    })

    const text = response.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return result.queries || []
    }

    // Fallback queries
    return [
      topic.title,
      `${topic.title} son gelişmeler`,
      `${topic.title} analiz`,
    ]
  } catch (error) {
    console.error('[ResearchAgent] Query generation error:', error)
    return [topic.title]
  }
}

/**
 * Conduct web research using Gemini with grounding
 */
async function conductWebResearch(
  topic: ScoredTopic,
  queries: string[]
): Promise<{
  findings: ResearchFinding[]
  sources: ResearchSource[]
  rawContent: string
}> {
  const findings: ResearchFinding[] = []
  const sources: ResearchSource[] = []
  let rawContent = ''

  // Research prompt that instructs Gemini to search and analyze
  const researchPrompt = `Sen deneyimli bir haber araştırmacısısın. Aşağıdaki konu hakkında kapsamlı bir araştırma yap.

KONU: ${topic.title}
AÇIKLAMA: ${topic.description}
KATEGORİ: ${topic.category}

ARAŞTIRMA SORULARI:
${queries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

GÖREV:
1. Bu konu hakkında güncel ve doğru bilgiler topla
2. Farklı kaynaklardan bilgi sentezle
3. Önemli gerçekleri, istatistikleri ve uzman görüşlerini belirle
4. Bilgileri kategorize et (arka plan, güncel, analiz, alıntı, istatistik)

ARAŞTIRMA KURALLARI:
- Sadece güvenilir kaynaklardan bilgi kullan
- Bilgilerin doğruluğunu çapraz kontrol et
- Tarih ve rakamları doğrula
- Spekülasyondan kaçın, gerçeklere odaklan

ÇIKTI FORMATI (JSON):
{
  "summary": "Konunun kısa özeti (2-3 cümle)",
  "keyPoints": [
    "Önemli nokta 1",
    "Önemli nokta 2",
    "Önemli nokta 3"
  ],
  "findings": [
    {
      "fact": "Bulunan gerçek veya bilgi",
      "category": "background|current|analysis|quote|statistic",
      "confidence": 0.9,
      "sourceHint": "Bilginin kaynağına dair ipucu"
    }
  ],
  "suggestedAngles": [
    "Haber için önerilen açı 1",
    "Haber için önerilen açı 2"
  ],
  "additionalContext": "Ek bağlam bilgisi"
}`

  try {
    // Use Gemini with search grounding for web research
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: researchPrompt,
      config: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 4096,
        // Enable search grounding when available
        tools: [{
          googleSearch: {}
        }],
      },
    })

    const text = response.text || ''
    rawContent = text

    // Try to parse structured response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0])
        
        // Extract findings
        if (result.findings && Array.isArray(result.findings)) {
          for (const finding of result.findings) {
            findings.push({
              fact: finding.fact || '',
              sources: finding.sourceHint ? [finding.sourceHint] : [],
              confidence: finding.confidence || 0.7,
              category: finding.category || 'current',
            })
          }
        }

        // Extract key points as findings if no structured findings
        if (findings.length === 0 && result.keyPoints) {
          for (const point of result.keyPoints) {
            findings.push({
              fact: point,
              sources: [],
              confidence: 0.8,
              category: 'current',
            })
          }
        }
      } catch {
        console.warn('[ResearchAgent] Could not parse structured response')
      }
    }

    // Extract grounding metadata if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Kaynak',
            url: chunk.web.uri || '',
            snippet: '',
            relevanceScore: 0.8,
          })
        }
      }
    }

    // If no structured findings, extract from raw text
    if (findings.length === 0 && rawContent) {
      const sentences = rawContent.split(/[.!?]/).filter(s => s.trim().length > 20)
      for (const sentence of sentences.slice(0, 10)) {
        findings.push({
          fact: sentence.trim(),
          sources: [],
          confidence: 0.6,
          category: 'current',
        })
      }
    }

  } catch (error) {
    console.error('[ResearchAgent] Web research error:', error)
  }

  return { findings, sources, rawContent }
}

/**
 * Synthesize research findings into a coherent summary
 */
async function synthesizeFindings(
  topic: ScoredTopic,
  findings: ResearchFinding[],
  rawContent: string
): Promise<{
  summary: string
  keyPoints: string[]
  suggestedAngles: string[]
}> {
  if (findings.length === 0 && !rawContent) {
    return {
      summary: topic.description,
      keyPoints: [topic.title],
      suggestedAngles: ['Genel haber'],
    }
  }

  const synthesisPrompt = `Aşağıdaki araştırma bulgularını analiz et ve sentezle.

KONU: ${topic.title}

BULGULAR:
${findings.map(f => `- [${f.category}] ${f.fact}`).join('\n')}

HAM İÇERİK:
${rawContent.substring(0, 2000)}

GÖREV:
1. Bulguları sentezleyerek kapsamlı bir özet oluştur
2. En önemli 5 noktayı belirle
3. Haber yazımı için 3 farklı açı öner

ÇIKTI FORMATI (JSON):
{
  "summary": "Kapsamlı özet (3-5 cümle)",
  "keyPoints": ["nokta1", "nokta2", "nokta3", "nokta4", "nokta5"],
  "suggestedAngles": ["açı1", "açı2", "açı3"]
}`

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: synthesisPrompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    })

    const text = response.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return {
        summary: result.summary || topic.description,
        keyPoints: result.keyPoints || [],
        suggestedAngles: result.suggestedAngles || [],
      }
    }
  } catch (error) {
    console.error('[ResearchAgent] Synthesis error:', error)
  }

  return {
    summary: topic.description,
    keyPoints: findings.slice(0, 5).map(f => f.fact),
    suggestedAngles: ['Genel haber yaklaşımı'],
  }
}

/**
 * Main function: Conduct comprehensive research on a topic
 */
export async function researchTopic(topic: ScoredTopic): Promise<ResearchResult> {
  const startTime = Date.now()
  const result: ResearchResult = {
    topic,
    success: false,
    findings: [],
    sources: [],
    summary: '',
    keyPoints: [],
    suggestedAngles: [],
    researchDuration: 0,
    errors: [],
  }

  console.log(`[ResearchAgent] Starting research for: ${topic.title}`)

  try {
    // Step 1: Generate search queries
    console.log('[ResearchAgent] Generating search queries...')
    const queries = await generateSearchQueries(topic)
    console.log(`[ResearchAgent] Generated ${queries.length} queries`)

    // Step 2: Conduct web research
    console.log('[ResearchAgent] Conducting web research...')
    const { findings, sources, rawContent } = await conductWebResearch(topic, queries)
    result.findings = findings
    result.sources = sources
    console.log(`[ResearchAgent] Found ${findings.length} findings from ${sources.length} sources`)

    // Step 3: Synthesize findings
    console.log('[ResearchAgent] Synthesizing findings...')
    const synthesis = await synthesizeFindings(topic, findings, rawContent)
    result.summary = synthesis.summary
    result.keyPoints = synthesis.keyPoints
    result.suggestedAngles = synthesis.suggestedAngles

    result.success = findings.length > 0 || result.summary.length > 0
    result.researchDuration = Date.now() - startTime

    console.log(`[ResearchAgent] Research completed in ${result.researchDuration}ms`)

  } catch (error) {
    result.errors.push(`Research error: ${error}`)
    console.error('[ResearchAgent] Error:', error)
  }

  result.researchDuration = Date.now() - startTime
  return result
}

/**
 * Research multiple topics in parallel
 */
export async function researchTopics(
  topics: ScoredTopic[],
  maxConcurrent: number = 3
): Promise<ResearchResult[]> {
  const results: ResearchResult[] = []
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < topics.length; i += maxConcurrent) {
    const batch = topics.slice(i, i + maxConcurrent)
    const batchResults = await Promise.all(
      batch.map(topic => researchTopic(topic))
    )
    results.push(...batchResults)
    
    // Small delay between batches
    if (i + maxConcurrent < topics.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}

/**
 * Check if research agent is properly configured
 */
export function isResearchAgentConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}
