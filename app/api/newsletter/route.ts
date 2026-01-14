import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// E-posta formatı doğrulama
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// POST /api/newsletter - Newsletter'a abone ol
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    // E-posta formatını doğrula
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta adresi' },
        { status: 400 }
      )
    }

    // Mevcut aboneliği kontrol et
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    })

    if (existingSubscription) {
      // Eğer pasif ise aktif et
      if (!existingSubscription.isActive) {
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { isActive: true },
        })

        return NextResponse.json({
          success: true,
          message: 'Aboneliğiniz yeniden aktif edildi',
        })
      }

      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten abone' },
        { status: 409 }
      )
    }

    // Yeni abonelik oluştur
    await prisma.newsletterSubscription.create({
      data: { email },
    })

    return NextResponse.json({
      success: true,
      message: 'Bültenimize başarıyla abone oldunuz',
    }, { status: 201 })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Abonelik işlemi başarısız oldu' },
      { status: 500 }
    )
  }
}

// DELETE /api/newsletter - Newsletter aboneliğini iptal et
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    // Aboneliği bul
    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Abonelik bulunamadı' },
        { status: 404 }
      )
    }

    // Aboneliği pasif yap (soft delete)
    await prisma.newsletterSubscription.update({
      where: { email },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: 'Aboneliğiniz iptal edildi',
    })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Abonelik iptali başarısız oldu' },
      { status: 500 }
    )
  }
}

// GET /api/newsletter - Abonelik durumunu kontrol et veya toplam sayıyı al
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const email = searchParams.get('email')

    // Toplam aktif abone sayısını döndür
    if (action === 'count') {
      const count = await prisma.newsletterSubscription.count({
        where: { isActive: true },
      })

      return NextResponse.json({
        success: true,
        count,
      })
    }

    // E-posta ile abonelik durumu kontrolü
    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    })

    return NextResponse.json({
      success: true,
      isSubscribed: subscription?.isActive ?? false,
    })
  } catch (error) {
    console.error('Newsletter check error:', error)
    return NextResponse.json(
      { error: 'Abonelik durumu kontrol edilemedi' },
      { status: 500 }
    )
  }
}
