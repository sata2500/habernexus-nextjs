import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/settings - Tüm ayarları getir
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

    const settings = await prisma.systemSetting.findMany({
      orderBy: {
        key: 'asc'
      }
    })

    // Ayarları key-value objesi olarak dönüştür
    const settingsObj: Record<string, string> = {}
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value
    })

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Ayarlar getirilemedi:', error)
    return NextResponse.json(
      { error: 'Ayarlar getirilemedi' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/settings - Ayarları güncelle
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
    const updates: { key: string; value: string }[] = []

    // Her ayar için upsert işlemi
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        updates.push({ key, value })
      }
    }

    // Toplu güncelleme
    await Promise.all(
      updates.map(({ key, value }) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ayarlar güncellenemedi:', error)
    return NextResponse.json(
      { error: 'Ayarlar güncellenemedi' },
      { status: 500 }
    )
  }
}
