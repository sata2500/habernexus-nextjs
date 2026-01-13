import cron, { ScheduledTask } from 'node-cron'
import { prisma } from '@/lib/prisma'
import { processAllFeeds } from '@/lib/content-engine'

/**
 * Content Generation Scheduler
 * Handles automatic content generation based on cron schedule
 * 
 * @version 1.0.0
 * @lastUpdated 13 January 2026
 */

// Singleton instance for the scheduler
let schedulerInstance: ContentScheduler | null = null

/**
 * Scheduler status interface
 */
export interface SchedulerStatus {
  isRunning: boolean
  currentSchedule: string
  lastRun: Date | null
  nextRun: Date | null
  runCount: number
  lastError: string | null
}

/**
 * Content Scheduler Class
 * Manages the cron job for automatic content generation
 */
class ContentScheduler {
  private task: ScheduledTask | null = null
  private currentSchedule: string = ''
  private lastRun: Date | null = null
  private runCount: number = 0
  private lastError: string | null = null
  private isProcessing: boolean = false

  /**
   * Start the scheduler with the configured cron schedule
   */
  async start(): Promise<void> {
    try {
      // Get schedule from database
      const setting = await prisma.systemSetting.findUnique({
        where: { key: 'cron_schedule' },
      })

      const schedule = setting?.value || '0 */6 * * *' // Default: every 6 hours

      // Validate cron expression
      if (!cron.validate(schedule)) {
        console.error(`[Scheduler] Invalid cron expression: ${schedule}`)
        this.lastError = `Invalid cron expression: ${schedule}`
        return
      }

      // Stop existing task if running
      if (this.task) {
        this.task.stop()
      }

      // Create new scheduled task
      this.task = cron.schedule(schedule, async () => {
        await this.runContentGeneration()
      })

      this.currentSchedule = schedule
      this.lastError = null
      console.log(`[Scheduler] Started with schedule: ${schedule}`)
    } catch (error) {
      console.error('[Scheduler] Failed to start:', error)
      this.lastError = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.task) {
      this.task.stop()
      this.task = null
      console.log('[Scheduler] Stopped')
    }
  }

  /**
   * Restart the scheduler (useful when schedule changes)
   */
  async restart(): Promise<void> {
    this.stop()
    await this.start()
  }

  /**
   * Run content generation manually
   */
  async runContentGeneration(): Promise<{ success: boolean; message: string }> {
    // Prevent concurrent runs
    if (this.isProcessing) {
      console.log('[Scheduler] Content generation already in progress, skipping...')
      return { success: false, message: 'Content generation already in progress' }
    }

    this.isProcessing = true
    console.log('[Scheduler] Starting content generation...')

    try {
      const result = await processAllFeeds()
      
      this.lastRun = new Date()
      this.runCount++
      this.lastError = null

      if (result.success) {
        console.log(`[Scheduler] Content generation completed. Articles created: ${result.articlesCreated}`)
        return { 
          success: true, 
          message: `${result.articlesCreated} makale oluşturuldu` 
        }
      } else {
        const errorMsg = result.errors.join(', ')
        console.error(`[Scheduler] Content generation completed with errors: ${errorMsg}`)
        this.lastError = errorMsg
        return { 
          success: false, 
          message: `Hatalar: ${errorMsg}` 
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Scheduler] Content generation failed:', errorMsg)
      this.lastError = errorMsg
      return { success: false, message: errorMsg }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): SchedulerStatus {
    return {
      isRunning: this.task !== null,
      currentSchedule: this.currentSchedule,
      lastRun: this.lastRun,
      nextRun: this.getNextRunTime(),
      runCount: this.runCount,
      lastError: this.lastError,
    }
  }

  /**
   * Calculate next run time based on cron expression
   */
  private getNextRunTime(): Date | null {
    if (!this.currentSchedule || !cron.validate(this.currentSchedule)) {
      return null
    }

    try {
      // Parse cron expression to get next run time
      const cronParts = this.currentSchedule.split(' ')
      const now = new Date()
      
      // Simple calculation for common patterns
      if (this.currentSchedule.includes('*/')) {
        // Interval pattern (e.g., */15 * * * * = every 15 minutes)
        const minuteMatch = cronParts[0].match(/\*\/(\d+)/)
        const hourMatch = cronParts[1].match(/\*\/(\d+)/)
        
        if (minuteMatch) {
          const interval = parseInt(minuteMatch[1])
          const nextMinute = Math.ceil((now.getMinutes() + 1) / interval) * interval
          const next = new Date(now)
          next.setMinutes(nextMinute % 60)
          next.setSeconds(0)
          next.setMilliseconds(0)
          if (nextMinute >= 60) {
            next.setHours(next.getHours() + 1)
          }
          return next
        }
        
        if (hourMatch) {
          const interval = parseInt(hourMatch[1])
          const nextHour = Math.ceil((now.getHours() + 1) / interval) * interval
          const next = new Date(now)
          next.setHours(nextHour % 24)
          next.setMinutes(parseInt(cronParts[0]) || 0)
          next.setSeconds(0)
          next.setMilliseconds(0)
          if (nextHour >= 24) {
            next.setDate(next.getDate() + 1)
          }
          return next
        }
      }
      
      // For other patterns, return approximate next run
      return null
    } catch {
      return null
    }
  }
}

/**
 * Get or create scheduler instance (singleton)
 */
export function getScheduler(): ContentScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new ContentScheduler()
  }
  return schedulerInstance
}

/**
 * Initialize scheduler on server startup
 */
export async function initializeScheduler(): Promise<void> {
  const scheduler = getScheduler()
  await scheduler.start()
}

/**
 * Update scheduler when settings change
 */
export async function updateScheduler(): Promise<void> {
  const scheduler = getScheduler()
  await scheduler.restart()
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus(): SchedulerStatus {
  const scheduler = getScheduler()
  return scheduler.getStatus()
}

/**
 * Trigger manual content generation
 */
export async function triggerContentGeneration(): Promise<{ success: boolean; message: string }> {
  const scheduler = getScheduler()
  return scheduler.runContentGeneration()
}

/**
 * Parse cron expression to human-readable format
 */
export function cronToHumanReadable(cronExpression: string): string {
  if (!cron.validate(cronExpression)) {
    return 'Geçersiz zamanlama'
  }

  const parts = cronExpression.split(' ')
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  // Common patterns
  if (minute === '0' && hour.startsWith('*/')) {
    const interval = hour.replace('*/', '')
    return `Her ${interval} saatte bir`
  }

  if (minute.startsWith('*/')) {
    const interval = minute.replace('*/', '')
    return `Her ${interval} dakikada bir`
  }

  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Her gün gece yarısı'
  }

  if (minute === '0' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Her gün saat ${hour}:00'da`
  }

  return cronExpression
}

/**
 * Common cron presets for UI
 */
export const CRON_PRESETS = [
  { label: 'Her 15 dakikada', value: '*/15 * * * *' },
  { label: 'Her 30 dakikada', value: '*/30 * * * *' },
  { label: 'Her saat başı', value: '0 * * * *' },
  { label: 'Her 2 saatte', value: '0 */2 * * *' },
  { label: 'Her 4 saatte', value: '0 */4 * * *' },
  { label: 'Her 6 saatte', value: '0 */6 * * *' },
  { label: 'Her 12 saatte', value: '0 */12 * * *' },
  { label: 'Günde bir (gece yarısı)', value: '0 0 * * *' },
  { label: 'Günde bir (sabah 8)', value: '0 8 * * *' },
]
