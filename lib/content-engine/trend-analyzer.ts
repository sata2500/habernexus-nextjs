/**
 * Content Engine v3.0 - Trend Analyzer
 * 
 * @version 3.0.0
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

// Initialize Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
})

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
 * Check if a topic already exists as an article
 */
async function checkDuplicates(topics: Topic[]): Promise<Topic[]> {
  // Get recent article titles (last 7 days)
  const recentArticles = await prisma.article.findMany({
    where: {
      publishedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    select: { title: true, slug: true },
  })
  
  const existingTitles = new Set(
    recentArticles.map((a) => a.title.toLowerCase().trim())
  )
  const existingSlugs = new Set(recentArticles.map((a) => a.slug))
  
  // Filter out duplicates
  return topics.filter((topic) => {
    const titleLower = topic.title.toLowerCase().trim()
    const slug = topic.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100)
    
    // Check for exact title match
    if (existingTitles.has(titleLower)) {
      return false
    }
    
    // Check for similar slug
    if (existingSlugs.has(slug)) {
      return false
    }
    
    // Check for very similar titles (Levenshtein-like check)
    for (const existing of existingTitles) {
      if (titleLower.includes(existing) || existing.includes(titleLower)) {
        return false
      }
    }
    
    return true
  })
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
      const response = await genAI.models.generateContent({
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
            }
          }
        }
      }
      
      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Analyzed ${feedTopics.length} topics from feed, selected ${Math.min(limit, feedTopics.length)}`,
        data: { feedId, analyzed: feedTopics.length, selected: scoredTopics.filter(t => t.sourceFeedId === feedId).length },
      })
    } catch (error) {
      logs.push({
        timestamp: new Date(),
        level: 'error',
        message: `Error analyzing topics for feed ${feedId}`,
        data: { error: String(error) },
      })
      
      // Fallback: select first N topics without AI scoring
      const fallbackTopics = feedTopics.slice(0, limit).map((topic) => ({
        ...topic,
        trendScore: 50,
        trendReason: 'Otomatik seçim (AI analizi başarısız)',
        keywords: [],
      }))
      scoredTopics.push(...fallbackTopics)
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
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `Converted ${allTopics.length} RSS items to topics`,
  })
  
  // Check for duplicates
  const uniqueTopics = await checkDuplicates(allTopics)
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `${uniqueTopics.length} unique topics after duplicate check`,
  })
  
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
