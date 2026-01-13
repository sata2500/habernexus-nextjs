import { prisma } from '@/lib/prisma'
import { fetchRssFeed } from '@/lib/rss'
import { generateArticle, determineCategory, isGeminiConfigured } from '@/lib/gemini'
import { generateArticleImage, getPlaceholderImage, isImagenConfigured } from '@/lib/imagen'

/**
 * Content Engine Service
 * Handles automated content generation from RSS feeds
 * 
 * @version 2.0.0
 * @lastUpdated 13 January 2026
 */

export interface ContentGenerationResult {
  success: boolean
  articlesCreated: number
  imagesGenerated: number
  errors: string[]
}

/**
 * Get articles per run setting from database
 */
async function getArticlesPerRun(): Promise<number> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'articles_per_run' },
    })
    const value = parseInt(setting?.value || '5', 10)
    return Math.min(Math.max(value, 1), 20) // Clamp between 1 and 20
  } catch {
    return 5
  }
}

/**
 * Check if image generation is enabled
 */
async function isImageGenerationEnabled(): Promise<boolean> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'enable_image_generation' },
    })
    // Default to true if not set
    return setting?.value !== 'false'
  } catch {
    return true
  }
}

/**
 * Process all active RSS feeds and generate articles
 */
export async function processAllFeeds(): Promise<ContentGenerationResult> {
  const result: ContentGenerationResult = {
    success: true,
    articlesCreated: 0,
    imagesGenerated: 0,
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

    // Get max articles per run
    const maxArticles = await getArticlesPerRun()
    let totalArticlesCreated = 0

    // Process each feed
    for (const feed of feeds) {
      // Check if we've reached the limit
      if (totalArticlesCreated >= maxArticles) {
        console.log(`[ContentEngine] Reached max articles limit (${maxArticles})`)
        break
      }

      try {
        const remainingSlots = maxArticles - totalArticlesCreated
        const feedResult = await processFeed(feed.id, remainingSlots)
        result.articlesCreated += feedResult.articlesCreated
        result.imagesGenerated += feedResult.imagesGenerated
        result.errors.push(...feedResult.errors)
        totalArticlesCreated += feedResult.articlesCreated
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
export async function processFeed(
  feedId: string,
  maxArticles: number = 5
): Promise<ContentGenerationResult> {
  const result: ContentGenerationResult = {
    success: true,
    articlesCreated: 0,
    imagesGenerated: 0,
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

    // Check if image generation is enabled
    const imageGenEnabled = await isImageGenerationEnabled()
    const imagenConfigured = await isImagenConfigured()

    // Process each item (limited by maxArticles)
    const itemsToProcess = rssData.items.slice(0, maxArticles)

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

        // Generate or get image
        let imageUrl = item.imageUrl || null

        // Try to generate image with AI if enabled and no source image
        if (!imageUrl && imageGenEnabled && imagenConfigured) {
          console.log(`[ContentEngine] Generating image for: ${generatedContent.title}`)
          const imageResult = await generateArticleImage(
            generatedContent.title,
            category,
            generatedContent.content
          )

          if (imageResult.success && imageResult.imageUrl) {
            imageUrl = imageResult.imageUrl
            result.imagesGenerated++
            console.log(`[ContentEngine] Image generated: ${imageUrl}`)
          } else {
            console.warn(`[ContentEngine] Image generation failed: ${imageResult.error}`)
          }
        }

        // Use placeholder if no image available
        if (!imageUrl) {
          imageUrl = getPlaceholderImage(category)
        }

        // Ensure unique slug
        const uniqueSlug = await ensureUniqueSlug(generatedContent.slug)

        // Create article in database
        await prisma.article.create({
          data: {
            title: generatedContent.title,
            slug: uniqueSlug,
            content: generatedContent.content,
            excerpt: generatedContent.excerpt,
            imageUrl,
            category,
            authorId: systemAuthor.id,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          },
        })

        result.articlesCreated++
        console.log(`[ContentEngine] Article created: ${generatedContent.title}`)
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
  isImageGenEnabled: boolean
  activeFeeds: number
  totalArticles: number
  lastGeneration: Date | null
}> {
  const [activeFeeds, totalArticles, lastArticle, imageGenEnabled] = await Promise.all([
    prisma.rssFeed.count({ where: { isActive: true } }),
    prisma.article.count(),
    prisma.article.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    isImageGenerationEnabled(),
  ])

  return {
    isConfigured: isGeminiConfigured(),
    isImageGenEnabled: imageGenEnabled,
    activeFeeds,
    totalArticles,
    lastGeneration: lastArticle?.createdAt || null,
  }
}
