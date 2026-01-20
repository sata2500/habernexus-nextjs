/**
 * Content Engine v3.0 - Type Definitions
 * 
 * @version 3.0.0
 * @lastUpdated 20 January 2026
 * 
 * This module defines all types used in the Content Engine v3.0 system.
 */

// ============================================================================
// RSS Types
// ============================================================================

/**
 * RSS feed item from parsed feed
 */
export interface RssFeedItem {
  title: string
  link: string
  description?: string
  pubDate?: Date
  imageUrl?: string
  category?: string
  guid?: string
}

/**
 * RSS feed with items
 */
export interface RssFeedWithItems {
  feedId: string
  feedName: string
  feedUrl: string
  category: string
  topicsPerRun: number
  authorId: string | null
  imageMode: ImageMode
  items: RssFeedItem[]
  fetchedAt: Date
}

// ============================================================================
// Topic/Trend Types
// ============================================================================

/**
 * Topic extracted from RSS feed
 */
export interface Topic {
  title: string
  description: string
  sourceUrl: string
  sourceImageUrl?: string
  sourceFeedId: string
  sourceFeedName: string
  category: string
  authorId: string | null
  imageMode: ImageMode
  pubDate?: Date
}

/**
 * Topic with trend score
 */
export interface ScoredTopic extends Topic {
  trendScore: number
  trendReason: string
  keywords: string[]
}

/**
 * Topic selection result
 */
export interface TopicSelectionResult {
  selectedTopics: ScoredTopic[]
  totalTopicsAnalyzed: number
  selectionDuration: number
}

// ============================================================================
// Content Generation Types
// ============================================================================

/**
 * Research source from Google Search grounding
 */
export interface ResearchSource {
  title: string
  url: string
  snippet?: string
}

/**
 * Generated article content
 */
export interface GeneratedContent {
  title: string
  slug: string
  content: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  sentimentScore: number
  researchSources: ResearchSource[]
}

/**
 * Article generation result
 */
export interface ArticleGenerationResult {
  success: boolean
  topic: ScoredTopic
  content?: GeneratedContent
  error?: string
  generationDuration: number
}

// ============================================================================
// Image Types
// ============================================================================

/**
 * Image generation mode
 */
export type ImageMode = 'rss' | 'ai_original' | 'ai_similar' | 'auto'

/**
 * Image generation result
 */
export interface ImageGenerationResult {
  success: boolean
  imageUrl: string
  imageSource: 'ai' | 'rss' | 'placeholder'
  mode: ImageMode
  originalSize?: number
  optimizedSize?: number
  width?: number
  height?: number
  error?: string
  generationDuration: number
}

/**
 * Content image (for inline images)
 */
export interface ContentImage {
  url: string
  alt: string
  caption?: string
  position: 'after_intro' | 'mid_content' | 'before_conclusion'
}

// ============================================================================
// Engine Types
// ============================================================================

/**
 * Content Engine run mode
 */
export type EngineRunMode = 'full' | 'preview'

/**
 * Content Engine run status
 */
export type EngineRunStatus = 'pending' | 'running' | 'completed' | 'failed'

/**
 * Content Engine configuration
 */
export interface EngineConfig {
  mode: EngineRunMode
  feedId?: string // Optional: run for specific feed only
  maxTopicsPerFeed?: number // Override topicsPerRun
  skipImageGeneration?: boolean
  dryRun?: boolean // Don't save to database
}

/**
 * Content Engine run statistics
 */
export interface EngineRunStats {
  feedsProcessed: number
  topicsFound: number
  topicsSelected: number
  articlesCreated: number
  imagesGenerated: number
  errors: string[]
}

/**
 * Content Engine run result
 */
export interface EngineRunResult {
  runId: string
  status: EngineRunStatus
  mode: EngineRunMode
  stats: EngineRunStats
  startedAt: Date
  completedAt?: Date
  duration?: number
  articles?: {
    id: string
    title: string
    slug: string
    category: string
  }[]
}

/**
 * Content Engine log entry
 */
export interface EngineLogEntry {
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  data?: Record<string, unknown>
}

// ============================================================================
// Settings Types
// ============================================================================

/**
 * Content Engine settings
 */
export interface ContentEngineSettings {
  // AI Models
  contentModel: string
  imageModel: string
  summaryModel: string
  
  // Generation settings
  defaultTopicsPerFeed: number
  maxConcurrentGenerations: number
  
  // Image settings
  defaultImageMode: ImageMode
  imageQuality: number
  imageMaxWidth: number
  
  // Cache settings
  summaryCacheDays: number
  
  // Schedule settings
  cronSchedule: string
  isScheduleEnabled: boolean
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: ContentEngineSettings = {
  // AI Models
  contentModel: 'gemini-2.5-flash',
  imageModel: 'imagen-4.0-fast-generate-001',
  summaryModel: 'gemini-2.5-flash-lite',
  
  // Generation settings
  defaultTopicsPerFeed: 2,
  maxConcurrentGenerations: 3,
  
  // Image settings
  defaultImageMode: 'auto',
  imageQuality: 85,
  imageMaxWidth: 1200,
  
  // Cache settings
  summaryCacheDays: 30,
  
  // Schedule settings
  cronSchedule: '0 */6 * * *', // Every 6 hours
  isScheduleEnabled: false,
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * API response for engine run
 */
export interface EngineRunResponse {
  success: boolean
  runId?: string
  message: string
  result?: EngineRunResult
  error?: string
}

/**
 * API response for engine status
 */
export interface EngineStatusResponse {
  isRunning: boolean
  lastRun?: {
    id: string
    status: EngineRunStatus
    startedAt: Date
    completedAt?: Date
    stats: EngineRunStats
  }
  settings: ContentEngineSettings
}
