import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { encrypt, maskApiKey, isEncryptionConfigured } from '@/lib/encryption'
import { clearApiKeyCache } from '@/lib/api-keys'

/**
 * API Keys Sync API
 * 
 * GET /api/admin/api-keys/sync - Get .env keys status (which are synced, which are not)
 * POST /api/admin/api-keys/sync - Sync .env keys to database
 */

// Known API keys that can be synced from .env
const KNOWN_ENV_KEYS = [
  {
    key: 'GEMINI_API_KEY',
    name: 'Gemini API Key',
    description: 'Google AI Studio\'dan alınan API anahtarı. AI içerik üretimi ve görsel oluşturma için kullanılır.',
    category: 'ai',
    isRequired: true,
  },
  {
    key: 'GOOGLE_CLIENT_ID',
    name: 'Google OAuth Client ID',
    description: 'Google Cloud Console\'dan alınan OAuth Client ID. Kullanıcı girişi için kullanılır.',
    category: 'auth',
    isRequired: true,
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    name: 'Google OAuth Client Secret',
    description: 'Google Cloud Console\'dan alınan OAuth Client Secret. Kullanıcı girişi için kullanılır.',
    category: 'auth',
    isRequired: true,
  },
  {
    key: 'AUTH_SECRET',
    name: 'Auth.js Secret',
    description: 'Auth.js oturum şifreleme anahtarı. Otomatik oluşturulur.',
    category: 'auth',
    isRequired: true,
  },
]

// GET - Get sync status
export async function GET() {
  try {
    const session = await auth()
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Get all existing keys from database
    const dbKeys = await prisma.apiKey.findMany({
      select: { key: true }
    })
    const dbKeySet = new Set(dbKeys.map(k => k.key))

    // Check each known env key
    const envKeysStatus = KNOWN_ENV_KEYS.map(envKey => {
      const envValue = process.env[envKey.key]
      const isInDb = dbKeySet.has(envKey.key)
      const isInEnv = !!envValue
      
      return {
        key: envKey.key,
        name: envKey.name,
        description: envKey.description,
        category: envKey.category,
        isRequired: envKey.isRequired,
        isInDatabase: isInDb,
        isInEnv: isInEnv,
        maskedEnvValue: isInEnv ? maskApiKey(envValue!) : null,
        canSync: isInEnv && !isInDb,
        status: isInDb ? 'synced' : (isInEnv ? 'pending' : 'missing'),
      }
    })

    return NextResponse.json({
      keys: envKeysStatus,
      summary: {
        total: KNOWN_ENV_KEYS.length,
        synced: envKeysStatus.filter(k => k.status === 'synced').length,
        pending: envKeysStatus.filter(k => k.status === 'pending').length,
        missing: envKeysStatus.filter(k => k.status === 'missing').length,
      }
    })
  } catch (error) {
    console.error('.env sync status getirilemedi:', error)
    return NextResponse.json(
      { error: '.env sync status getirilemedi' },
      { status: 500 }
    )
  }
}

// POST - Sync selected keys from .env to database
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Check if encryption is configured
    if (!isEncryptionConfigured()) {
      return NextResponse.json(
        { error: 'Şifreleme yapılandırılmamış. AUTH_SECRET ayarlanmalı.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { keys: keysToSync } = body as { keys?: string[] }

    // If no keys specified, sync all pending keys
    const targetKeys = keysToSync || KNOWN_ENV_KEYS.map(k => k.key)

    // Get existing keys from database
    const dbKeys = await prisma.apiKey.findMany({
      select: { key: true }
    })
    const dbKeySet = new Set(dbKeys.map(k => k.key))

    const results: Array<{
      key: string
      success: boolean
      message: string
    }> = []

    for (const keyName of targetKeys) {
      // Find key config
      const keyConfig = KNOWN_ENV_KEYS.find(k => k.key === keyName)
      if (!keyConfig) {
        results.push({
          key: keyName,
          success: false,
          message: 'Bilinmeyen anahtar',
        })
        continue
      }

      // Check if already in database
      if (dbKeySet.has(keyName)) {
        results.push({
          key: keyName,
          success: false,
          message: 'Zaten veritabanında mevcut',
        })
        continue
      }

      // Get value from .env
      const envValue = process.env[keyName]
      if (!envValue) {
        results.push({
          key: keyName,
          success: false,
          message: '.env dosyasında bulunamadı',
        })
        continue
      }

      try {
        // Encrypt and save to database
        const encryptedValue = encrypt(envValue)
        
        await prisma.apiKey.create({
          data: {
            name: keyConfig.name,
            key: keyConfig.key,
            value: encryptedValue,
            description: keyConfig.description,
            category: keyConfig.category,
            isRequired: keyConfig.isRequired,
            isActive: true,
          }
        })

        results.push({
          key: keyName,
          success: true,
          message: 'Başarıyla senkronize edildi',
        })
      } catch (err) {
        results.push({
          key: keyName,
          success: false,
          message: err instanceof Error ? err.message : 'Bilinmeyen hata',
        })
      }
    }

    // Clear API key cache after sync
    clearApiKeyCache()

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        synced: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      }
    })
  } catch (error) {
    console.error('.env sync başarısız:', error)
    return NextResponse.json(
      { error: '.env sync başarısız' },
      { status: 500 }
    )
  }
}
