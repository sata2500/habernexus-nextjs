import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'

/**
 * API Key Helper Functions
 * Provides functions to retrieve API keys from database with fallback to environment variables
 * 
 * @version 1.0.0
 * @lastUpdated 17 January 2026
 */

// Cache for API keys to reduce database queries
const keyCache = new Map<string, { value: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get an API key value by its key name
 * First checks database, then falls back to environment variable
 * Results are cached for performance
 */
export async function getApiKey(keyName: string): Promise<string | null> {
  // Check cache first
  const cached = keyCache.get(keyName)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value
  }

  try {
    // Try to get from database
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: keyName, isActive: true }
    })

    if (apiKey) {
      // Decrypt the value
      const decryptedValue = decrypt(apiKey.value)
      
      // Update last used timestamp (fire and forget)
      prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsed: new Date() }
      }).catch(() => {
        // Ignore errors for last used update
      })

      // Cache the value
      keyCache.set(keyName, { value: decryptedValue, timestamp: Date.now() })
      
      return decryptedValue
    }
  } catch (error) {
    console.warn(`[API Keys] Failed to get key ${keyName} from database:`, error)
  }

  // Fallback to environment variable
  const envValue = process.env[keyName]
  if (envValue) {
    keyCache.set(keyName, { value: envValue, timestamp: Date.now() })
    return envValue
  }

  return null
}

/**
 * Get Gemini API key
 * Convenience function for the most commonly used API key
 */
export async function getGeminiApiKey(): Promise<string | null> {
  return getApiKey('GEMINI_API_KEY')
}

/**
 * Get Google OAuth credentials
 */
export async function getGoogleOAuthCredentials(): Promise<{
  clientId: string | null
  clientSecret: string | null
}> {
  const [clientId, clientSecret] = await Promise.all([
    getApiKey('GOOGLE_CLIENT_ID'),
    getApiKey('GOOGLE_CLIENT_SECRET')
  ])
  
  return { clientId, clientSecret }
}

/**
 * Clear the API key cache
 * Call this when API keys are updated
 */
export function clearApiKeyCache(): void {
  keyCache.clear()
}

/**
 * Clear a specific key from cache
 */
export function clearApiKeyCacheForKey(keyName: string): void {
  keyCache.delete(keyName)
}

/**
 * Check if an API key exists and is active
 */
export async function isApiKeyConfigured(keyName: string): Promise<boolean> {
  const value = await getApiKey(keyName)
  return !!value
}

/**
 * Get multiple API keys at once
 */
export async function getApiKeys(keyNames: string[]): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {}
  
  await Promise.all(
    keyNames.map(async (keyName) => {
      results[keyName] = await getApiKey(keyName)
    })
  )
  
  return results
}
