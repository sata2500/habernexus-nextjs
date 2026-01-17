import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { encrypt, decrypt, maskApiKey, isEncryptionConfigured } from '@/lib/encryption'

/**
 * API Keys Management API
 * 
 * GET /api/admin/api-keys - List all API keys (masked)
 * POST /api/admin/api-keys - Create a new API key
 */

// GET - List all API keys
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

    const apiKeys = await prisma.apiKey.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Mask values for security
    const maskedKeys = apiKeys.map(key => {
      let decryptedValue = ''
      try {
        decryptedValue = decrypt(key.value)
      } catch {
        decryptedValue = key.value // Fallback if decryption fails
      }
      
      return {
        id: key.id,
        name: key.name,
        key: key.key,
        maskedValue: maskApiKey(decryptedValue),
        description: key.description,
        category: key.category,
        isActive: key.isActive,
        isRequired: key.isRequired,
        lastUsed: key.lastUsed,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
      }
    })

    return NextResponse.json(maskedKeys)
  } catch (error) {
    console.error('API anahtarları getirilemedi:', error)
    return NextResponse.json(
      { error: 'API anahtarları getirilemedi' },
      { status: 500 }
    )
  }
}

// POST - Create a new API key
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
    const { name, key, value, description, category, isRequired } = body

    // Validation
    if (!name || !key || !value) {
      return NextResponse.json(
        { error: 'Ad, anahtar adı ve değer zorunludur' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existingKey = await prisma.apiKey.findUnique({
      where: { key }
    })

    if (existingKey) {
      return NextResponse.json(
        { error: 'Bu anahtar adı zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Encrypt the value
    const encryptedValue = encrypt(value)

    // Create the API key
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        value: encryptedValue,
        description: description || null,
        category: category || 'general',
        isRequired: isRequired || false,
      }
    })

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
        maskedValue: maskApiKey(value),
        description: apiKey.description,
        category: apiKey.category,
        isActive: apiKey.isActive,
        isRequired: apiKey.isRequired,
        createdAt: apiKey.createdAt,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('API anahtarı oluşturulamadı:', error)
    return NextResponse.json(
      { error: 'API anahtarı oluşturulamadı' },
      { status: 500 }
    )
  }
}
