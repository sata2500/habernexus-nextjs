import { prisma } from '@/lib/prisma'
import { fetchRssFeed } from '@/lib/rss'
import { generateArticle, determineCategory, isGeminiConfigured } from '@/lib/gemini'
import { generateImage, getPlaceholderImage, isImageGenerationConfigured } from '@/lib/image-generator'
import { downloadAndOptimizeImage, shouldUseRssImage, getImagePlacement } from '@/lib/image-optimizer'
import { selectTopics, getTopicSelectionSettings } from '@/lib/topic-selector'
import { researchTopic, researchTopics, isResearchAgentConfigured } from '@/lib/research-agent'
import type { ResearchResult } from '@/lib/research-agent'
import { synthesizeContent, synthesizeMultiple } from '@/lib/content-synthesizer'

/**
 * Unified Content Engine Service
 * 
 * Consolidates both simple and advanced content generation into a single,
 * configurable system with multiple operation modes.
 * 
 * @version 2.0.0
 * @lastUpdated 20 January 2026
 * 
 * Changes in v2.0.0:
 * - Integrated unified image-generator module
 * - Support for both Imagen 4.0 and Nano Banana Pro
 * - Improved error handling and logging
 * - Optimized pipeline performance
 * 
 * Modes:
 * - quick: Direct RSS to article conversion (fast, simple)
 * - standard: Full pipeline with research (comprehensive, high-quality)
 * - preview: Topic selection only (no content generation)
 * - test: Single topic full pipeline (for testing)
 */

// ============================================
// Types and Interfaces
// ============================================

// Note: 'quick' mode is deprecated and redirects to 'standard'
export type ContentEngineMode = 'quick' | 'standard' | 'preview' | 'test'

export interface PipelineStage {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startTime?: number
  endTime?: number
  details?: string
}

export interface TopicPreview {
  title: string
  description: string
  category: string
  score: number
  reasoning: string
  keywords: string[]
  sourceFeed: string
}

export interface ArticleResult {
  title: string
  slug: string
  category: string
  qualityScore: number
  imageSource: 'ai' | 'rss' | 'placeholder'
}

export interface ContentEngineResult {
  success: boolean
  mode: ContentEngineMode
  stages: PipelineStage[]
  
  // Topic stats
  topicsCollected: number
  topicsSelected: number
  topics?: TopicPreview[]
  
  // Research stats (standard mode only)
  topicsResearched: number
  
  // Article stats
  articlesGenerated: number
  articlesPublished: number
  articles: ArticleResult[]
  
  // Image stats
  imagesGenerated: number
  imagesOptimized: number
  
  // Performance
  totalDuration: number
  errors: string[]
  
  // Test mode specific
  testTopic?: TopicPreview
  testArticle?: {
    title: string
    excerpt: string
    category: string
    tags: string[]
    readingTime: number
    citationCount: number
  }
  testResearch?: {
    findingsCount: number
    sourcesCount: number
    summary: string
    keyPoints: string[]
  }
}

export interface EngineConfig {
  maxTopics: number
  minQualityScore: number
  enableResearch: boolean
  enableImageGeneration: boolean
  enableRssImageOptimization: boolean
  parallelResearch: boolean
}

export interface EngineStatus {
  isConfigured: boolean
  isResearchEnabled: boolean
  isImageGenEnabled: boolean
  isRssImageOptEnabled: boolean
  activeFeeds: number
  totalArticles: number
  lastGeneration: Date | null
  config: EngineConfig
  imageStats: {
    aiGenerated: number
    rssOptimized: number
    placeholder: number
  }
}

// ============================================
// Configuration Functions
// ============================================

/**
 * Get engine configuration from database
 */
async function getEngineConfig(): Promise<EngineConfig> {
  try {
    const settings = await getTopicSelectionSettings()
    
    const [
      minQualitySetting,
      enableResearchSetting,
      enableImageSetting,
      enableRssImageSetting,
      parallelSetting,
    ] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'min_article_quality' } }),
      prisma.systemSetting.findUnique({ where: { key: 'enable_deep_research' } }),
      prisma.systemSetting.findUnique({ where: { key: 'enable_image_generation' } }),
      prisma.systemSetting.findUnique({ where: { key: 'enable_rss_image_optimization' } }),
      prisma.systemSetting.findUnique({ where: { key: 'parallel_research' } }),
    ])

    return {
      maxTopics: settings.maxTopicsPerRun,
      minQualityScore: parseInt(minQualitySetting?.value || '50', 10),
      enableResearch: enableResearchSetting?.value !== 'false',
      enableImageGeneration: enableImageSetting?.value !== 'false',
      enableRssImageOptimization: enableRssImageSetting?.value !== 'false',
      parallelResearch: parallelSetting?.value === 'true',
    }
  } catch {
    return {
      maxTopics: 5,
      minQualityScore: 50,
      enableResearch: true,
      enableImageGeneration: true,
      enableRssImageOptimization: true,
      parallelResearch: false,
    }
  }
}

/**
 * Get system author for articles
 */
async function getSystemAuthor() {
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

  return systemAuthor
}

// ============================================
// Utility Functions
// ============================================

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
      return `${baseSlug}-${Date.now()}`
    }
  }
}

/**
 * Process image for an article
 */
async function processImage(
  title: string,
  category: string,
  content: string,
  rssImageUrl: string | undefined,
  config: EngineConfig
): Promise<{ imageUrl: string; imageSource: 'ai' | 'rss' | 'placeholder' }> {
  let imageUrl: string | null = null
  let imageSource: 'ai' | 'rss' | 'placeholder' = 'placeholder'

  const hasRssImage = !!rssImageUrl
  const useRssImage = shouldUseRssImage(category, hasRssImage)

  console.log(`[UnifiedEngine] Image decision for "${category}": hasRSS=${hasRssImage}, useRSS=${useRssImage}`)

  // Try RSS image first if appropriate
  if (useRssImage && rssImageUrl && config.enableRssImageOptimization) {
    try {
      const optimizedResult = await downloadAndOptimizeImage(rssImageUrl, title)
      if (optimizedResult.success && optimizedResult.publicUrl) {
        imageUrl = optimizedResult.publicUrl
        imageSource = 'rss'
        console.log(`[UnifiedEngine] RSS image optimized: ${optimizedResult.originalSize} -> ${optimizedResult.optimizedSize} bytes`)
      }
    } catch (error) {
      console.warn(`[UnifiedEngine] RSS image optimization failed: ${error}`)
    }
  }

  // Try AI image generation if no RSS image
  if (!imageUrl && config.enableImageGeneration && await isImageGenerationConfigured()) {
    try {
      const imageResult = await generateImage(title, category)
      if (imageResult.success && imageResult.imageUrl) {
        imageUrl = imageResult.imageUrl
        imageSource = 'ai'
        console.log(`[UnifiedEngine] AI image generated via ${imageResult.provider}/${imageResult.model}`)
      }
    } catch (error) {
      console.warn(`[UnifiedEngine] AI image generation failed: ${error}`)
    }
  }

  // Fallback to placeholder
  if (!imageUrl) {
    imageUrl = getPlaceholderImage(category)
    imageSource = 'placeholder'
    console.log(`[UnifiedEngine] Using placeholder image`)
  }

  // Log image placement recommendation
  const placement = getImagePlacement(category)
  console.log(`[UnifiedEngine] Image placement for ${category}: ${placement}`)

  return { imageUrl, imageSource }
}

// ============================================
// Quick Mode Implementation
// ============================================

/**
 * Quick mode: Direct RSS to article conversion
 * Similar to the original content-engine.ts
 */
async function runQuickMode(
  config: EngineConfig,
  feedId?: string
): Promise<ContentEngineResult> {
  const startTime = Date.now()
  const result: ContentEngineResult = {
    success: false,
    mode: 'quick',
    stages: [],
    topicsCollected: 0,
    topicsSelected: 0,
    topicsResearched: 0,
    articlesGenerated: 0,
    articlesPublished: 0,
    articles: [],
    imagesGenerated: 0,
    imagesOptimized: 0,
    totalDuration: 0,
    errors: [],
  }

  console.log('[UnifiedEngine] Starting quick mode...')

  // Stage 1: Fetch RSS
  const stage1: PipelineStage = {
    name: 'RSS Toplama',
    status: 'running',
    startTime: Date.now(),
  }
  result.stages.push(stage1)

  try {
    // Get feeds
    const feeds = feedId 
      ? await prisma.rssFeed.findMany({ where: { id: feedId, isActive: true } })
      : await prisma.rssFeed.findMany({ where: { isActive: true } })

    if (feeds.length === 0) {
      stage1.status = 'failed'
      stage1.details = 'Aktif RSS kaynağı bulunamadı'
      result.errors.push('No active RSS feeds found')
      return result
    }

    // Get system author
    const systemAuthor = await getSystemAuthor()
    let totalArticlesCreated = 0

    // Process each feed
    for (const feed of feeds) {
      if (totalArticlesCreated >= config.maxTopics) break

      try {
        const rssData = await fetchRssFeed(feed.url)
        if (!rssData || rssData.items.length === 0) continue

        result.topicsCollected += rssData.items.length

        const remainingSlots = config.maxTopics - totalArticlesCreated
        const itemsToProcess = rssData.items.slice(0, remainingSlots)

        for (const item of itemsToProcess) {
          try {
            // Check if article exists
            const baseSlug = generateBaseSlug(item.title)
            const existingArticle = await prisma.article.findFirst({
              where: { slug: { contains: baseSlug.substring(0, 30) } },
            })

            if (existingArticle) continue

            // Generate article content
            const generatedContent = await generateArticle(
              item.title,
              item.content || item.description,
              feed.category
            )

            const category = feed.category || await determineCategory(
              generatedContent.title,
              generatedContent.content
            )

            // Process image
            const { imageUrl, imageSource } = await processImage(
              generatedContent.title,
              category,
              generatedContent.content,
              item.imageUrl,
              config
            )

            if (imageSource === 'ai') result.imagesGenerated++
            if (imageSource === 'rss') result.imagesOptimized++

            // Create article
            const uniqueSlug = await ensureUniqueSlug(generatedContent.slug)
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

            totalArticlesCreated++
            result.articlesPublished++
            result.articles.push({
              title: generatedContent.title,
              slug: uniqueSlug,
              category,
              qualityScore: 70, // Default score for quick mode
              imageSource,
            })

            console.log(`[UnifiedEngine] Quick mode: Created article "${generatedContent.title.substring(0, 40)}..."`)

          } catch (error) {
            result.errors.push(`Error processing item: ${error}`)
          }
        }

        // Update feed last fetch time
        await prisma.rssFeed.update({
          where: { id: feed.id },
          data: { lastFetch: new Date() },
        })

      } catch (error) {
        result.errors.push(`Error processing feed ${feed.name}: ${error}`)
      }
    }

    stage1.endTime = Date.now()
    stage1.status = 'completed'
    stage1.details = `${result.topicsCollected} içerik toplandı, ${result.articlesPublished} makale oluşturuldu`

    result.topicsSelected = result.articlesPublished
    result.articlesGenerated = result.articlesPublished
    result.success = result.articlesPublished > 0

  } catch (error) {
    stage1.status = 'failed'
    stage1.details = `Hata: ${error}`
    result.errors.push(`Quick mode error: ${error}`)
  }

  result.totalDuration = Date.now() - startTime
  return result
}

// ============================================
// Standard Mode Implementation
// ============================================

/**
 * Standard mode: Full pipeline with research
 * Similar to the original advanced-content-engine.ts
 */
async function runStandardMode(config: EngineConfig): Promise<ContentEngineResult> {
  const startTime = Date.now()
  const result: ContentEngineResult = {
    success: false,
    mode: 'standard',
    stages: [],
    topicsCollected: 0,
    topicsSelected: 0,
    topicsResearched: 0,
    articlesGenerated: 0,
    articlesPublished: 0,
    articles: [],
    imagesGenerated: 0,
    imagesOptimized: 0,
    totalDuration: 0,
    errors: [],
  }

  console.log('[UnifiedEngine] Starting standard mode...')

  try {
    const author = await getSystemAuthor()

    // Stage 1: Topic Selection
    const stage1: PipelineStage = {
      name: 'Konu Seçimi',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage1)

    console.log('[UnifiedEngine] Stage 1: Selecting topics...')
    const topicResult = await selectTopics(config.maxTopics)
    
    stage1.endTime = Date.now()
    stage1.status = topicResult.success ? 'completed' : 'failed'
    stage1.details = `${topicResult.totalSelected} konu seçildi (${topicResult.totalCollected} içinden)`
    
    result.topicsCollected = topicResult.totalCollected
    result.topicsSelected = topicResult.totalSelected
    result.errors.push(...topicResult.errors)

    if (topicResult.topics.length === 0) {
      result.errors.push('No topics selected for processing')
      return result
    }

    // Stage 2: Research
    const stage2: PipelineStage = {
      name: 'Araştırma',
      status: config.enableResearch ? 'running' : 'skipped',
      startTime: Date.now(),
    }
    result.stages.push(stage2)

    let researchResults: ResearchResult[]
    
    if (config.enableResearch && isResearchAgentConfigured()) {
      console.log('[UnifiedEngine] Stage 2: Conducting research...')
      
      if (config.parallelResearch) {
        researchResults = await researchTopics(topicResult.topics, 3)
      } else {
        researchResults = []
        for (const topic of topicResult.topics) {
          const research = await researchTopic(topic)
          researchResults.push(research)
        }
      }
    } else {
      // Skip research, create minimal results
      researchResults = topicResult.topics.map(topic => ({
        topic,
        success: true,
        findings: [{
          fact: topic.description,
          sources: [],
          confidence: 0.5,
          category: 'current' as const,
        }],
        sources: [],
        summary: topic.description,
        keyPoints: [topic.title],
        suggestedAngles: ['Genel haber'],
        researchDuration: 0,
        errors: [],
      }))
    }

    stage2.endTime = Date.now()
    const successfulResearch = researchResults.filter(r => r.success)
    stage2.status = config.enableResearch 
      ? (successfulResearch.length > 0 ? 'completed' : 'failed')
      : 'skipped'
    stage2.details = config.enableResearch 
      ? `${successfulResearch.length}/${researchResults.length} konu araştırıldı`
      : 'Araştırma devre dışı'
    result.topicsResearched = successfulResearch.length

    // Stage 3: Content Synthesis
    const stage3: PipelineStage = {
      name: 'İçerik Sentezi',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage3)

    console.log('[UnifiedEngine] Stage 3: Synthesizing content...')
    const synthesisResults = await synthesizeMultiple(successfulResearch)
    
    const successfulSynthesis = synthesisResults.filter(
      s => s.success && s.article && s.qualityScore >= config.minQualityScore
    )

    stage3.endTime = Date.now()
    stage3.status = successfulSynthesis.length > 0 ? 'completed' : 'failed'
    stage3.details = `${successfulSynthesis.length}/${synthesisResults.length} makale üretildi`
    result.articlesGenerated = successfulSynthesis.length

    // Stage 4: Publishing
    const stage4: PipelineStage = {
      name: 'Yayınlama',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage4)

    console.log('[UnifiedEngine] Stage 4: Publishing articles...')

    for (const synthesis of successfulSynthesis) {
      if (!synthesis.article) continue

      try {
        // Find corresponding topic
        const research = successfulResearch.find(
          r => r.topic.title === synthesis.article?.title || 
               r.topic.title === topicResult.topics.find(t => 
                 synthesis.article?.title.includes(t.title.substring(0, 20))
               )?.title
        )
        const topic = research?.topic || topicResult.topics[0]

        // Process image
        const { imageUrl, imageSource } = await processImage(
          synthesis.article.title,
          synthesis.article.category,
          synthesis.article.content,
          topic.imageUrl,
          config
        )

        if (imageSource === 'ai') result.imagesGenerated++
        if (imageSource === 'rss') result.imagesOptimized++

        // Publish article
        const uniqueSlug = await ensureUniqueSlug(synthesis.article.slug)
        await prisma.article.create({
          data: {
            title: synthesis.article.title,
            slug: uniqueSlug,
            content: synthesis.article.content,
            excerpt: synthesis.article.excerpt,
            imageUrl,
            imageSource,
            category: synthesis.article.category,
            authorId: author.id,
            publishedAt: topic.publishedAt || new Date(),
          },
        })

        result.articlesPublished++
        result.articles.push({
          title: synthesis.article.title,
          slug: uniqueSlug,
          category: synthesis.article.category,
          qualityScore: synthesis.qualityScore,
          imageSource,
        })

        console.log(`[UnifiedEngine] Published: ${synthesis.article.title.substring(0, 40)}...`)

      } catch (error) {
        result.errors.push(`Failed to publish article: ${error}`)
      }
    }

    stage4.endTime = Date.now()
    stage4.status = result.articlesPublished > 0 ? 'completed' : 'failed'
    stage4.details = `${result.articlesPublished} makale yayınlandı`

    result.success = result.articlesPublished > 0

  } catch (error) {
    result.errors.push(`Standard mode error: ${error}`)
  }

  result.totalDuration = Date.now() - startTime
  return result
}

// ============================================
// Preview Mode Implementation
// ============================================

/**
 * Preview mode: Topic selection only
 */
async function runPreviewMode(maxTopics: number): Promise<ContentEngineResult> {
  const startTime = Date.now()
  const result: ContentEngineResult = {
    success: false,
    mode: 'preview',
    stages: [],
    topicsCollected: 0,
    topicsSelected: 0,
    topicsResearched: 0,
    articlesGenerated: 0,
    articlesPublished: 0,
    articles: [],
    imagesGenerated: 0,
    imagesOptimized: 0,
    totalDuration: 0,
    errors: [],
    topics: [],
  }

  console.log('[UnifiedEngine] Starting preview mode...')

  const stage1: PipelineStage = {
    name: 'Konu Önizleme',
    status: 'running',
    startTime: Date.now(),
  }
  result.stages.push(stage1)

  try {
    const topicResult = await selectTopics(maxTopics)
    
    result.topicsCollected = topicResult.totalCollected
    result.topicsSelected = topicResult.totalSelected
    result.topics = topicResult.topics.map(t => ({
      title: t.title,
      description: t.description,
      category: t.category,
      score: t.score,
      reasoning: t.reasoning,
      keywords: t.keywords,
      sourceFeed: t.sourceFeed,
    }))
    result.errors.push(...topicResult.errors)
    
    stage1.endTime = Date.now()
    stage1.status = topicResult.success ? 'completed' : 'failed'
    stage1.details = `${topicResult.totalSelected} konu önizlendi`
    
    result.success = topicResult.success

  } catch (error) {
    stage1.status = 'failed'
    stage1.details = `Hata: ${error}`
    result.errors.push(`Preview mode error: ${error}`)
  }

  result.totalDuration = Date.now() - startTime
  return result
}

// ============================================
// Test Mode Implementation
// ============================================

/**
 * Test mode: Single topic full pipeline
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function runTestMode(_config: EngineConfig): Promise<ContentEngineResult> {
  const startTime = Date.now()
  const result: ContentEngineResult = {
    success: false,
    mode: 'test',
    stages: [],
    topicsCollected: 0,
    topicsSelected: 0,
    topicsResearched: 0,
    articlesGenerated: 0,
    articlesPublished: 0,
    articles: [],
    imagesGenerated: 0,
    imagesOptimized: 0,
    totalDuration: 0,
    errors: [],
  }

  console.log('[UnifiedEngine] Starting test mode...')

  try {
    // Select single topic
    const stage1: PipelineStage = {
      name: 'Konu Seçimi',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage1)

    const topicResult = await selectTopics(1)
    
    stage1.endTime = Date.now()
    
    if (!topicResult.success || topicResult.topics.length === 0) {
      stage1.status = 'failed'
      stage1.details = 'Test için konu bulunamadı'
      result.errors.push('No topics available for testing')
      return result
    }

    stage1.status = 'completed'
    stage1.details = 'Test konusu seçildi'
    
    const topic = topicResult.topics[0]
    result.topicsSelected = 1
    result.testTopic = {
      title: topic.title,
      description: topic.description,
      category: topic.category,
      score: topic.score,
      reasoning: topic.reasoning,
      keywords: topic.keywords,
      sourceFeed: topic.sourceFeed,
    }

    // Research
    const stage2: PipelineStage = {
      name: 'Araştırma',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage2)

    console.log(`[UnifiedEngine] Test: Researching "${topic.title}"`)
    const research = await researchTopic(topic)
    
    stage2.endTime = Date.now()
    stage2.status = research.success ? 'completed' : 'failed'
    stage2.details = `${research.findings.length} bulgu, ${research.sources.length} kaynak`
    
    result.topicsResearched = research.success ? 1 : 0
    result.testResearch = {
      findingsCount: research.findings.length,
      sourcesCount: research.sources.length,
      summary: research.summary,
      keyPoints: research.keyPoints,
    }

    if (!research.success) {
      result.errors.push('Research failed')
      return result
    }

    // Synthesize
    const stage3: PipelineStage = {
      name: 'İçerik Sentezi',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage3)

    console.log(`[UnifiedEngine] Test: Synthesizing content`)
    const synthesis = await synthesizeContent(research)
    
    stage3.endTime = Date.now()
    
    if (!synthesis.success || !synthesis.article) {
      stage3.status = 'failed'
      stage3.details = 'İçerik sentezi başarısız'
      result.errors.push('Synthesis failed')
      return result
    }

    stage3.status = 'completed'
    stage3.details = `Kalite skoru: ${synthesis.qualityScore}/100`
    
    result.articlesGenerated = 1
    result.testArticle = {
      title: synthesis.article.title,
      excerpt: synthesis.article.excerpt,
      category: synthesis.article.category,
      tags: synthesis.article.tags,
      readingTime: synthesis.article.readingTime,
      citationCount: synthesis.article.citations.length,
    }

    result.success = true

  } catch (error) {
    result.errors.push(`Test mode error: ${error}`)
  }

  result.totalDuration = Date.now() - startTime
  return result
}

// ============================================
// Main Public Functions
// ============================================

/**
 * Run the unified content engine
 * 
 * @param mode - Operation mode (quick, standard, preview, test)
 * @param options - Additional options
 */
export async function runContentEngine(
  mode: ContentEngineMode = 'standard',
  options: {
    maxTopics?: number
    feedId?: string
  } = {}
): Promise<ContentEngineResult> {
  console.log(`[UnifiedEngine] Starting content engine in ${mode} mode...`)

  // Check configuration
  if (!isGeminiConfigured()) {
    return {
      success: false,
      mode,
      stages: [],
      topicsCollected: 0,
      topicsSelected: 0,
      topicsResearched: 0,
      articlesGenerated: 0,
      articlesPublished: 0,
      articles: [],
      imagesGenerated: 0,
      imagesOptimized: 0,
      totalDuration: 0,
      errors: ['Gemini API is not configured'],
    }
  }

  // Get configuration
  const config = await getEngineConfig()
  const maxTopics = options.maxTopics || config.maxTopics

  // Run appropriate mode
  // Note: 'quick' mode is deprecated and now redirects to 'standard'
  switch (mode) {
    case 'quick':
      // Quick mode deprecated - use standard mode for consistent quality
      console.log('[UnifiedEngine] Quick mode is deprecated, using standard mode')
      return runStandardMode({ ...config, maxTopics })
    
    case 'standard':
      return runStandardMode({ ...config, maxTopics })
    
    case 'preview':
      return runPreviewMode(maxTopics)
    
    case 'test':
      return runTestMode({ ...config, maxTopics })
    
    default:
      return runStandardMode({ ...config, maxTopics })
  }
}

/**
 * Get unified content engine status
 */
export async function getEngineStatus(): Promise<EngineStatus> {
  const config = await getEngineConfig()
  
  const [
    activeFeeds, 
    totalArticles, 
    lastArticle,
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
    prisma.article.count({ where: { imageSource: 'ai' } }),
    prisma.article.count({ where: { imageSource: 'rss' } }),
    prisma.article.count({ where: { OR: [{ imageSource: 'placeholder' }, { imageSource: null }] } }),
  ])

  return {
    isConfigured: isGeminiConfigured(),
    isResearchEnabled: config.enableResearch && isResearchAgentConfigured(),
    isImageGenEnabled: config.enableImageGeneration,
    isRssImageOptEnabled: config.enableRssImageOptimization,
    activeFeeds,
    totalArticles,
    lastGeneration: lastArticle?.createdAt || null,
    config,
    imageStats: {
      aiGenerated: aiImages,
      rssOptimized: rssImages,
      placeholder: placeholderImages,
    },
  }
}

/**
 * Process a single RSS feed (for backward compatibility)
 */
export async function processFeed(feedId: string): Promise<ContentEngineResult> {
  return runContentEngine('quick', { feedId, maxTopics: 5 })
}

/**
 * Process all feeds (for backward compatibility)
 */
export async function processAllFeeds(): Promise<ContentEngineResult> {
  return runContentEngine('quick')
}
