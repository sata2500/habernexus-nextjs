/**
 * Scheduling Guard System
 * Ensures content generation only runs when schedule is enabled
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

import { getSettings } from './index'

/**
 * Check if scheduling is enabled
 * This is a centralized guard to prevent unauthorized content generation
 */
export async function isSchedulingEnabled(): Promise<boolean> {
  try {
    const settings = await getSettings()
    return settings.isScheduleEnabled
  } catch (error) {
    console.error('[SchedulingGuard] Error checking schedule status:', error)
    // Default to false for safety
    return false
  }
}

/**
 * Guard function to prevent content generation when scheduling is disabled
 * Should be called at every entry point
 */
export async function guardScheduledExecution(): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const isEnabled = await isSchedulingEnabled()
    
    if (!isEnabled) {
      return {
        allowed: false,
        reason: 'Zamanlama sistemi devre dışı bırakılmış. Lütfen admin panelinden etkinleştirin.',
      }
    }
    
    return { allowed: true }
  } catch (error) {
    return {
      allowed: false,
      reason: `Zamanlama kontrolü başarısız: ${error}`,
    }
  }
}

/**
 * Log scheduling guard violations
 */
export function logSchedulingViolation(source: string, reason: string): void {
  console.warn(`[SchedulingGuard] Violation detected - Source: ${source}, Reason: ${reason}`)
}

/**
 * Validate that scheduling is enabled before running content generation
 * Throws error if scheduling is disabled
 */
export async function validateSchedulingEnabled(source: string): Promise<void> {
  const guard = await guardScheduledExecution()
  
  if (!guard.allowed) {
    logSchedulingViolation(source, guard.reason || 'Unknown reason')
    throw new Error(guard.reason || 'Scheduling is disabled')
  }
}
