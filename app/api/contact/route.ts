import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz' },
        { status: 400 }
      )
    }

    // Name validation
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'İsim 2-100 karakter arasında olmalıdır' },
        { status: 400 }
      )
    }

    // Message validation
    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Mesaj 10-5000 karakter arasında olmalıdır' },
        { status: 400 }
      )
    }

    // Valid subjects
    const validSubjects = ['genel', 'teknik', 'oneri', 'hata', 'isbirligi', 'diger']
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { error: 'Geçersiz konu seçimi' },
        { status: 400 }
      )
    }

    // Store contact message in database
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    })

    return NextResponse.json(
      { message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    )
  }
}
