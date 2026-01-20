/**
 * Content Engine v3.0 - Main Orchestrator
 * 
 * @version 3.0.0
 * @lastUpdated 20 January 2026
 * 
 * This is the main entry point for the Content Engine v3.0 system.
 * It orchestrates the entire content generation pipeline:
 * 1. RSS Collection
 * 2. Trend Analysis
 * 3. Article Generation
 * 4. Image Handling
 * 5. Database Storage
 */

import { prisma } from '@/lib/prisma'
import { collectFromAllFeeds, collectFromFeed } from './rss-collector'
import { analyzeTrends } from './trend-analyzer'
import { generateArticles } from './article-generator'
import { handleImage } from './image-handler'
import {
  DEFAULT_SETTINGS,
  type EngineConfig,
  type EngineRunResult,
  type EngineRunStats,
  type EngineLogEntry,
  type ContentEngineSettings,
} from './types'

// Re-export types
export * from './types'

// Re-export modules
export { collectFromAllFeeds, collectFromFeed } from './rss-collector'
export { analyzeTrends } from './trend-analyzer'
export { generateArticle, generateArticles, generateSummary } from './article-generator'
export { handleImage, generateContentImages } from './image-handler'

/**
 * Get content engine settings from database
 */
export async function getSettings(): Promise<ContentEngineSettings> {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        startsWith: 'content_engine_',
      },
    },
  })
  
  const settingsMap = new Map(settings.map((s) => [s.key, s.value]))
  
  return {
    contentModel: settingsMap.get('content_engine_content_model') || DEFAULT_SETTINGS.contentModel,
    imageModel: settingsMap.get('content_engine_image_model') || DEFAULT_SETTINGS.imageModel,
    summaryModel: settingsMap.get('content_engine_summary_model') || DEFAULT_SETTINGS.summaryModel,
    defaultTopicsPerFeed: parseInt(settingsMap.get('content_engine_topics_per_feed') || String(DEFAULT_SETTINGS.defaultTopicsPerFeed)),
    maxConcurrentGenerations: parseInt(settingsMap.get('content_engine_max_concurrent') || String(DEFAULT_SETTINGS.maxConcurrentGenerations)),
    defaultImageMode: (settingsMap.get('content_engine_image_mode') as ContentEngineSettings['defaultImageMode']) || DEFAULT_SETTINGS.defaultImageMode,
    imageQuality: parseInt(settingsMap.get('content_engine_image_quality') || String(DEFAULT_SETTINGS.imageQuality)),
    imageMaxWidth: parseInt(settingsMap.get('content_engine_image_max_width') || String(DEFAULT_SETTINGS.imageMaxWidth)),
    summaryCacheDays: parseInt(settingsMap.get('content_engine_summary_cache_days') || String(DEFAULT_SETTINGS.summaryCacheDays)),
    cronSchedule: settingsMap.get('content_engine_cron_schedule') || DEFAULT_SETTINGS.cronSchedule,
    isScheduleEnabled: settingsMap.get('content_engine_schedule_enabled') === 'true',
  }
}

/**
 * Update content engine settings
 */
export async function updateSettings(
  updates: Partial<ContentEngineSettings>
): Promise<void> {
  const keyMap: Record<keyof ContentEngineSettings, string> = {
    contentModel: 'content_engine_content_model',
    imageModel: 'content_engine_image_model',
    summaryModel: 'content_engine_summary_model',
    defaultTopicsPerFeed: 'content_engine_topics_per_feed',
    maxConcurrentGenerations: 'content_engine_max_concurrent',
    defaultImageMode: 'content_engine_image_mode',
    imageQuality: 'content_engine_image_quality',
    imageMaxWidth: 'content_engine_image_max_width',
    summaryCacheDays: 'content_engine_summary_cache_days',
    cronSchedule: 'content_engine_cron_schedule',
    isScheduleEnabled: 'content_engine_schedule_enabled',
  }
  
  for (const [key, value] of Object.entries(updates)) {
    const dbKey = keyMap[key as keyof ContentEngineSettings]
    if (dbKey) {
      await prisma.systemSetting.upsert({
        where: { key: dbKey },
        update: { value: String(value) },
        create: { key: dbKey, value: String(value) },
      })
    }
  }
}

/**
 * Check if engine is currently running
 */
export async function isEngineRunning(): Promise<boolean> {
  const runningRun = await prisma.contentEngineRun.findFirst({
    where: { status: 'running' },
  })
  return !!runningRun
}

/**
 * Get last engine run
 */
export async function getLastRun(): Promise<{
  id: string
  status: string
  startedAt: Date
  completedAt: Date | null
  stats: EngineRunStats
} | null> {
  const lastRun = await prisma.contentEngineRun.findFirst({
    orderBy: { startedAt: 'desc' },
  })
  
  if (!lastRun) return null
  
  return {
    id: lastRun.id,
    status: lastRun.status,
    startedAt: lastRun.startedAt,
    completedAt: lastRun.completedAt,
    stats: {
      feedsProcessed: lastRun.feedsProcessed,
      topicsFound: lastRun.topicsFound,
      topicsSelected: lastRun.topicsSelected,
      articlesCreated: lastRun.articlesCreated,
      imagesGenerated: lastRun.imagesGenerated,
      errors: lastRun.errorMessage ? [lastRun.errorMessage] : [],
    },
  }
}

/**
 * Main function: Run the content engine
 */
export async function runContentEngine(
  config: EngineConfig = { mode: 'full' },
  triggeredBy?: string
): Promise<EngineRunResult> {
  const logs: EngineLogEntry[] = []
  const startTime = Date.now()
  
  // Check if already running
  if (await isEngineRunning()) {
    return {
      runId: '',
      status: 'failed',
      mode: config.mode,
      stats: {
        feedsProcessed: 0,
        topicsFound: 0,
        topicsSelected: 0,
        articlesCreated: 0,
        imagesGenerated: 0,
        errors: ['Content engine is already running'],
      },
      startedAt: new Date(),
    }
  }
  
  // Create run record
  const run = await prisma.contentEngineRun.create({
    data: {
      status: 'running',
      mode: config.mode,
      triggeredBy,
    },
  })
  
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `Content Engine v3.0 started`,
    data: { runId: run.id, mode: config.mode },
  })
  
  const stats: EngineRunStats = {
    feedsProcessed: 0,
    topicsFound: 0,
    topicsSelected: 0,
    articlesCreated: 0,
    imagesGenerated: 0,
    errors: [],
  }
  
  const createdArticles: { id: string; title: string; slug: string; category: string }[] = []
  
  try {
    // Step 1: Collect RSS feeds
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Step 1: Collecting RSS feeds',
    })
    
    const feeds = config.feedId
      ? await collectFromFeed(config.feedId, logs).then((f) => (f ? [f] : []))
      : await collectFromAllFeeds(logs)
    
    stats.feedsProcessed = feeds.length
    
    if (feeds.length === 0) {
      throw new Error('No active feeds found')
    }
    
    // Step 2: Analyze trends and select topics
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Step 2: Analyzing trends',
    })
    
    const trendResult = await analyzeTrends(feeds, logs)
    stats.topicsFound = trendResult.totalTopicsAnalyzed
    stats.topicsSelected = trendResult.selectedTopics.length
    
    if (trendResult.selectedTopics.length === 0) {
      // Use the detailed error message from trend analyzer if available
      const errorMessage = trendResult.error || 'İçerik üretimi için konu seçilemedi. RSS kaynaklarınızı kontrol edin.'
      throw new Error(errorMessage)
    }
    
    // Preview mode: Stop here
    if (config.mode === 'preview') {
      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: 'Preview mode: Stopping before content generation',
      })
      
      await prisma.contentEngineRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          duration: Math.round((Date.now() - startTime) / 1000),
          feedsProcessed: stats.feedsProcessed,
          topicsFound: stats.topicsFound,
          topicsSelected: stats.topicsSelected,
          logs: JSON.stringify(logs),
        },
      })
      
      return {
        runId: run.id,
        status: 'completed',
        mode: config.mode,
        stats,
        startedAt: run.startedAt,
        completedAt: new Date(),
        duration: Math.round((Date.now() - startTime) / 1000),
      }
    }
    
    // Step 3: Generate articles
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Step 3: Generating articles',
    })
    
    const settings = await getSettings()
    const articleResults = await generateArticles(
      trendResult.selectedTopics,
      settings.maxConcurrentGenerations,
      logs
    )
    
    // Step 4: Process each successful article
    for (const result of articleResults) {
      if (!result.success || !result.content) {
        stats.errors.push(`Article generation failed: ${result.error}`)
        continue
      }
      
      try {
        // Handle image
        logs.push({
          timestamp: new Date(),
          level: 'info',
          message: `Step 4: Handling image for: ${result.content.title}`,
        })
        
        const imageResult = config.skipImageGeneration
          ? { success: true, imageUrl: '/images/placeholder-news.webp', imageSource: 'placeholder' as const, mode: 'auto' as const, generationDuration: 0 }
          : await handleImage(result.topic, result.content.slug, logs)
        
        if (imageResult.success && imageResult.imageSource !== 'placeholder') {
          stats.imagesGenerated++
        }
        
        // Skip database save in dry run mode
        if (config.dryRun) {
          createdArticles.push({
            id: 'dry-run',
            title: result.content.title,
            slug: result.content.slug,
            category: result.topic.category,
          })
          stats.articlesCreated++
          continue
        }
        
        // Get author ID (from feed or default admin)
        let authorId = result.topic.authorId
        if (!authorId) {
          const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
          })
          authorId = adminUser?.id || ''
        }
        
        if (!authorId) {
          throw new Error('No author available for article')
        }
        
        // Save article to database
        const article = await prisma.article.create({
          data: {
            title: result.content.title,
            slug: result.content.slug,
            content: result.content.content,
            excerpt: result.content.excerpt,
            imageUrl: imageResult.imageUrl,
            imageSource: imageResult.imageSource,
            category: result.topic.category,
            sentiment: result.content.sentiment,
            sentimentScore: result.content.sentimentScore,
            authorId,
            sourceFeedId: result.topic.sourceFeedId,
            researchSources: JSON.stringify(result.content.researchSources),
          },
        })
        
        createdArticles.push({
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category,
        })
        
        stats.articlesCreated++
        
        logs.push({
          timestamp: new Date(),
          level: 'info',
          message: `Article created: ${article.title}`,
          data: { articleId: article.id, slug: article.slug },
        })
      } catch (error) {
        stats.errors.push(`Failed to save article: ${error}`)
        logs.push({
          timestamp: new Date(),
          level: 'error',
          message: `Failed to save article: ${result.content.title}`,
          data: { error: String(error) },
        })
      }
    }
    
    // Update run record
    await prisma.contentEngineRun.update({
      where: { id: run.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        duration: Math.round((Date.now() - startTime) / 1000),
        feedsProcessed: stats.feedsProcessed,
        topicsFound: stats.topicsFound,
        topicsSelected: stats.topicsSelected,
        articlesCreated: stats.articlesCreated,
        imagesGenerated: stats.imagesGenerated,
        logs: JSON.stringify(logs),
      },
    })
    
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Content Engine completed successfully`,
      data: { ...stats },
    })
    
    return {
      runId: run.id,
      status: 'completed',
      mode: config.mode,
      stats,
      startedAt: run.startedAt,
      completedAt: new Date(),
      duration: Math.round((Date.now() - startTime) / 1000),
      articles: createdArticles,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    stats.errors.push(errorMessage)
    
    logs.push({
      timestamp: new Date(),
      level: 'error',
      message: `Content Engine failed: ${errorMessage}`,
    })
    
    // Update run record with failure
    await prisma.contentEngineRun.update({
      where: { id: run.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        duration: Math.round((Date.now() - startTime) / 1000),
        feedsProcessed: stats.feedsProcessed,
        topicsFound: stats.topicsFound,
        topicsSelected: stats.topicsSelected,
        articlesCreated: stats.articlesCreated,
        imagesGenerated: stats.imagesGenerated,
        errorMessage,
        logs: JSON.stringify(logs),
      },
    })
    
    return {
      runId: run.id,
      status: 'failed',
      mode: config.mode,
      stats,
      startedAt: run.startedAt,
      completedAt: new Date(),
      duration: Math.round((Date.now() - startTime) / 1000),
      articles: createdArticles,
    }
  }
}

/**
 * Check if content engine is properly configured
 */
export function isContentEngineConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY
}
