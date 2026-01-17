import { prisma } from '@/lib/prisma'
import { fetchRssFeed } from '@/lib/rss'
import { generateArticle, determineCategory, isGeminiConfigured } from '@/lib/gemini'
import { generateArticleImage, getPlaceholderImage, isImagenConfigured } from '@/lib/imagen'
import { 
  downloadAndOptimizeImage, 
  shouldUseRssImage, 
  getImagePlacement 
} from '@/lib/image-optimizer'

/**
 * Content Engine Service
 * Handles automated content generation from RSS feeds
 * 
 * @version 4.0.0
 * @lastUpdated 14 January 2026
 * 
 * Changes in v4.0.0:
 * - Improved error handling and logging
 * - Added detailed image processing diagnostics
 * - Fixed image source selection logic
 * - Added fallback mechanisms for image failures
 * - Improved RSS image handling
 */

export interface ContentGenerationResult {
  success: boolean
  articlesCreated: number
  imagesGenerated: number
  imagesOptimized: number
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
 * Check if RSS image optimization is enabled
 */
async function isRssImageOptimizationEnabled(): Promise<boolean> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'enable_rss_image_optimization' },
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
    imagesOptimized: 0,
    errors: [],
  }

  console.log('[ContentEngine] Starting feed processing...')

  if (!isGeminiConfigured()) {
    result.success = false
    result.errors.push('Gemini API key is not configured')
    console.error('[ContentEngine] Gemini API key not configured')
    return result
  }

  try {
    // Get all active RSS feeds
    const feeds = await prisma.rssFeed.findMany({
      where: { isActive: true },
    })

    console.log(`[ContentEngine] Found ${feeds.length} active feeds`)

    if (feeds.length === 0) {
      result.errors.push('No active RSS feeds found')
      return result
    }

    // Get max articles per run
    const maxArticles = await getArticlesPerRun()
    let totalArticlesCreated = 0

    console.log(`[ContentEngine] Max articles per run: ${maxArticles}`)

    // Process each feed
    for (const feed of feeds) {
      // Check if we've reached the limit
      if (totalArticlesCreated >= maxArticles) {
        console.log(`[ContentEngine] Reached max articles limit (${maxArticles})`)
        break
      }

      try {
        console.log(`[ContentEngine] Processing feed: ${feed.name} (${feed.url})`)
        const remainingSlots = maxArticles - totalArticlesCreated
        const feedResult = await processFeed(feed.id, remainingSlots)
        result.articlesCreated += feedResult.articlesCreated
        result.imagesGenerated += feedResult.imagesGenerated
        result.imagesOptimized += feedResult.imagesOptimized
        result.errors.push(...feedResult.errors)
        totalArticlesCreated += feedResult.articlesCreated
      } catch (error) {
        const errorMsg = `Error processing feed ${feed.name}: ${error}`
        result.errors.push(errorMsg)
        console.error(`[ContentEngine] ${errorMsg}`)
      }
    }

    result.success = result.errors.length === 0
    console.log(`[ContentEngine] Completed. Articles: ${result.articlesCreated}, AI Images: ${result.imagesGenerated}, RSS Images: ${result.imagesOptimized}`)
    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Database error: ${error}`)
    console.error(`[ContentEngine] Database error: ${error}`)
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
    imagesOptimized: 0,
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

    console.log(`[ContentEngine] Fetching RSS from: ${feed.url}`)

    // Fetch RSS content
    const rssData = await fetchRssFeed(feed.url)
    if (!rssData || rssData.items.length === 0) {
      result.errors.push(`No items found in feed: ${feed.name}`)
      return result
    }

    console.log(`[ContentEngine] Found ${rssData.items.length} items in feed`)

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

    // Check settings
    const imageGenEnabled = await isImageGenerationEnabled()
    const imagenConfigured = await isImagenConfigured()
    const rssImageOptEnabled = await isRssImageOptimizationEnabled()

    console.log(`[ContentEngine] Settings - AI Image Gen: ${imageGenEnabled && imagenConfigured}, RSS Image Opt: ${rssImageOptEnabled}`)

    // Process each item (limited by maxArticles)
    const itemsToProcess = rssData.items.slice(0, maxArticles)

    for (const item of itemsToProcess) {
      try {
        console.log(`[ContentEngine] Processing item: ${item.title?.substring(0, 50)}...`)

        // Check if article already exists (by source link or similar title)
        const baseSlug = generateBaseSlug(item.title)
        const existingArticle = await prisma.article.findFirst({
          where: {
            OR: [
              { slug: { contains: baseSlug.substring(0, 30) } },
            ],
          },
        })

        if (existingArticle) {
          console.log(`[ContentEngine] Skipping existing article: ${item.title?.substring(0, 30)}...`)
          continue
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

        // Handle image selection and optimization
        let imageUrl: string | null = null
        let imageSource: 'ai' | 'rss' | 'placeholder' = 'placeholder'

        // Check if we should use RSS image
        const hasRssImage = !!item.imageUrl
        const useRssImage = shouldUseRssImage(category, hasRssImage)

        console.log(`[ContentEngine] Image decision for "${category}": hasRSS=${hasRssImage}, useRSS=${useRssImage}`)

        // Try RSS image first if appropriate
        if (useRssImage && item.imageUrl && rssImageOptEnabled) {
          console.log(`[ContentEngine] Attempting RSS image download: ${item.imageUrl}`)
          try {
            const optimizedResult = await downloadAndOptimizeImage(
              item.imageUrl,
              generatedContent.title
            )

            if (optimizedResult.success && optimizedResult.publicUrl) {
              imageUrl = optimizedResult.publicUrl
              imageSource = 'rss'
              result.imagesOptimized++
              console.log(`[ContentEngine] RSS image optimized: ${optimizedResult.originalSize} -> ${optimizedResult.optimizedSize} bytes`)
            } else {
              console.warn(`[ContentEngine] RSS image optimization failed: ${optimizedResult.error}`)
            }
          } catch (rssError) {
            console.error(`[ContentEngine] RSS image error: ${rssError}`)
          }
        }

        // If no RSS image or optimization failed, try AI generation
        if (!imageUrl && imageGenEnabled && imagenConfigured) {
          console.log(`[ContentEngine] Attempting AI image generation for: ${generatedContent.title.substring(0, 50)}...`)
          try {
            const imageResult = await generateArticleImage(
              generatedContent.title,
              category,
              generatedContent.content
            )

            if (imageResult.success && imageResult.imageUrl) {
              imageUrl = imageResult.imageUrl
              imageSource = 'ai'
              result.imagesGenerated++
              console.log(`[ContentEngine] AI image generated: ${imageUrl}`)
            } else {
              console.warn(`[ContentEngine] AI image generation failed: ${imageResult.error}`)
              if (imageResult.retryCount) {
                console.warn(`[ContentEngine] Retry count: ${imageResult.retryCount}`)
              }
            }
          } catch (aiError) {
            console.error(`[ContentEngine] AI image error: ${aiError}`)
          }
        }

        // Use placeholder if no image available
        if (!imageUrl) {
          imageUrl = getPlaceholderImage(category)
          imageSource = 'placeholder'
          console.log(`[ContentEngine] Using placeholder image: ${imageUrl}`)
        }

        // Get image placement recommendation
        const placement = getImagePlacement(category)
        console.log(`[ContentEngine] Image placement for ${category}: ${placement}`)

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
            imageSource,
            category,
            authorId: systemAuthor.id,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          },
        })

        result.articlesCreated++
        console.log(`[ContentEngine] Article created: ${generatedContent.title.substring(0, 50)}... (image: ${imageSource})`)
      } catch (error) {
        const errorMsg = `Error processing item "${item.title?.substring(0, 30)}...": ${error}`
        result.errors.push(errorMsg)
        console.error(`[ContentEngine] ${errorMsg}`)
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
    console.error(`[ContentEngine] Feed processing error: ${error}`)
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
    .replace(/^-|-$/g, '')
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
  isRssImageOptEnabled: boolean
  activeFeeds: number
  totalArticles: number
  lastGeneration: Date | null
  imageStats: {
    aiGenerated: number
    rssOptimized: number
    placeholder: number
  }
}> {
  const [
    activeFeeds, 
    totalArticles, 
    lastArticle, 
    imageGenEnabled,
    rssImageOptEnabled,
    aiImages,
    rssImages,
    placeholderImages
  ] = await Promise.all([
    prisma.rssFeed.count({ where: { isActive: true } }),
    prisma.article.count(),
    prisma.article.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    isImageGenerationEnabled(),
    isRssImageOptimizationEnabled(),
    prisma.article.count({ where: { imageSource: 'ai' } }),
    prisma.article.count({ where: { imageSource: 'rss' } }),
    prisma.article.count({ where: { OR: [{ imageSource: 'placeholder' }, { imageSource: null }] } }),
  ])

  return {
    isConfigured: await isGeminiConfigured(),
    isImageGenEnabled: imageGenEnabled,
    isRssImageOptEnabled: rssImageOptEnabled,
    activeFeeds,
    totalArticles,
    lastGeneration: lastArticle?.createdAt || null,
    imageStats: {
      aiGenerated: aiImages,
      rssOptimized: rssImages,
      placeholder: placeholderImages,
    },
  }
}
