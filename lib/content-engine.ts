import { prisma } from '@/lib/prisma'
import { fetchRssFeed } from '@/lib/rss'
import { generateArticle, determineCategory, isGeminiConfigured } from '@/lib/gemini'

/**
 * Content Engine Service
 * Handles automated content generation from RSS feeds
 */

export interface ContentGenerationResult {
  success: boolean
  articlesCreated: number
  errors: string[]
}

/**
 * Process all active RSS feeds and generate articles
 */
export async function processAllFeeds(): Promise<ContentGenerationResult> {
  const result: ContentGenerationResult = {
    success: true,
    articlesCreated: 0,
    errors: [],
  }

  if (!isGeminiConfigured()) {
    result.success = false
    result.errors.push('Gemini API key is not configured')
    return result
  }

  try {
    // Get all active RSS feeds
    const feeds = await prisma.rssFeed.findMany({
      where: { isActive: true },
    })

    if (feeds.length === 0) {
      result.errors.push('No active RSS feeds found')
      return result
    }

    // Process each feed
    for (const feed of feeds) {
      try {
        const feedResult = await processFeed(feed.id)
        result.articlesCreated += feedResult.articlesCreated
        result.errors.push(...feedResult.errors)
      } catch (error) {
        result.errors.push(`Error processing feed ${feed.name}: ${error}`)
      }
    }

    result.success = result.errors.length === 0
    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Database error: ${error}`)
    return result
  }
}

/**
 * Process a single RSS feed
 */
export async function processFeed(feedId: string): Promise<ContentGenerationResult> {
  const result: ContentGenerationResult = {
    success: true,
    articlesCreated: 0,
    errors: [],
  }

  try {
    // Get feed from database
    const feed = await prisma.rssFeed.findUnique({
      where: { id: feedId },
    })

    if (!feed) {
      result.success = false
      result.errors.push('Feed not found')
      return result
    }

    // Fetch RSS content
    const rssData = await fetchRssFeed(feed.url)
    if (!rssData || rssData.items.length === 0) {
      result.errors.push(`No items found in feed: ${feed.name}`)
      return result
    }

    // Get system author (first admin user or create one)
    let systemAuthor = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (!systemAuthor) {
      systemAuthor = await prisma.user.create({
        data: {
          email: 'system@habernexus.com',
          name: 'HaberNexus AI',
          role: 'ADMIN',
        },
      })
    }

    // Process each item (limit to 5 per run to avoid rate limits)
    const itemsToProcess = rssData.items.slice(0, 5)

    for (const item of itemsToProcess) {
      try {
        // Check if article already exists (by source link or similar title)
        const existingArticle = await prisma.article.findFirst({
          where: {
            OR: [
              { slug: { contains: generateBaseSlug(item.title) } },
            ],
          },
        })

        if (existingArticle) {
          continue // Skip existing articles
        }

        // Generate article content using AI
        const generatedContent = await generateArticle(
          item.title,
          item.content || item.description,
          feed.category
        )

        // Determine category if not set
        const category = feed.category || await determineCategory(
          generatedContent.title,
          generatedContent.content
        )

        // Ensure unique slug
        const uniqueSlug = await ensureUniqueSlug(generatedContent.slug)

        // Create article in database
        await prisma.article.create({
          data: {
            title: generatedContent.title,
            slug: uniqueSlug,
            content: generatedContent.content,
            excerpt: generatedContent.excerpt,
            imageUrl: item.imageUrl || '/images/placeholder.jpg',
            category,
            authorId: systemAuthor.id,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          },
        })

        result.articlesCreated++
      } catch (error) {
        result.errors.push(`Error processing item "${item.title}": ${error}`)
      }
    }

    // Update feed's last fetch time
    await prisma.rssFeed.update({
      where: { id: feedId },
      data: { lastFetch: new Date() },
    })

    result.success = result.errors.length === 0
    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Error: ${error}`)
    return result
  }
}

/**
 * Generate base slug from title
 */
function generateBaseSlug(title: string): string {
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
    .substring(0, 50)
}

/**
 * Ensure slug is unique in database
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug },
    })

    if (!existing) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++

    if (counter > 100) {
      // Fallback: add timestamp
      return `${baseSlug}-${Date.now()}`
    }
  }
}

/**
 * Get content engine status
 */
export async function getEngineStatus(): Promise<{
  isConfigured: boolean
  activeFeeds: number
  totalArticles: number
  lastGeneration: Date | null
}> {
  const [activeFeeds, totalArticles, lastArticle] = await Promise.all([
    prisma.rssFeed.count({ where: { isActive: true } }),
    prisma.article.count(),
    prisma.article.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ])

  return {
    isConfigured: isGeminiConfigured(),
    activeFeeds,
    totalArticles,
    lastGeneration: lastArticle?.createdAt || null,
  }
}
