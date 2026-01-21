/**
 * Breaking News Detection and Management
 * 
 * @version 1.0.0
 * @lastUpdated 22 January 2026
 * 
 * Detects high-priority news topics and manages breaking news updates
 */

import { prisma } from '@/lib/prisma'
import type { ScoredTopic, EngineLogEntry } from './types'

// ============================================
// Types
// ============================================

export interface BreakingNewsSettings {
  enabled: boolean
  frequencyHours: number
  keywords: string[]
  autoDetect: boolean
}

export interface BreakingNewsTopic {
  topic: ScoredTopic
  priority: number // 1=low, 2=medium, 3=high
  reason: string
}

// ============================================
// Settings Management
// ============================================

/**
 * Get breaking news settings from database
 */
export async function getBreakingNewsSettings(): Promise<BreakingNewsSettings> {
  const [enabled, frequency, keywords, autoDetect] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { key: 'breaking_news_enabled' } }),
    prisma.systemSetting.findUnique({ where: { key: 'breaking_news_frequency_hours' } }),
    prisma.systemSetting.findUnique({ where: { key: 'breaking_news_keywords' } }),
    prisma.systemSetting.findUnique({ where: { key: 'breaking_news_auto_detect' } }),
  ])

  return {
    enabled: enabled?.value !== 'false',
    frequencyHours: parseInt(frequency?.value || '1'),
    keywords: (keywords?.value || 'son dakika,breaking,acil,şimdi,önemli').split(',').map(k => k.trim()),
    autoDetect: autoDetect?.value !== 'false',
  }
}

/**
 * Update breaking news settings
 */
export async function updateBreakingNewsSettings(
  settings: Partial<BreakingNewsSettings>
): Promise<void> {
  const updates = []

  if (settings.enabled !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'breaking_news_enabled' },
        update: { value: String(settings.enabled) },
        create: { key: 'breaking_news_enabled', value: String(settings.enabled) },
      })
    )
  }

  if (settings.frequencyHours !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'breaking_news_frequency_hours' },
        update: { value: String(settings.frequencyHours) },
        create: { key: 'breaking_news_frequency_hours', value: String(settings.frequencyHours) },
      })
    )
  }

  if (settings.keywords !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'breaking_news_keywords' },
        update: { value: settings.keywords.join(',') },
        create: { key: 'breaking_news_keywords', value: settings.keywords.join(',') },
      })
    )
  }

  if (settings.autoDetect !== undefined) {
    updates.push(
      prisma.systemSetting.upsert({
        where: { key: 'breaking_news_auto_detect' },
        update: { value: String(settings.autoDetect) },
        create: { key: 'breaking_news_auto_detect', value: String(settings.autoDetect) },
      })
    )
  }

  await Promise.all(updates)
}

// ============================================
// Detection
// ============================================

/**
 * Detect breaking news topics from a list of scored topics
 */
export async function detectBreakingNews(
  topics: ScoredTopic[],
  logs: EngineLogEntry[] = []
): Promise<BreakingNewsTopic[]> {
  const settings = await getBreakingNewsSettings()

  if (!settings.enabled || !settings.autoDetect) {
    logs.push({
      timestamp: new Date(),
      level: 'debug',
      message: 'Breaking news detection disabled',
    })
    return []
  }

  const breakingTopics: BreakingNewsTopic[] = []

  for (const topic of topics) {
    // Check for breaking news keywords in title and description
    const text = `${topic.title} ${topic.description}`.toLowerCase()
    
    const matchedKeywords = settings.keywords.filter(keyword =>
      text.includes(keyword.toLowerCase())
    )

    if (matchedKeywords.length > 0) {
      // Determine priority based on score and keyword matches
      let priority = 1 // Low priority by default
      
      if (topic.trendScore >= 90 || matchedKeywords.length >= 2) {
        priority = 3 // High priority
      } else if (topic.trendScore >= 80) {
        priority = 2 // Medium priority
      }

      breakingTopics.push({
        topic,
        priority,
        reason: `Keywords: ${matchedKeywords.join(', ')} | Score: ${topic.trendScore}`,
      })

      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Breaking news detected: ${topic.title}`,
        data: {
          priority,
          keywords: matchedKeywords,
          score: topic.trendScore,
        },
      })
    }
  }

  return breakingTopics
}

// ============================================
// Article Management
// ============================================

/**
 * Mark an article as breaking news
 */
export async function markAsBreakingNews(
  articleId: string,
  priority: number = 1
): Promise<void> {
  await prisma.article.update({
    where: { id: articleId },
    data: {
      isBreakingNews: true,
      breakingPriority: priority,
      lastUpdatedAt: new Date(),
    },
  })
}

/**
 * Unmark an article as breaking news
 */
export async function unmarkAsBreakingNews(articleId: string): Promise<void> {
  await prisma.article.update({
    where: { id: articleId },
    data: {
      isBreakingNews: false,
      breakingPriority: 0,
    },
  })
}

/**
 * Update a breaking news article (increment update count)
 */
export async function updateBreakingNewsArticle(articleId: string): Promise<void> {
  await prisma.article.update({
    where: { id: articleId },
    data: {
      lastUpdatedAt: new Date(),
      updateCount: { increment: 1 },
    },
  })
}

/**
 * Get all breaking news articles
 */
export async function getBreakingNews(limit: number = 10) {
  return await prisma.article.findMany({
    where: { isBreakingNews: true },
    orderBy: [
      { breakingPriority: 'desc' },
      { lastUpdatedAt: 'desc' },
    ],
    take: limit,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

/**
 * Get breaking news that need updates
 * (based on frequency setting)
 */
export async function getBreakingNewsNeedingUpdates(): Promise<string[]> {
  const settings = await getBreakingNewsSettings()
  
  if (!settings.enabled) {
    return []
  }

  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - settings.frequencyHours)

  const articles = await prisma.article.findMany({
    where: {
      isBreakingNews: true,
      OR: [
        { lastUpdatedAt: null },
        { lastUpdatedAt: { lt: cutoffTime } },
      ],
    },
    select: { id: true },
  })

  return articles.map(a => a.id)
}
