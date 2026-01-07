import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/articles/[id]/view - Görüntülenme sayısını artır
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Makaleyi bul ve viewCount'u artır
    const article = await prisma.article.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewCount: true,
      },
    })

    return NextResponse.json({
      success: true,
      viewCount: article.viewCount,
    })
  } catch (error) {
    console.error('View count error:', error)
    
    // Makale bulunamadı hatası
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Görüntülenme sayısı güncellenemedi' },
      { status: 500 }
    )
  }
}

// GET /api/articles/[id]/view - Mevcut görüntülenme sayısını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        viewCount: true,
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      viewCount: article.viewCount,
    })
  } catch (error) {
    console.error('Get view count error:', error)
    return NextResponse.json(
      { error: 'Görüntülenme sayısı alınamadı' },
      { status: 500 }
    )
  }
}
