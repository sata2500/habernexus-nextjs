import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// .env dosyasının yolu
const ENV_FILE_PATH = path.join(process.cwd(), '.env')

// Hassas değişkenler - bu değişkenlerin değerleri maskelenecek
const SENSITIVE_KEYS = [
  'AUTH_SECRET',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY',
  'DATABASE_URL',
]

// Salt okunur değişkenler - bu değişkenler silinemez
const READONLY_KEYS = [
  'NODE_ENV',
]

interface EnvVariable {
  key: string
  value: string
  isSensitive: boolean
  isReadonly: boolean
  comment?: string
}

/**
 * Server'i gracefully restart et
 */
function restartServer() {
  try {
    console.log('[ENV] Server restart baslatiliyor...')
    process.exit(0)
  } catch (error) {
    console.error('[ENV] Server restart hatasi:', error)
  }
}

/**
 * .env dosyasını parse eder ve değişkenleri döndürür
 */
function parseEnvFile(): { variables: EnvVariable[]; rawContent: string } {
  try {
    if (!fs.existsSync(ENV_FILE_PATH)) {
      return { variables: [], rawContent: '' }
    }

    const content = fs.readFileSync(ENV_FILE_PATH, 'utf-8')
    const lines = content.split('\n')
    const variables: EnvVariable[] = []
    let currentComment = ''

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Yorum satırı
      if (trimmedLine.startsWith('#')) {
        currentComment = trimmedLine.substring(1).trim()
        continue
      }

      // Boş satır
      if (trimmedLine === '') {
        currentComment = ''
        continue
      }

      // Değişken satırı
      const match = trimmedLine.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (match) {
        const key = match[1]
        let value = match[2]

        // Tırnak işaretlerini kaldır
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }

        variables.push({
          key,
          value,
          isSensitive: SENSITIVE_KEYS.includes(key),
          isReadonly: READONLY_KEYS.includes(key),
          comment: currentComment || undefined,
        })
        currentComment = ''
      }
    }

    return { variables, rawContent: content }
  } catch (error) {
    console.error('.env dosyası okunamadı:', error)
    return { variables: [], rawContent: '' }
  }
}

/**
 * .env dosyasına değişkenleri yazar
 */
function writeEnvFile(variables: EnvVariable[]): boolean {
  try {
    // Değişkenleri grupla ve formatla
    const groups: Record<string, EnvVariable[]> = {}
    
    for (const variable of variables) {
      const groupKey = getGroupKey(variable.key)
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(variable)
    }

    // Dosya içeriğini oluştur
    let content = '# ===========================================\n'
    content += '# HaberNexus - Environment Variables\n'
    content += '# ===========================================\n'
    content += '# Bu dosya admin panelden yönetilmektedir\n'
    content += `# Son güncelleme: ${new Date().toISOString()}\n\n`

    const groupOrder = ['Database', 'Auth', 'OAuth', 'AI', 'Site', 'Node', 'Other']
    
    for (const groupName of groupOrder) {
      const groupVars = groups[groupName]
      if (groupVars && groupVars.length > 0) {
        content += `# -------------------------------------------\n`
        content += `# ${groupName}\n`
        content += `# -------------------------------------------\n`
        
        for (const variable of groupVars) {
          if (variable.comment) {
            content += `# ${variable.comment}\n`
          }
          // Değer boşluk içeriyorsa tırnak içine al
          const formattedValue = variable.value.includes(' ') || variable.value.includes('#')
            ? `"${variable.value}"`
            : variable.value
          content += `${variable.key}=${formattedValue}\n`
        }
        content += '\n'
      }
    }

    fs.writeFileSync(ENV_FILE_PATH, content, 'utf-8')
    return true
  } catch (error) {
    console.error('.env dosyası yazılamadı:', error)
    return false
  }
}

/**
 * Değişken anahtarına göre grup belirler
 */
function getGroupKey(key: string): string {
  if (key.includes('DATABASE')) return 'Database'
  if (key.includes('AUTH') && !key.includes('OAUTH')) return 'Auth'
  if (key.includes('GOOGLE') || key.includes('OAUTH')) return 'OAuth'
  if (key.includes('GEMINI') || key.includes('AI')) return 'AI'
  if (key.includes('SITE') || key.includes('PUBLIC')) return 'Site'
  if (key.includes('NODE')) return 'Node'
  return 'Other'
}

/**
 * Değeri maskeler (hassas değişkenler için)
 */
function maskValue(value: string): string {
  if (value.length <= 8) {
    return '*'.repeat(value.length)
  }
  return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4)
}

// GET /api/admin/env - Tüm .env değişkenlerini getir
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

    const { variables } = parseEnvFile()
    
    // Hassas değerleri maskele
    const maskedVariables = variables.map(v => ({
      ...v,
      value: v.isSensitive ? maskValue(v.value) : v.value,
      originalLength: v.value.length,
    }))

    return NextResponse.json({
      variables: maskedVariables,
      count: variables.length,
      lastModified: fs.existsSync(ENV_FILE_PATH) 
        ? fs.statSync(ENV_FILE_PATH).mtime.toISOString()
        : null,
    })
  } catch (error) {
    console.error('.env değişkenleri getirilemedi:', error)
    return NextResponse.json(
      { error: '.env değişkenleri getirilemedi' },
      { status: 500 }
    )
  }
}

// POST /api/admin/env - Yeni değişken ekle
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
    const { key, value, comment } = body

    // Validasyon
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir anahtar girilmelidir' },
        { status: 400 }
      )
    }

    // Anahtar formatı kontrolü
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      return NextResponse.json(
        { error: 'Anahtar sadece harf, rakam ve alt çizgi içerebilir ve harfle başlamalıdır' },
        { status: 400 }
      )
    }

    const { variables } = parseEnvFile()

    // Anahtar zaten var mı kontrol et
    if (variables.some(v => v.key === key)) {
      return NextResponse.json(
        { error: 'Bu anahtar zaten mevcut' },
        { status: 400 }
      )
    }

    // Yeni değişkeni ekle
    variables.push({
      key,
      value: value || '',
      isSensitive: SENSITIVE_KEYS.includes(key),
      isReadonly: READONLY_KEYS.includes(key),
      comment: comment || undefined,
    })

    // Dosyaya yaz
    if (!writeEnvFile(variables)) {
      return NextResponse.json(
        { error: '.env dosyası güncellenemedi' },
        { status: 500 }
      )
    }

    // process.env'e ekle
    process.env[key] = value || ''

    // Database'e de kaydet
    try {
      await prisma.systemSetting.create({
        data: { key, value: value || '' },
      })
    } catch (dbError) {
      console.warn(`[ENV] Database yazma hatası: ${key}`, dbError)
    }

    console.log(`[ENV] Yeni değişken eklendi: ${key}`)

    const response = NextResponse.json({ 
      success: true,
      message: `${key} değişkeni başarıyla eklendi. Server yeniden başlatılıyor...`,
    })

    setTimeout(() => {
      restartServer()
    }, 100)

    return response
  } catch (error) {
    console.error('.env değişkeni eklenemedi:', error)
    return NextResponse.json(
      { error: '.env değişkeni eklenemedi' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/env - Değişken güncelle
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
    const { key, value, comment } = body

    // Validasyon
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir anahtar girilmelidir' },
        { status: 400 }
      )
    }

    const { variables } = parseEnvFile()

    // Değişkeni bul
    const index = variables.findIndex(v => v.key === key)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Değişken bulunamadı' },
        { status: 404 }
      )
    }

    // Salt okunur kontrolü
    if (READONLY_KEYS.includes(key)) {
      return NextResponse.json(
        { error: 'Bu değişken salt okunurdur ve değiştirilemez' },
        { status: 403 }
      )
    }

    // Değişkeni güncelle
    variables[index] = {
      ...variables[index],
      value: value !== undefined ? value : variables[index].value,
      comment: comment !== undefined ? comment : variables[index].comment,
    }

    // Dosyaya yaz
    if (!writeEnvFile(variables)) {
      return NextResponse.json(
        { error: '.env dosyası güncellenemedi' },
        { status: 500 }
      )
    }

    // process.env'i güncelle
    process.env[key] = value

    // Database'e de kaydet (production ortamında kullanılmak için)
    try {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    } catch (dbError) {
      console.warn(`[ENV] Database yazma hatası: ${key}`, dbError)
    }

    if (SENSITIVE_KEYS.includes(key)) {
      console.log(`[ENV] Hassas değişken güncellendi: ${key}`)
    } else {
      console.log(`[ENV] Değişken güncellendi: ${key}=${value}`)
    }

    const response = NextResponse.json({ 
      success: true,
      message: `${key} değişkeni başarıyla güncellendi. Server yeniden başlatılıyor...`,
    })

    setTimeout(() => {
      restartServer()
    }, 100)

    return response
  } catch (error) {
    console.error('.env değişkeni güncellenemedi:', error)
    return NextResponse.json(
      { error: '.env değişkeni güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/env - Değişken sil
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

    // Validasyon
    if (!key) {
      return NextResponse.json(
        { error: 'Silinecek değişken anahtarı belirtilmelidir' },
        { status: 400 }
      )
    }

    const { variables } = parseEnvFile()

    // Değişkeni bul
    const index = variables.findIndex(v => v.key === key)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Değişken bulunamadı' },
        { status: 404 }
      )
    }

    // Salt okunur kontrolü
    if (READONLY_KEYS.includes(key)) {
      return NextResponse.json(
        { error: 'Bu değişken salt okunurdur ve silinemez' },
        { status: 403 }
      )
    }

    // Hassas değişken uyarısı
    if (SENSITIVE_KEYS.includes(key)) {
      // Yine de silinebilir ama log'a kaydet
      console.warn(`Hassas değişken siliniyor: ${key}`)
    }

    // Değişkeni sil
    variables.splice(index, 1)

    // Dosyaya yaz
    if (!writeEnvFile(variables)) {
      return NextResponse.json(
        { error: '.env dosyası güncellenemedi' },
        { status: 500 }
      )
    }

    // process.env'den sil
    delete process.env[key]

    // Database'den de sil
    try {
      await prisma.systemSetting.delete({
        where: { key },
      })
    } catch (dbError) {
      console.warn(`[ENV] Database silme hatası: ${key}`, dbError)
    }

    console.log(`[ENV] Değişken silindi: ${key}`)

    const response = NextResponse.json({ 
      success: true,
      message: `${key} değişkeni başarıyla silindi. Server yeniden başlatılıyor...`,
    })

    setTimeout(() => {
      restartServer()
    }, 100)

    return response
  } catch (error) {
    console.error('.env değişkeni silinemedi:', error)
    return NextResponse.json(
      { error: '.env değişkeni silinemedi' },
      { status: 500 }
    )
  }
}
