import { prisma } from '@/lib/prisma'
import { fetchRssFeed, RssItem } from '@/lib/rss'
import { GoogleGenAI } from '@google/genai'
import { getPromptByType, interpolatePrompt } from '@/lib/prompts'
import { PromptType } from '@prisma/client'

/**
 * Topic Selector Service
 * Intelligently selects the most valuable and interesting topics from RSS feeds
 * 
 * @version 1.0.0
 * @lastUpdated 20 January 2026
 * 
 * This module implements the first phase of the advanced content generation pipeline:
 * 1. Collect all RSS items from active feeds
 * 2. Analyze and score topics using AI
 * 3. Filter duplicates and similar topics
 * 4. Return ranked list of topics for research
 */

// Initialize Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

/**
 * Topic with score and metadata
 */
export interface ScoredTopic {
  title: string
  description: string
  sourceUrl: string
  sourceFeed: string
  category: string
  score: number
  reasoning: string
  keywords: string[]
  publishedAt: Date | null
  imageUrl?: string
}

/**
 * Topic selection result
 */
export interface TopicSelectionResult {
  success: boolean
  topics: ScoredTopic[]
  totalCollected: number
  totalSelected: number
  errors: string[]
}

/**
 * Collect all RSS items from active feeds
 */
export async function collectRssItems(): Promise<{
  items: Array<RssItem & { feedName: string; feedCategory: string }>
  errors: string[]
}> {
  const errors: string[] = []
  const allItems: Array<RssItem & { feedName: string; feedCategory: string }> = []

  try {
    // Get all active RSS feeds
    const feeds = await prisma.rssFeed.findMany({
      where: { isActive: true },
    })

    console.log(`[TopicSelector] Found ${feeds.length} active feeds`)

    // Fetch items from each feed
    for (const feed of feeds) {
      try {
        const rssData = await fetchRssFeed(feed.url)
        if (rssData && rssData.items.length > 0) {
          // Add feed metadata to each item
          const itemsWithMeta = rssData.items.map(item => ({
            ...item,
            feedName: feed.name,
            feedCategory: feed.category,
          }))
          allItems.push(...itemsWithMeta)
          console.log(`[TopicSelector] Collected ${rssData.items.length} items from ${feed.name}`)
        }
      } catch (error) {
        const errorMsg = `Error fetching feed ${feed.name}: ${error}`
        errors.push(errorMsg)
        console.error(`[TopicSelector] ${errorMsg}`)
      }
    }

    return { items: allItems, errors }
  } catch (error) {
    errors.push(`Database error: ${error}`)
    return { items: [], errors }
  }
}

/**
 * Filter out topics that already exist in the database
 */
async function filterExistingTopics(
  items: Array<RssItem & { feedName: string; feedCategory: string }>
): Promise<Array<RssItem & { feedName: string; feedCategory: string }>> {
  const filtered: Array<RssItem & { feedName: string; feedCategory: string }> = []

  for (const item of items) {
    // Generate a base slug to check for existing articles
    const baseSlug = item.title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30)

    // Check if similar article exists
    const existing = await prisma.article.findFirst({
      where: {
        slug: { contains: baseSlug },
      },
    })

    if (!existing) {
      filtered.push(item)
    }
  }

  console.log(`[TopicSelector] Filtered ${items.length - filtered.length} existing topics`)
  return filtered
}

/**
 * Score and rank topics using AI
 */
async function scoreTopics(
  items: Array<RssItem & { feedName: string; feedCategory: string }>,
  maxTopics: number = 10
): Promise<ScoredTopic[]> {
  if (items.length === 0) return []

  // Prepare topics for AI analysis
  const topicsForAnalysis = items.slice(0, 50).map((item, index) => ({
    id: index,
    title: item.title,
    description: item.description?.substring(0, 200) || '',
    category: item.feedCategory,
    source: item.feedName,
  }))

  // Get prompt template from database or use default
  const promptTemplate = await getPromptByType('CONTENT' as PromptType)
  
  // Use specialized topic selection prompt
  const topicSelectionPrompt = `Sen deneyimli bir haber editörüsün. Aşağıdaki haber başlıklarını analiz et ve en değerli, ilgi çekici ve güncel olanları seç.

HABER BAŞLIKLARI:
${JSON.stringify(topicsForAnalysis, null, 2)}

GÖREV:
1. Her başlığı şu kriterlere göre değerlendir:
   - Güncellik ve zamanlılık (0-25 puan)
   - Okuyucu ilgisi ve değeri (0-25 puan)
   - Haber değeri ve önemi (0-25 puan)
   - Özgünlük ve farklılık (0-25 puan)

2. En yüksek puanlı ${maxTopics} haberi seç

3. Her seçilen haber için:
   - Toplam puan (0-100)
   - Seçim gerekçesi
   - Anahtar kelimeler (araştırma için)

KURALLAR:
- Clickbait veya düşük kaliteli içerikleri eleme
- Benzer konuları tek bir başlık altında birleştir
- Türkiye ve dünya gündemini dengele
- Farklı kategorilerden seçim yap

ÇIKTI FORMATI (JSON):
{
  "selectedTopics": [
    {
      "id": 0,
      "score": 85,
      "reasoning": "Neden seçildiğinin kısa açıklaması",
      "keywords": ["anahtar", "kelimeler", "araştırma", "için"]
    }
  ]
}`

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: promptTemplate ? interpolatePrompt(promptTemplate, { content: topicSelectionPrompt }) : topicSelectionPrompt,
      config: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    })

    const text = response.text || ''
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[TopicSelector] Invalid response format from AI')
      // Return top items without AI scoring
      return items.slice(0, maxTopics).map(item => ({
        title: item.title,
        description: item.description || '',
        sourceUrl: item.link,
        sourceFeed: item.feedName,
        category: item.feedCategory,
        score: 50,
        reasoning: 'AI analizi yapılamadı',
        keywords: [],
        publishedAt: item.pubDate ? new Date(item.pubDate) : null,
        imageUrl: item.imageUrl,
      }))
    }

    const result = JSON.parse(jsonMatch[0])
    const selectedTopics: ScoredTopic[] = []

    for (const selected of result.selectedTopics || []) {
      const originalItem = items[selected.id]
      if (originalItem) {
        selectedTopics.push({
          title: originalItem.title,
          description: originalItem.description || '',
          sourceUrl: originalItem.link,
          sourceFeed: originalItem.feedName,
          category: originalItem.feedCategory,
          score: selected.score || 50,
          reasoning: selected.reasoning || '',
          keywords: selected.keywords || [],
          publishedAt: originalItem.pubDate ? new Date(originalItem.pubDate) : null,
          imageUrl: originalItem.imageUrl,
        })
      }
    }

    // Sort by score descending
    selectedTopics.sort((a, b) => b.score - a.score)

    console.log(`[TopicSelector] AI selected ${selectedTopics.length} topics`)
    return selectedTopics

  } catch (error) {
    console.error('[TopicSelector] AI scoring error:', error)
    // Return top items without AI scoring as fallback
    return items.slice(0, maxTopics).map(item => ({
      title: item.title,
      description: item.description || '',
      sourceUrl: item.link,
      sourceFeed: item.feedName,
      category: item.feedCategory,
      score: 50,
      reasoning: 'AI analizi yapılamadı',
      keywords: [],
      publishedAt: item.pubDate ? new Date(item.pubDate) : null,
      imageUrl: item.imageUrl,
    }))
  }
}

/**
 * Remove duplicate or very similar topics
 */
function removeDuplicates(topics: ScoredTopic[]): ScoredTopic[] {
  const unique: ScoredTopic[] = []
  const seenTitles: Set<string> = new Set()

  for (const topic of topics) {
    // Normalize title for comparison
    const normalizedTitle = topic.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()

    // Check if similar title already exists
    let isDuplicate = false
    for (const seen of seenTitles) {
      if (calculateSimilarity(normalizedTitle, seen) > 0.7) {
        isDuplicate = true
        break
      }
    }

    if (!isDuplicate) {
      unique.push(topic)
      seenTitles.add(normalizedTitle)
    }
  }

  console.log(`[TopicSelector] Removed ${topics.length - unique.length} duplicate topics`)
  return unique
}

/**
 * Calculate similarity between two strings (simple Jaccard similarity)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/))
  const words2 = new Set(str2.split(/\s+/))
  
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  
  return intersection.size / union.size
}

/**
 * Main function: Select best topics from all RSS feeds
 */
export async function selectTopics(maxTopics: number = 5): Promise<TopicSelectionResult> {
  const result: TopicSelectionResult = {
    success: true,
    topics: [],
    totalCollected: 0,
    totalSelected: 0,
    errors: [],
  }

  console.log('[TopicSelector] Starting topic selection...')

  try {
    // Step 1: Collect all RSS items
    const { items, errors: collectErrors } = await collectRssItems()
    result.errors.push(...collectErrors)
    result.totalCollected = items.length

    if (items.length === 0) {
      result.success = false
      result.errors.push('No RSS items collected')
      return result
    }

    // Step 2: Filter existing topics
    const newItems = await filterExistingTopics(items)
    
    if (newItems.length === 0) {
      result.errors.push('All topics already exist in database')
      return result
    }

    // Step 3: Score and rank topics using AI
    const scoredTopics = await scoreTopics(newItems, maxTopics * 2)

    // Step 4: Remove duplicates
    const uniqueTopics = removeDuplicates(scoredTopics)

    // Step 5: Return top topics
    result.topics = uniqueTopics.slice(0, maxTopics)
    result.totalSelected = result.topics.length
    result.success = result.topics.length > 0

    console.log(`[TopicSelector] Selected ${result.totalSelected} topics from ${result.totalCollected} collected`)

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Topic selection error: ${error}`)
    console.error('[TopicSelector] Error:', error)
    return result
  }
}

/**
 * Get topic selection settings from database
 */
export async function getTopicSelectionSettings(): Promise<{
  maxTopicsPerRun: number
  minScore: number
  preferredCategories: string[]
}> {
  try {
    const [maxTopicsSetting, minScoreSetting, categoriesSetting] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'max_topics_per_run' } }),
      prisma.systemSetting.findUnique({ where: { key: 'min_topic_score' } }),
      prisma.systemSetting.findUnique({ where: { key: 'preferred_categories' } }),
    ])

    return {
      maxTopicsPerRun: parseInt(maxTopicsSetting?.value || '5', 10),
      minScore: parseInt(minScoreSetting?.value || '60', 10),
      preferredCategories: categoriesSetting?.value?.split(',') || [],
    }
  } catch {
    return {
      maxTopicsPerRun: 5,
      minScore: 60,
      preferredCategories: [],
    }
  }
}
