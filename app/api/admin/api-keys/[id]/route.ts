import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { encrypt, decrypt, maskApiKey, isEncryptionConfigured } from '@/lib/encryption'

/**
 * API Key Detail API
 * 
 * GET /api/admin/api-keys/[id] - Get API key details (with option to reveal)
 * PUT /api/admin/api-keys/[id] - Update an API key
 * DELETE /api/admin/api-keys/[id] - Delete an API key
 */

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get API key details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const reveal = searchParams.get('reveal') === 'true'

    const apiKey = await prisma.apiKey.findUnique({
      where: { id }
    })

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API anahtarı bulunamadı' },
        { status: 404 }
      )
    }

    let decryptedValue = ''
    try {
      decryptedValue = decrypt(apiKey.value)
    } catch {
      decryptedValue = apiKey.value // Fallback if decryption fails
    }

    return NextResponse.json({
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      value: reveal ? decryptedValue : undefined,
      maskedValue: maskApiKey(decryptedValue),
      description: apiKey.description,
      category: apiKey.category,
      isActive: apiKey.isActive,
      isRequired: apiKey.isRequired,
      lastUsed: apiKey.lastUsed,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    })
  } catch (error) {
    console.error('API anahtarı getirilemedi:', error)
    return NextResponse.json(
      { error: 'API anahtarı getirilemedi' },
      { status: 500 }
    )
  }
}

// PUT - Update an API key
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, key, value, description, category, isActive, isRequired } = body

    // Check if API key exists
    const existingKey = await prisma.apiKey.findUnique({
      where: { id }
    })

    if (!existingKey) {
      return NextResponse.json(
        { error: 'API anahtarı bulunamadı' },
        { status: 404 }
      )
    }

    // If key name is being changed, check for duplicates
    if (key && key !== existingKey.key) {
      const duplicateKey = await prisma.apiKey.findUnique({
        where: { key }
      })
      if (duplicateKey) {
        return NextResponse.json(
          { error: 'Bu anahtar adı zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: {
      name?: string
      key?: string
      value?: string
      description?: string | null
      category?: string
      isActive?: boolean
      isRequired?: boolean
    } = {}

    if (name !== undefined) updateData.name = name
    if (key !== undefined) updateData.key = key
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (isActive !== undefined) updateData.isActive = isActive
    if (isRequired !== undefined) updateData.isRequired = isRequired

    // If value is provided, encrypt it
    if (value !== undefined && value !== '') {
      if (!isEncryptionConfigured()) {
        return NextResponse.json(
          { error: 'Şifreleme yapılandırılmamış. AUTH_SECRET ayarlanmalı.' },
          { status: 500 }
        )
      }
      updateData.value = encrypt(value)
    }

    // Update the API key
    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: updateData
    })

    // Get the actual value for masking
    let actualValue = ''
    try {
      actualValue = decrypt(updatedKey.value)
    } catch {
      actualValue = updatedKey.value
    }

    return NextResponse.json({
      success: true,
      apiKey: {
        id: updatedKey.id,
        name: updatedKey.name,
        key: updatedKey.key,
        maskedValue: maskApiKey(actualValue),
        description: updatedKey.description,
        category: updatedKey.category,
        isActive: updatedKey.isActive,
        isRequired: updatedKey.isRequired,
        updatedAt: updatedKey.updatedAt,
      }
    })
  } catch (error) {
    console.error('API anahtarı güncellenemedi:', error)
    return NextResponse.json(
      { error: 'API anahtarı güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if API key exists
    const existingKey = await prisma.apiKey.findUnique({
      where: { id }
    })

    if (!existingKey) {
      return NextResponse.json(
        { error: 'API anahtarı bulunamadı' },
        { status: 404 }
      )
    }

    // Prevent deletion of required keys
    if (existingKey.isRequired) {
      return NextResponse.json(
        { error: 'Zorunlu API anahtarları silinemez. Önce zorunlu işaretini kaldırın.' },
        { status: 400 }
      )
    }

    // Delete the API key
    await prisma.apiKey.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'API anahtarı başarıyla silindi'
    })
  } catch (error) {
    console.error('API anahtarı silinemedi:', error)
    return NextResponse.json(
      { error: 'API anahtarı silinemedi' },
      { status: 500 }
    )
  }
}
