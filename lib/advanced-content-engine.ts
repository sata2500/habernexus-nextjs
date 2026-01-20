import { prisma } from '@/lib/prisma'
import { selectTopics, ScoredTopic, getTopicSelectionSettings } from '@/lib/topic-selector'
import { researchTopic, researchTopics, ResearchResult, isResearchAgentConfigured } from '@/lib/research-agent'
import { synthesizeContent, synthesizeMultiple, GeneratedArticle } from '@/lib/content-synthesizer'
import { generateArticleImage, getPlaceholderImage, isImagenConfigured } from '@/lib/imagen'
import { downloadAndOptimizeImage, shouldUseRssImage } from '@/lib/image-optimizer'
import { isGeminiConfigured } from '@/lib/gemini'

/**
 * Advanced Content Engine Service
 * Orchestrates the complete content generation pipeline:
 * 1. Topic Selection - Intelligently select valuable topics from RSS
 * 2. Deep Research - Conduct web research on selected topics
 * 3. Content Synthesis - Generate original, high-quality articles
 * 4. Image Processing - Generate or optimize images
 * 5. Publishing - Save articles to database
 * 
 * @version 1.0.0
 * @lastUpdated 20 January 2026
 */

/**
 * Pipeline stage status
 */
export interface PipelineStage {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: number
  endTime?: number
  details?: string
}

/**
 * Complete pipeline result
 */
export interface AdvancedContentResult {
  success: boolean
  stages: PipelineStage[]
  topicsSelected: number
  topicsResearched: number
  articlesGenerated: number
  articlesPublished: number
  imagesGenerated: number
  imagesOptimized: number
  totalDuration: number
  errors: string[]
  articles: Array<{
    title: string
    slug: string
    category: string
    qualityScore: number
    imageSource: string
  }>
}

/**
 * Pipeline configuration
 */
export interface PipelineConfig {
  maxTopics: number
  minQualityScore: number
  enableResearch: boolean
  enableImageGeneration: boolean
  parallelResearch: boolean
}

/**
 * Get pipeline configuration from database
 */
async function getPipelineConfig(): Promise<PipelineConfig> {
  try {
    const settings = await getTopicSelectionSettings()
    
    const [
      minQualitySetting,
      enableResearchSetting,
      enableImageSetting,
      parallelSetting,
    ] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'min_article_quality' } }),
      prisma.systemSetting.findUnique({ where: { key: 'enable_deep_research' } }),
      prisma.systemSetting.findUnique({ where: { key: 'enable_image_generation' } }),
      prisma.systemSetting.findUnique({ where: { key: 'parallel_research' } }),
    ])

    return {
      maxTopics: settings.maxTopicsPerRun,
      minQualityScore: parseInt(minQualitySetting?.value || '50', 10),
      enableResearch: enableResearchSetting?.value !== 'false',
      enableImageGeneration: enableImageSetting?.value !== 'false',
      parallelResearch: parallelSetting?.value === 'true',
    }
  } catch {
    return {
      maxTopics: 5,
      minQualityScore: 50,
      enableResearch: true,
      enableImageGeneration: true,
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

/**
 * Ensure unique slug in database
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
  article: GeneratedArticle,
  topic: ScoredTopic,
  config: PipelineConfig
): Promise<{ imageUrl: string; imageSource: 'ai' | 'rss' | 'placeholder' }> {
  let imageUrl: string | null = null
  let imageSource: 'ai' | 'rss' | 'placeholder' = 'placeholder'

  // Try RSS image first if available
  if (topic.imageUrl && shouldUseRssImage(article.category, true)) {
    try {
      const optimizedResult = await downloadAndOptimizeImage(
        topic.imageUrl,
        article.title
      )

      if (optimizedResult.success && optimizedResult.publicUrl) {
        imageUrl = optimizedResult.publicUrl
        imageSource = 'rss'
        console.log(`[AdvancedEngine] RSS image optimized for: ${article.title.substring(0, 30)}...`)
      }
    } catch (error) {
      console.warn(`[AdvancedEngine] RSS image optimization failed: ${error}`)
    }
  }

  // Try AI image generation if enabled and no RSS image
  if (!imageUrl && config.enableImageGeneration && await isImagenConfigured()) {
    try {
      const imageResult = await generateArticleImage(
        article.title,
        article.category,
        article.content
      )

      if (imageResult.success && imageResult.imageUrl) {
        imageUrl = imageResult.imageUrl
        imageSource = 'ai'
        console.log(`[AdvancedEngine] AI image generated for: ${article.title.substring(0, 30)}...`)
      }
    } catch (error) {
      console.warn(`[AdvancedEngine] AI image generation failed: ${error}`)
    }
  }

  // Fallback to placeholder
  if (!imageUrl) {
    imageUrl = getPlaceholderImage(article.category)
    imageSource = 'placeholder'
  }

  return { imageUrl, imageSource }
}

/**
 * Publish article to database
 */
async function publishArticle(
  article: GeneratedArticle,
  topic: ScoredTopic,
  imageUrl: string,
  imageSource: 'ai' | 'rss' | 'placeholder',
  authorId: string
): Promise<string> {
  const uniqueSlug = await ensureUniqueSlug(article.slug)

  const created = await prisma.article.create({
    data: {
      title: article.title,
      slug: uniqueSlug,
      content: article.content,
      excerpt: article.excerpt,
      imageUrl,
      imageSource,
      category: article.category,
      authorId,
      publishedAt: topic.publishedAt || new Date(),
    },
  })

  return created.id
}

/**
 * Main function: Run the complete advanced content generation pipeline
 */
export async function runAdvancedContentPipeline(): Promise<AdvancedContentResult> {
  const startTime = Date.now()
  const result: AdvancedContentResult = {
    success: false,
    stages: [],
    topicsSelected: 0,
    topicsResearched: 0,
    articlesGenerated: 0,
    articlesPublished: 0,
    imagesGenerated: 0,
    imagesOptimized: 0,
    totalDuration: 0,
    errors: [],
    articles: [],
  }

  console.log('[AdvancedEngine] Starting advanced content pipeline...')

  // Check configuration
  if (!isGeminiConfigured()) {
    result.errors.push('Gemini API is not configured')
    return result
  }

  if (!isResearchAgentConfigured()) {
    result.errors.push('Research agent is not configured')
    return result
  }

  try {
    // Get pipeline configuration
    const config = await getPipelineConfig()
    console.log(`[AdvancedEngine] Config: maxTopics=${config.maxTopics}, minQuality=${config.minQualityScore}`)

    // Get system author
    const author = await getSystemAuthor()

    // ============================================
    // STAGE 1: Topic Selection
    // ============================================
    const stage1: PipelineStage = {
      name: 'Topic Selection',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage1)

    console.log('[AdvancedEngine] Stage 1: Selecting topics...')
    const topicResult = await selectTopics(config.maxTopics)
    
    stage1.endTime = Date.now()
    stage1.status = topicResult.success ? 'completed' : 'failed'
    stage1.details = `Selected ${topicResult.totalSelected} topics from ${topicResult.totalCollected} collected`
    result.topicsSelected = topicResult.totalSelected
    result.errors.push(...topicResult.errors)

    if (topicResult.topics.length === 0) {
      result.errors.push('No topics selected for processing')
      return result
    }

    console.log(`[AdvancedEngine] Selected ${topicResult.topics.length} topics`)

    // ============================================
    // STAGE 2: Deep Research
    // ============================================
    const stage2: PipelineStage = {
      name: 'Deep Research',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage2)

    console.log('[AdvancedEngine] Stage 2: Conducting research...')
    
    let researchResults: ResearchResult[]
    if (config.enableResearch) {
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
      // Skip research, create minimal research results
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
    stage2.status = successfulResearch.length > 0 ? 'completed' : 'failed'
    stage2.details = `Researched ${successfulResearch.length}/${researchResults.length} topics`
    result.topicsResearched = successfulResearch.length

    console.log(`[AdvancedEngine] Researched ${successfulResearch.length} topics`)

    // ============================================
    // STAGE 3: Content Synthesis
    // ============================================
    const stage3: PipelineStage = {
      name: 'Content Synthesis',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage3)

    console.log('[AdvancedEngine] Stage 3: Synthesizing content...')
    const synthesisResults = await synthesizeMultiple(successfulResearch)
    
    const successfulSynthesis = synthesisResults.filter(
      s => s.success && s.article && s.qualityScore >= config.minQualityScore
    )

    stage3.endTime = Date.now()
    stage3.status = successfulSynthesis.length > 0 ? 'completed' : 'failed'
    stage3.details = `Generated ${successfulSynthesis.length}/${synthesisResults.length} articles`
    result.articlesGenerated = successfulSynthesis.length

    console.log(`[AdvancedEngine] Generated ${successfulSynthesis.length} articles`)

    // ============================================
    // STAGE 4: Image Processing & Publishing
    // ============================================
    const stage4: PipelineStage = {
      name: 'Image Processing & Publishing',
      status: 'running',
      startTime: Date.now(),
    }
    result.stages.push(stage4)

    console.log('[AdvancedEngine] Stage 4: Processing images and publishing...')

    for (const synthesis of successfulSynthesis) {
      if (!synthesis.article) continue

      try {
        // Find corresponding research result
        const research = successfulResearch.find(
          r => r.topic.title === synthesis.article?.title || 
               r.topic.title === topicResult.topics.find(t => 
                 synthesis.article?.title.includes(t.title.substring(0, 20))
               )?.title
        )
        const topic = research?.topic || topicResult.topics[0]

        // Process image
        const { imageUrl, imageSource } = await processImage(
          synthesis.article,
          topic,
          config
        )

        if (imageSource === 'ai') result.imagesGenerated++
        if (imageSource === 'rss') result.imagesOptimized++

        // Publish article
        await publishArticle(
          synthesis.article,
          topic,
          imageUrl,
          imageSource,
          author.id
        )

        result.articlesPublished++
        result.articles.push({
          title: synthesis.article.title,
          slug: synthesis.article.slug,
          category: synthesis.article.category,
          qualityScore: synthesis.qualityScore,
          imageSource,
        })

        console.log(`[AdvancedEngine] Published: ${synthesis.article.title.substring(0, 50)}...`)

      } catch (error) {
        result.errors.push(`Failed to publish article: ${error}`)
        console.error(`[AdvancedEngine] Publish error:`, error)
      }
    }

    stage4.endTime = Date.now()
    stage4.status = result.articlesPublished > 0 ? 'completed' : 'failed'
    stage4.details = `Published ${result.articlesPublished} articles`

    // Final result
    result.success = result.articlesPublished > 0
    result.totalDuration = Date.now() - startTime

    console.log(`[AdvancedEngine] Pipeline completed in ${result.totalDuration}ms`)
    console.log(`[AdvancedEngine] Results: ${result.articlesPublished} articles published`)

  } catch (error) {
    result.errors.push(`Pipeline error: ${error}`)
    console.error('[AdvancedEngine] Fatal error:', error)
  }

  result.totalDuration = Date.now() - startTime
  return result
}

/**
 * Get advanced content engine status
 */
export async function getAdvancedEngineStatus(): Promise<{
  isConfigured: boolean
  isResearchEnabled: boolean
  isImageGenEnabled: boolean
  config: PipelineConfig
  lastRun: Date | null
  stats: {
    totalArticles: number
    articlesWithResearch: number
    averageQuality: number
  }
}> {
  const config = await getPipelineConfig()
  
  const [lastArticle, totalArticles] = await Promise.all([
    prisma.article.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    prisma.article.count(),
  ])

  return {
    isConfigured: isGeminiConfigured() && isResearchAgentConfigured(),
    isResearchEnabled: config.enableResearch,
    isImageGenEnabled: config.enableImageGeneration,
    config,
    lastRun: lastArticle?.createdAt || null,
    stats: {
      totalArticles,
      articlesWithResearch: 0, // Would need a field to track this
      averageQuality: 0, // Would need quality scores stored
    },
  }
}

/**
 * Run pipeline for a single topic (for testing)
 */
export async function runSingleTopicPipeline(topic: ScoredTopic): Promise<{
  success: boolean
  article: GeneratedArticle | null
  research: ResearchResult | null
  errors: string[]
}> {
  const result = {
    success: false,
    article: null as GeneratedArticle | null,
    research: null as ResearchResult | null,
    errors: [] as string[],
  }

  try {
    // Research
    console.log(`[AdvancedEngine] Researching: ${topic.title}`)
    const research = await researchTopic(topic)
    result.research = research

    if (!research.success) {
      result.errors.push('Research failed')
      return result
    }

    // Synthesize
    console.log(`[AdvancedEngine] Synthesizing: ${topic.title}`)
    const synthesis = await synthesizeContent(research)

    if (!synthesis.success || !synthesis.article) {
      result.errors.push('Synthesis failed')
      return result
    }

    result.article = synthesis.article
    result.success = true

  } catch (error) {
    result.errors.push(`Error: ${error}`)
  }

  return result
}
