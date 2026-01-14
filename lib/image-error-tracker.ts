import { prisma } from '@/lib/prisma'

/**
 * Image Error Tracker Service
 * Tracks failed image operations for debugging and monitoring
 * 
 * @version 1.0.0
 * @lastUpdated 14 January 2026
 */

export type ImageSource = 'ai' | 'rss' | 'optimization'
export type ImageOperation = 'download' | 'generate' | 'optimize' | 'save'

export interface ImageErrorData {
  articleId?: string
  source: ImageSource
  operation: ImageOperation
  errorType: string
  errorMessage: string
  sourceUrl?: string
  category?: string
  retryCount?: number
}

export interface ImageStatsData {
  articleId?: string
  source: 'ai' | 'rss'
  model?: string
  originalSize?: number
  optimizedSize?: number
  width?: number
  height?: number
  format?: string
  duration: number
  success: boolean
}

/**
 * Log an image error to the database
 */
export async function logImageError(data: ImageErrorData): Promise<void> {
  try {
    await prisma.imageError.create({
      data: {
        articleId: data.articleId,
        source: data.source,
        operation: data.operation,
        errorType: data.errorType,
        errorMessage: data.errorMessage.substring(0, 1000), // Limit message length
        sourceUrl: data.sourceUrl?.substring(0, 500),
        category: data.category,
        retryCount: data.retryCount || 0,
      },
    })
    console.log(`[ImageErrorTracker] Logged error: ${data.source}/${data.operation} - ${data.errorType}`)
  } catch (error) {
    // Don't throw - error logging should not break the main flow
    console.error('[ImageErrorTracker] Failed to log error:', error)
  }
}

/**
 * Log image statistics to the database
 */
export async function logImageStats(data: ImageStatsData): Promise<void> {
  try {
    await prisma.imageStats.create({
      data: {
        articleId: data.articleId,
        source: data.source,
        model: data.model,
        originalSize: data.originalSize,
        optimizedSize: data.optimizedSize,
        width: data.width,
        height: data.height,
        format: data.format,
        duration: data.duration,
        success: data.success,
      },
    })
    console.log(`[ImageStats] Logged: ${data.source} - ${data.success ? 'success' : 'failure'} - ${data.duration}ms`)
  } catch (error) {
    console.error('[ImageStats] Failed to log stats:', error)
  }
}

/**
 * Get recent image errors
 */
export async function getRecentErrors(limit: number = 50): Promise<{
  errors: Array<{
    id: string
    source: string
    operation: string
    errorType: string
    errorMessage: string
    category: string | null
    retryCount: number
    resolved: boolean
    createdAt: Date
  }>
  total: number
}> {
  const [errors, total] = await Promise.all([
    prisma.imageError.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        source: true,
        operation: true,
        errorType: true,
        errorMessage: true,
        category: true,
        retryCount: true,
        resolved: true,
        createdAt: true,
      },
    }),
    prisma.imageError.count(),
  ])

  return { errors, total }
}

/**
 * Get image statistics summary
 */
export async function getImageStatsSummary(): Promise<{
  totalImages: number
  aiImages: number
  rssImages: number
  successRate: number
  avgDuration: number
  avgSizeReduction: number
  recentErrors: number
}> {
  const [
    totalImages,
    aiImages,
    rssImages,
    successfulImages,
    stats,
    recentErrors,
  ] = await Promise.all([
    prisma.imageStats.count(),
    prisma.imageStats.count({ where: { source: 'ai' } }),
    prisma.imageStats.count({ where: { source: 'rss' } }),
    prisma.imageStats.count({ where: { success: true } }),
    prisma.imageStats.aggregate({
      _avg: {
        duration: true,
        originalSize: true,
        optimizedSize: true,
      },
    }),
    prisma.imageError.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
        resolved: false,
      },
    }),
  ])

  const successRate = totalImages > 0 ? (successfulImages / totalImages) * 100 : 100
  const avgDuration = stats._avg.duration || 0
  
  // Calculate average size reduction
  let avgSizeReduction = 0
  if (stats._avg.originalSize && stats._avg.optimizedSize && stats._avg.originalSize > 0) {
    avgSizeReduction = ((stats._avg.originalSize - stats._avg.optimizedSize) / stats._avg.originalSize) * 100
  }

  return {
    totalImages,
    aiImages,
    rssImages,
    successRate: Math.round(successRate * 10) / 10,
    avgDuration: Math.round(avgDuration),
    avgSizeReduction: Math.round(avgSizeReduction * 10) / 10,
    recentErrors,
  }
}

/**
 * Mark an error as resolved
 */
export async function resolveError(errorId: string): Promise<void> {
  await prisma.imageError.update({
    where: { id: errorId },
    data: {
      resolved: true,
      resolvedAt: new Date(),
    },
  })
}

/**
 * Mark multiple errors as resolved
 */
export async function resolveErrors(errorIds: string[]): Promise<number> {
  const result = await prisma.imageError.updateMany({
    where: { id: { in: errorIds } },
    data: {
      resolved: true,
      resolvedAt: new Date(),
    },
  })
  return result.count
}

/**
 * Clear old resolved errors (cleanup utility)
 */
export async function clearOldErrors(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
  
  const result = await prisma.imageError.deleteMany({
    where: {
      resolved: true,
      createdAt: { lt: cutoffDate },
    },
  })
  
  return result.count
}

/**
 * Get error statistics by type
 */
export async function getErrorsByType(): Promise<Array<{
  errorType: string
  count: number
}>> {
  const errors = await prisma.imageError.groupBy({
    by: ['errorType'],
    _count: { id: true },
    where: { resolved: false },
    orderBy: { _count: { id: 'desc' } },
  })

  return errors.map(e => ({
    errorType: e.errorType,
    count: e._count.id,
  }))
}

/**
 * Classify error type from error message
 */
export function classifyErrorType(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return 'timeout'
  }
  if (lowerMessage.includes('api key') || lowerMessage.includes('authentication') || lowerMessage.includes('unauthorized')) {
    return 'auth_error'
  }
  if (lowerMessage.includes('quota') || lowerMessage.includes('rate limit') || lowerMessage.includes('429')) {
    return 'rate_limit'
  }
  if (lowerMessage.includes('safety') || lowerMessage.includes('blocked') || lowerMessage.includes('filtered')) {
    return 'content_filtered'
  }
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return 'not_found'
  }
  if (lowerMessage.includes('invalid') || lowerMessage.includes('corrupt') || lowerMessage.includes('format')) {
    return 'invalid_format'
  }
  if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('econnrefused')) {
    return 'network_error'
  }
  if (lowerMessage.includes('disk') || lowerMessage.includes('space') || lowerMessage.includes('enospc')) {
    return 'disk_error'
  }
  if (lowerMessage.includes('permission') || lowerMessage.includes('eacces')) {
    return 'permission_error'
  }

  return 'unknown'
}
