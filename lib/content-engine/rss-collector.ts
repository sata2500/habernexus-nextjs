/**
 * Content Engine v3.0 - RSS Collector
 * 
 * @version 3.0.0
 * @lastUpdated 20 January 2026
 * 
 * This module handles RSS feed fetching and parsing.
 * It collects news items from active RSS feeds for trend analysis.
 */

import Parser from 'rss-parser'
import { prisma } from '@/lib/prisma'
import type { RssFeedItem, RssFeedWithItems, ImageMode, EngineLogEntry } from './types'

// Initialize RSS parser with custom fields
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
  timeout: 15000, // 15 second timeout
})

/**
 * Extract image URL from RSS item
 */
function extractImageUrl(item: Record<string, unknown>): string | undefined {
  // Try media:content
  if (item.mediaContent && Array.isArray(item.mediaContent)) {
    const media = item.mediaContent.find(
      (m: Record<string, unknown>) => m.$ && (m.$ as Record<string, string>).medium === 'image'
    )
    if (media && media.$ && (media.$ as Record<string, string>).url) {
      return (media.$ as Record<string, string>).url
    }
  }

  // Try media:thumbnail
  if (item.mediaThumbnail && typeof item.mediaThumbnail === 'object') {
    const thumb = item.mediaThumbnail as Record<string, unknown>
    if (thumb.$ && (thumb.$ as Record<string, string>).url) {
      return (thumb.$ as Record<string, string>).url
    }
  }

  // Try enclosure
  if (item.enclosure && typeof item.enclosure === 'object') {
    const enc = item.enclosure as Record<string, string>
    if (enc.url && enc.type?.startsWith('image/')) {
      return enc.url
    }
  }

  // Try to extract from content
  if (item.contentEncoded && typeof item.contentEncoded === 'string') {
    const imgMatch = item.contentEncoded.match(/<img[^>]+src="([^"]+)"/)
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]
    }
  }

  // Try to extract from description
  if (item.content && typeof item.content === 'string') {
    const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/)
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1]
    }
  }

  return undefined
}

/**
 * Parse RSS feed and extract items
 */
async function parseFeed(url: string): Promise<RssFeedItem[]> {
  try {
    const feed = await parser.parseURL(url)
    
    return feed.items.map((item) => ({
      title: (item.title as string) || '',
      link: (item.link as string) || '',
      description: (item.contentSnippet as string) || (item.content as string) || '',
      pubDate: item.pubDate ? new Date(item.pubDate as string) : undefined,
      imageUrl: extractImageUrl(item as unknown as Record<string, unknown>),
      category: (item.categories as string[])?.[0] || undefined,
      guid: (item.guid as string) || (item.link as string) || '',
    }))
  } catch (error) {
    console.error(`[RSSCollector] Error parsing feed ${url}:`, error)
    throw error
  }
}

/**
 * Collect items from all active RSS feeds
 */
export async function collectFromAllFeeds(
  logs: EngineLogEntry[] = []
): Promise<RssFeedWithItems[]> {
  const results: RssFeedWithItems[] = []
  
  // Get all active feeds
  const feeds = await prisma.rssFeed.findMany({
    where: { isActive: true },
    orderBy: { category: 'asc' },
  })
  
  logs.push({
    timestamp: new Date(),
    level: 'info',
    message: `Found ${feeds.length} active RSS feeds`,
  })
  
  // Process each feed
  for (const feed of feeds) {
    try {
      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Fetching feed: ${feed.name}`,
        data: { feedId: feed.id, url: feed.url },
      })
      
      const items = await parseFeed(feed.url)
      
      // Filter out items without title
      const validItems = items.filter((item) => item.title && item.title.trim().length > 0)
      
      results.push({
        feedId: feed.id,
        feedName: feed.name,
        feedUrl: feed.url,
        category: feed.category,
        topicsPerRun: feed.topicsPerRun,
        authorId: feed.authorId,
        imageMode: feed.imageMode as ImageMode,
        items: validItems,
        fetchedAt: new Date(),
      })
      
      // Update lastFetch
      await prisma.rssFeed.update({
        where: { id: feed.id },
        data: { lastFetch: new Date() },
      })
      
      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Fetched ${validItems.length} items from ${feed.name}`,
      })
    } catch (error) {
      logs.push({
        timestamp: new Date(),
        level: 'error',
        message: `Failed to fetch feed: ${feed.name}`,
        data: { feedId: feed.id, error: String(error) },
      })
    }
  }
  
  return results
}

/**
 * Collect items from a specific feed
 */
export async function collectFromFeed(
  feedId: string,
  logs: EngineLogEntry[] = []
): Promise<RssFeedWithItems | null> {
  const feed = await prisma.rssFeed.findUnique({
    where: { id: feedId },
  })
  
  if (!feed) {
    logs.push({
      timestamp: new Date(),
      level: 'error',
      message: `Feed not found: ${feedId}`,
    })
    return null
  }
  
  if (!feed.isActive) {
    logs.push({
      timestamp: new Date(),
      level: 'warn',
      message: `Feed is not active: ${feed.name}`,
    })
    return null
  }
  
  try {
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Fetching feed: ${feed.name}`,
      data: { feedId: feed.id, url: feed.url },
    })
    
    const items = await parseFeed(feed.url)
    const validItems = items.filter((item) => item.title && item.title.trim().length > 0)
    
    // Update lastFetch
    await prisma.rssFeed.update({
      where: { id: feed.id },
      data: { lastFetch: new Date() },
    })
    
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Fetched ${validItems.length} items from ${feed.name}`,
    })
    
    return {
      feedId: feed.id,
      feedName: feed.name,
      feedUrl: feed.url,
      category: feed.category,
      topicsPerRun: feed.topicsPerRun,
      authorId: feed.authorId,
      imageMode: feed.imageMode as ImageMode,
      items: validItems,
      fetchedAt: new Date(),
    }
  } catch (error) {
    logs.push({
      timestamp: new Date(),
      level: 'error',
      message: `Failed to fetch feed: ${feed.name}`,
      data: { feedId: feed.id, error: String(error) },
    })
    return null
  }
}

/**
 * Get total item count from feeds
 */
export function getTotalItemCount(feeds: RssFeedWithItems[]): number {
  return feeds.reduce((total, feed) => total + feed.items.length, 0)
}

/**
 * Check if RSS collector is properly configured
 */
export function isRssCollectorConfigured(): boolean {
  return true // RSS parser doesn't need external configuration
}
