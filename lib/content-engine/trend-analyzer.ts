/**
 * Content Engine v3.0 - Trend Analyzer
 * 
 * @version 3.0.1
 * @lastUpdated 20 January 2026
 * 
 * This module analyzes RSS feed items and selects trending topics
 * using AI to determine which topics are most relevant and engaging.
 */

import { GoogleGenAI } from '@google/genai'
import { prisma } from '@/lib/prisma'
import type {
  RssFeedWithItems,
  Topic,
  ScoredTopic,
  TopicSelectionResult,
  EngineLogEntry,
} from './types'

// Initialize Gemini client dynamically to support runtime API key changes
function getGenAI() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
  })
}

/**
 * Convert RSS items to topics
 */
function itemsToTopics(feeds: RssFeedWithItems[]): Topic[] {
  const topics: Topic[] = []
  
  for (const feed of feeds) {
    for (const item of feed.items) {
      topics.push({
        title: item.title,
        description: item.description || '',
        sourceUrl: item.link,
        sourceImageUrl: item.imageUrl,
        sourceFeedId: feed.feedId,
        sourceFeedName: feed.feedName,
        category: feed.category,
        authorId: feed.authorId,
        imageMode: feed.imageMode,
        pubDate: item.pubDate,
      })
    }
  }
  
  return topics
}

/**
 * Calculate similarity ratio between two strings
 * Returns a value between 0 and 1 (1 = identical)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1
  if (s1.length === 0 || s2.length === 0) return 0
  
  // Simple word overlap similarity
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 3))
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 3))
  
  if (words1.size === 0 || words2.size === 0) return 0
  
  let overlap = 0
  for (const word of words1) {
    if (words2.has(word)) overlap++
  }
  
  return overlap / Math.max(words1.size, words2.size)
}

/**
 * Check if a topic already exists as an article
 * Uses a more lenient duplicate detection algorithm
 */
async function checkDuplicates(
  topics: Topic[],
  logs: EngineLogEntry[]
): Promise<{ uniqueTopics: Topic[]; duplicateCount: number; reason: string }> {
  // Get recent article titles (last 7 days)
  const recentArticles = await prisma.article.findMany({
    where: {
      publishedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    select: { title: true, slug: true },
  })
  
  // If no recent articles, all topics are unique
  if (recentArticles.length === 0) {
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'No recent articles found, all topics are considered unique',
    })
    return {
      uniqueTopics: topics,
      duplicateCount: 0,
      reason: 'no_recent_articles',
    }
  }
  
  const existingTitles = recentArticles.map((a) => a.title.toLowerCase().trim())
  const existingSlugs = new Set(recentArticles.map((a) => a.slug))
  
  const uniqueTopics: Topic[] = []
  let duplicateCount = 0
  
  // Filter out duplicates with more lenient checking
  for (const topic of topics) {
    const titleLower = topic.title.toLowerCase().trim()
    const slug = topic.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100)
    
    let isDuplicate = false
    let duplicateReason = ''
    
    // Check for exact title match
    if (existingTitles.includes(titleLower)) {
      isDuplicate = true
      duplicateReason = 'exact_title_match'
    }
    
    // Check for similar slug
    if (!isDuplicate && existingSlugs.has(slug)) {
      isDuplicate = true
      duplicateReason = 'slug_match'
    }
    
    // Check for high similarity (threshold: 0.7 = 70% similar)
    // This is more lenient than the previous substring check
    if (!isDuplicate) {
      for (const existing of existingTitles) {
        const similarity = calculateSimilarity(titleLower, existing)
        if (similarity >= 0.7) {
          isDuplicate = true
          duplicateReason = `high_similarity (${Math.round(similarity * 100)}%)`
          break
        }
      }
    }
    
    if (isDuplicate) {
      duplicateCount++
      logs.push({
        timestamp: new Date(),
        level: 'debug',
        message: `Duplicate topic filtered: "${topic.title.substring(0, 50)}..." (${duplicateReason})`,
      })
    } else {
      uniqueTopics.push(topic)
    }
  }
  
  return {
    uniqueTopics,
    duplicateCount,
    reason: duplicateCount > 0 ? 'duplicates_found' : 'all_unique',
  }
}

/**
 * Score topics using AI for trend analysis
 */
async function scoreTrendingTopics(
  topics: Topic[],
  topicsPerFeed: Map<string, number>,
  logs: EngineLogEntry[]
): Promise<ScoredTopic[]> {
  if (topics.length === 0) {
    logs.push({
      timestamp: new Date(),
      level: 'warn',
      message: 'No topics available for AI scoring',
    })
    return []
  }
  
  // Group topics by feed
  const topicsByFeed = new Map<string, Topic[]>()
  for (const topic of topics) {
    const feedTopics = topicsByFeed.get(topic.sourceFeedId) || []
    feedTopics.push(topic)
    topicsByFeed.set(topic.sourceFeedId, feedTopics)
  }
  
  const scoredTopics: ScoredTopic[] = []
  
  // Process each feed's topics
  for (const [feedId, feedTopics] of topicsByFeed) {
    const limit = topicsPerFeed.get(feedId) || 2
    
    if (feedTopics.length === 0) continue
    
    // Prepare topics for AI analysis
    const topicList = feedTopics.slice(0, 20).map((t, i) => ({
      index: i,
      title: t.title,
      description: t.description?.substring(0, 200) || '',
    }))
    
    const prompt = `Sen bir haber editörüsün. Aşağıdaki haber başlıklarını analiz et ve Google'da en çok ilgi görecek, trend olma potansiyeli en yüksek ${limit} haberi seç.

HABER BAŞLIKLARI:
${topicList.map((t) => `${t.index}. ${t.title}`).join('\n')}

GÖREV:
1. Her haberin trend potansiyelini değerlendir
2. En ilgi çekici ${limit} haberi seç
3. Her seçim için trend skoru (0-100) ve kısa açıklama ver
4. Anahtar kelimeleri belirle

SEÇİM KRİTERLERİ:
- Güncellik ve zamanlılık
- Toplumsal ilgi ve etki
- Arama potansiyeli
- Özgünlük ve haber değeri

ÇIKTI FORMATI (JSON):
{
  "selections": [
    {
      "index": 0,
      "trendScore": 85,
      "reason": "Neden trend olacağının kısa açıklaması",
      "keywords": ["anahtar", "kelimeler"]
    }
  ]
}`

    try {
      let selectedCount = 0
      
      try {
        const response = await getGenAI().models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        })
        
        const text = response.text || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0])
            
            if (result.selections && Array.isArray(result.selections)) {
              for (const selection of result.selections) {
                const topic = feedTopics[selection.index]
                if (topic) {
                  scoredTopics.push({
                    ...topic,
                    trendScore: selection.trendScore || 50,
                    trendReason: selection.reason || '',
                    keywords: selection.keywords || [],
                  })
                  selectedCount++
                }
              }
            }
          } catch (parseError) {
            logs.push({
              timestamp: new Date(),
              level: 'warn',
              message: `Failed to parse AI response for feed ${feedId}, using fallback`,
              data: { error: String(parseError) },
            })
            throw parseError
          }
        } else {
          logs.push({
            timestamp: new Date(),
            level: 'warn',
            message: `No JSON found in AI response for feed ${feedId}, using fallback`,
          })
          throw new Error('No JSON in response')
        }
      } catch (apiError) {
        logs.push({
          timestamp: new Date(),
          level: 'warn',
          message: `AI API error for feed ${feedId}, switching to fallback selection`,
          data: { error: String(apiError) },
        })
        
        // Fallback: select first N topics without AI scoring
        const fallbackTopics = feedTopics.slice(0, limit).map((topic) => ({
          ...topic,
          trendScore: 50,
          trendReason: 'Otomatik seçim (AI analizi başarısız)',
          keywords: [],
        }))
        scoredTopics.push(...fallbackTopics)
        selectedCount = fallbackTopics.length
      }
      
      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Analyzed ${feedTopics.length} topics from feed, selected ${selectedCount}`,
        data: { feedId, analyzed: feedTopics.length, selected: selectedCount },
      })
    } catch (error) {
      logs.push({
        timestamp: new Date(),
        level: 'error',
        message: `Critical error analyzing topics for feed ${feedId}`,
        data: { error: String(error) },
      })
      
      // Emergency fallback: select first N topics
      const emergencyFallback = feedTopics.slice(0, Math.max(1, limit)).map((topic) => ({
        ...topic,
        trendScore: 50,
        trendReason: 'Acil otomatik seçim',
        keywords: [],
      }))
      scoredTopics.push(...emergencyFallback)
    }
    
    // Small delay between API calls
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  
  return scoredTopics
}

/**
 * Main function: Analyze feeds and select trending topics
 */
export async function analyzeTrends(
  feeds: RssFeedWithItems[],
  logs: EngineLogEntry[] = []
): Promise<TopicSelectionResult> {
  const startTime = Date.now()
  
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `Starting trend analysis for ${feeds.length} feeds`,
  })
  
  // Convert items to topics
  const allTopics = itemsToTopics(feeds)
  
  // Early check: if no topics from feeds
  if (allTopics.length === 0) {
    logs.push({
      timestamp: new Date(),
      level: 'warn',
      message: 'No topics found in RSS feeds. Please check if feeds have content.',
    })
    
    return {
      selectedTopics: [],
      totalTopicsAnalyzed: 0,
      selectionDuration: Date.now() - startTime,
      error: 'RSS kaynaklarından hiç konu bulunamadı. Lütfen RSS feed\'lerinizin aktif ve içerik içerdiğinden emin olun.',
    }
  }
  
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `Converted ${allTopics.length} RSS items to topics`,
  })
  
  // Check for duplicates with improved algorithm
  const duplicateResult = await checkDuplicates(allTopics, logs)
  const uniqueTopics = duplicateResult.uniqueTopics
  
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `${uniqueTopics.length} unique topics after duplicate check (${duplicateResult.duplicateCount} duplicates filtered)`,
  })
  
  // If all topics are duplicates, return with helpful error message
  if (uniqueTopics.length === 0) {
    logs.push({
      timestamp: new Date(),
      level: 'warn',
      message: 'All topics were filtered as duplicates',
      data: {
        totalTopics: allTopics.length,
        duplicateCount: duplicateResult.duplicateCount,
      },
    })
    
    return {
      selectedTopics: [],
      totalTopicsAnalyzed: allTopics.length,
      selectionDuration: Date.now() - startTime,
      error: `Tüm konular (${allTopics.length} adet) son 7 gün içinde yayınlanan makalelerle benzer olduğu için filtrelendi. Yeni içerik için RSS kaynaklarının güncellenmesini bekleyin veya farklı RSS kaynakları ekleyin.`,
    }
  }
  
  // Build topicsPerFeed map
  const topicsPerFeed = new Map<string, number>()
  for (const feed of feeds) {
    topicsPerFeed.set(feed.feedId, feed.topicsPerRun)
  }
  
  // Score and select trending topics
  const selectedTopics = await scoreTrendingTopics(uniqueTopics, topicsPerFeed, logs)
  
  // Sort by trend score
  selectedTopics.sort((a, b) => b.trendScore - a.trendScore)
  
  const duration = Date.now() - startTime
  
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `Trend analysis completed in ${duration}ms`,
    data: {
      totalTopics: allTopics.length,
      uniqueTopics: uniqueTopics.length,
      selectedTopics: selectedTopics.length,
    },
  })
  
  return {
    selectedTopics,
    totalTopicsAnalyzed: allTopics.length,
    selectionDuration: duration,
  }
}

/**
 * Check if trend analyzer is properly configured
 */
export function isTrendAnalyzerConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}
