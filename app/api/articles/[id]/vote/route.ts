import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/articles/[id]/vote - Makale oy durumunu getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: articleId } = await params

    // Makale var mı kontrol et
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    // Toplam oyları hesapla
    const [helpfulCount, notHelpfulCount] = await Promise.all([
      prisma.articleVote.count({
        where: { articleId, isHelpful: true },
      }),
      prisma.articleVote.count({
        where: { articleId, isHelpful: false },
      }),
    ])

    // Kullanıcının oyu (giriş yapmışsa)
    let userVote: boolean | null = null
    if (session?.user?.id) {
      const vote = await prisma.articleVote.findUnique({
        where: {
          userId_articleId: {
            userId: session.user.id,
            articleId,
          },
        },
      })
      userVote = vote?.isHelpful ?? null
    }

    return NextResponse.json({
      success: true,
      helpfulCount,
      notHelpfulCount,
      userVote,
    })
  } catch (error) {
    console.error('Get vote error:', error)
    return NextResponse.json(
      { error: 'Oy bilgisi alınamadı' },
      { status: 500 }
    )
  }
}

// POST /api/articles/[id]/vote - Oy ver veya güncelle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: articleId } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { isHelpful } = body

    if (typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Geçersiz oy değeri' },
        { status: 400 }
      )
    }

    // Makale var mı kontrol et
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    // Mevcut oyu kontrol et
    const existingVote = await prisma.articleVote.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    })

    if (existingVote) {
      // Aynı oy ise sil (toggle)
      if (existingVote.isHelpful === isHelpful) {
        await prisma.articleVote.delete({
          where: {
            userId_articleId: {
              userId: session.user.id,
              articleId,
            },
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Oy kaldırıldı',
          userVote: null,
        })
      }

      // Farklı oy ise güncelle
      await prisma.articleVote.update({
        where: {
          userId_articleId: {
            userId: session.user.id,
            articleId,
          },
        },
        data: { isHelpful },
      })

      return NextResponse.json({
        success: true,
        message: 'Oy güncellendi',
        userVote: isHelpful,
      })
    }

    // Yeni oy oluştur
    await prisma.articleVote.create({
      data: {
        userId: session.user.id,
        articleId,
        isHelpful,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Oy kaydedildi',
      userVote: isHelpful,
    }, { status: 201 })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Oy kaydedilemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/[id]/vote - Oyu kaldır
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: articleId } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Giriş yapmanız gerekiyor' },
        { status: 401 }
      )
    }

    // Mevcut oyu kontrol et
    const existingVote = await prisma.articleVote.findUnique({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    })

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Oy bulunamadı' },
        { status: 404 }
      )
    }

    // Oyu sil
    await prisma.articleVote.delete({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Oy kaldırıldı',
    })
  } catch (error) {
    console.error('Delete vote error:', error)
    return NextResponse.json(
      { error: 'Oy kaldırılamadı' },
      { status: 500 }
    )
  }
}
