import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import * as fs from 'fs'
import * as path from 'path'

/**
 * .env File Management API
 * 
 * GET /api/admin/env - Get all environment variables from .env file
 * PUT /api/admin/env - Update environment variables in .env file
 * 
 * Security:
 * - Only ADMIN users can access this API
 * - Changes are written directly to .env file
 * - Server restart may be required for some changes to take effect
 */

// Known environment variables with metadata
const ENV_VARIABLES = [
  {
    key: 'GEMINI_API_KEY',
    name: 'Gemini API Key',
    description: 'Google AI Studio\'dan alınan API anahtarı. AI içerik üretimi ve görsel oluşturma için kullanılır.',
    category: 'ai',
    isRequired: true,
    isSecret: true,
    link: 'https://aistudio.google.com/apikey',
  },
  {
    key: 'GOOGLE_CLIENT_ID',
    name: 'Google OAuth Client ID',
    description: 'Google Cloud Console\'dan alınan OAuth Client ID. Kullanıcı girişi için kullanılır.',
    category: 'auth',
    isRequired: true,
    isSecret: false,
    link: 'https://console.cloud.google.com/apis/credentials',
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    name: 'Google OAuth Client Secret',
    description: 'Google Cloud Console\'dan alınan OAuth Client Secret. Kullanıcı girişi için kullanılır.',
    category: 'auth',
    isRequired: true,
    isSecret: true,
    link: 'https://console.cloud.google.com/apis/credentials',
  },
  {
    key: 'AUTH_SECRET',
    name: 'Auth.js Secret',
    description: 'Auth.js oturum şifreleme anahtarı. Rastgele bir string olmalıdır.',
    category: 'auth',
    isRequired: true,
    isSecret: true,
    link: null,
  },
  {
    key: 'NEXTAUTH_URL',
    name: 'NextAuth URL',
    description: 'Uygulamanın tam URL\'si. Örn: https://habernexus.com',
    category: 'auth',
    isRequired: true,
    isSecret: false,
    link: null,
  },
  {
    key: 'DATABASE_URL',
    name: 'Database URL',
    description: 'Veritabanı bağlantı URL\'si. SQLite için: file:./prisma/data.db',
    category: 'database',
    isRequired: true,
    isSecret: false,
    link: null,
  },
]

// Get .env file path
function getEnvFilePath(): string {
  return path.join(process.cwd(), '.env')
}

// Parse .env file content
function parseEnvFile(content: string): Record<string, string> {
  const env: Record<string, string> = {}
  const lines = content.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }
    
    // Parse KEY=VALUE format
    const equalIndex = trimmedLine.indexOf('=')
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim()
      let value = trimmedLine.substring(equalIndex + 1).trim()
      
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      
      env[key] = value
    }
  }
  
  return env
}

// Generate .env file content
function generateEnvContent(env: Record<string, string>): string {
  const lines: string[] = [
    '# HaberNexus Environment Variables',
    '# This file is managed by the admin panel',
    '# Last updated: ' + new Date().toISOString(),
    '',
  ]
  
  // Group by category
  const categories: Record<string, string[]> = {
    ai: [],
    auth: [],
    database: [],
    other: [],
  }
  
  // Sort known variables into categories
  for (const [key, value] of Object.entries(env)) {
    const varConfig = ENV_VARIABLES.find(v => v.key === key)
    const category = varConfig?.category || 'other'
    
    // Quote values that contain spaces or special characters
    let formattedValue = value
    if (value.includes(' ') || value.includes('#') || value.includes('"')) {
      formattedValue = `"${value.replace(/"/g, '\\"')}"`
    }
    
    categories[category].push(`${key}=${formattedValue}`)
  }
  
  // Add AI section
  if (categories.ai.length > 0) {
    lines.push('# AI Services')
    lines.push(...categories.ai)
    lines.push('')
  }
  
  // Add Auth section
  if (categories.auth.length > 0) {
    lines.push('# Authentication')
    lines.push(...categories.auth)
    lines.push('')
  }
  
  // Add Database section
  if (categories.database.length > 0) {
    lines.push('# Database')
    lines.push(...categories.database)
    lines.push('')
  }
  
  // Add Other section
  if (categories.other.length > 0) {
    lines.push('# Other')
    lines.push(...categories.other)
    lines.push('')
  }
  
  return lines.join('\n')
}

// Mask secret values
function maskValue(value: string): string {
  if (value.length <= 8) {
    return '****'
  }
  return value.substring(0, 4) + '****' + value.substring(value.length - 4)
}

// GET - Get all environment variables
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

    const envPath = getEnvFilePath()
    
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      return NextResponse.json({
        variables: ENV_VARIABLES.map(v => ({
          ...v,
          value: '',
          maskedValue: '',
          isSet: false,
        })),
        customVariables: [],
      })
    }

    // Read and parse .env file
    const content = fs.readFileSync(envPath, 'utf-8')
    const env = parseEnvFile(content)

    // Map known variables with their values
    const variables = ENV_VARIABLES.map(v => ({
      ...v,
      value: env[v.key] || '',
      maskedValue: env[v.key] ? (v.isSecret ? maskValue(env[v.key]) : env[v.key]) : '',
      isSet: !!env[v.key],
    }))

    // Find custom variables (not in known list)
    const knownKeys = new Set(ENV_VARIABLES.map(v => v.key))
    const customVariables = Object.entries(env)
      .filter(([key]) => !knownKeys.has(key))
      .map(([key, value]) => ({
        key,
        name: key,
        description: 'Özel değişken',
        category: 'other',
        isRequired: false,
        isSecret: key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') || key.toLowerCase().includes('password'),
        link: null,
        value,
        maskedValue: (key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') || key.toLowerCase().includes('password')) 
          ? maskValue(value) 
          : value,
        isSet: true,
      }))

    return NextResponse.json({
      variables,
      customVariables,
    })
  } catch (error) {
    console.error('.env dosyası okunamadı:', error)
    return NextResponse.json(
      { error: '.env dosyası okunamadı' },
      { status: 500 }
    )
  }
}

// PUT - Update environment variables
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { variables } = body as { variables: Record<string, string> }

    if (!variables || typeof variables !== 'object') {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      )
    }

    const envPath = getEnvFilePath()
    
    // Read existing .env file
    let existingEnv: Record<string, string> = {}
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8')
      existingEnv = parseEnvFile(content)
    }

    // Merge with new values (empty strings remove the variable)
    const newEnv: Record<string, string> = { ...existingEnv }
    for (const [key, value] of Object.entries(variables)) {
      if (value === '' || value === null || value === undefined) {
        delete newEnv[key]
      } else {
        newEnv[key] = value
      }
    }

    // Generate new .env content
    const newContent = generateEnvContent(newEnv)

    // Create backup of existing .env
    if (fs.existsSync(envPath)) {
      const backupPath = envPath + '.backup'
      fs.copyFileSync(envPath, backupPath)
    }

    // Write new .env file
    fs.writeFileSync(envPath, newContent, 'utf-8')

    // Reset AI clients to use new keys
    try {
      const { resetGenAIClient } = await import('@/lib/gemini')
      resetGenAIClient()
    } catch {
      // Ignore if function doesn't exist
    }

    try {
      const { resetGenAIClient } = await import('@/lib/imagen')
      resetGenAIClient()
    } catch {
      // Ignore if function doesn't exist
    }

    return NextResponse.json({
      success: true,
      message: 'Ortam değişkenleri güncellendi. Bazı değişiklikler için sunucu yeniden başlatılması gerekebilir.',
    })
  } catch (error) {
    console.error('.env dosyası güncellenemedi:', error)
    return NextResponse.json(
      { error: '.env dosyası güncellenemedi' },
      { status: 500 }
    )
  }
}

// POST - Add new custom variable
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

    const body = await request.json()
    const { key, value } = body as { key: string; value: string }

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Geçersiz anahtar adı' },
        { status: 400 }
      )
    }

    // Validate key format (uppercase, underscores, numbers)
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
      return NextResponse.json(
        { error: 'Anahtar adı büyük harfle başlamalı ve sadece büyük harf, rakam ve alt çizgi içermelidir' },
        { status: 400 }
      )
    }

    const envPath = getEnvFilePath()
    
    // Read existing .env file
    let existingEnv: Record<string, string> = {}
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8')
      existingEnv = parseEnvFile(content)
    }

    // Check if key already exists
    if (existingEnv[key]) {
      return NextResponse.json(
        { error: 'Bu anahtar zaten mevcut' },
        { status: 400 }
      )
    }

    // Add new variable
    existingEnv[key] = value || ''

    // Generate new .env content
    const newContent = generateEnvContent(existingEnv)

    // Write new .env file
    fs.writeFileSync(envPath, newContent, 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'Yeni değişken eklendi',
    })
  } catch (error) {
    console.error('Değişken eklenemedi:', error)
    return NextResponse.json(
      { error: 'Değişken eklenemedi' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a variable
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Anahtar adı gerekli' },
        { status: 400 }
      )
    }

    // Check if it's a required variable
    const varConfig = ENV_VARIABLES.find(v => v.key === key)
    if (varConfig?.isRequired) {
      return NextResponse.json(
        { error: 'Zorunlu değişkenler silinemez' },
        { status: 400 }
      )
    }

    const envPath = getEnvFilePath()
    
    // Read existing .env file
    if (!fs.existsSync(envPath)) {
      return NextResponse.json(
        { error: '.env dosyası bulunamadı' },
        { status: 404 }
      )
    }

    const content = fs.readFileSync(envPath, 'utf-8')
    const existingEnv = parseEnvFile(content)

    // Remove variable
    delete existingEnv[key]

    // Generate new .env content
    const newContent = generateEnvContent(existingEnv)

    // Write new .env file
    fs.writeFileSync(envPath, newContent, 'utf-8')

    return NextResponse.json({
      success: true,
      message: 'Değişken silindi',
    })
  } catch (error) {
    console.error('Değişken silinemedi:', error)
    return NextResponse.json(
      { error: 'Değişken silinemedi' },
      { status: 500 }
    )
  }
}
