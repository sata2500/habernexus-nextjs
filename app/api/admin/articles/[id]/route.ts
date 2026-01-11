import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/articles/[id] - Tek makale getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json(
        { error: 'Makale bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Makale getirilemedi:', error)
    return NextResponse.json(
      { error: 'Makale getirilemedi' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/articles/[id] - Makaleyi güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, excerpt, category, imageUrl } = body

    const updateData: Record<string, string> = {}
    if (title) updateData.title = title
    if (content) updateData.content = content
    if (excerpt) updateData.excerpt = excerpt
    if (category) updateData.category = category
    if (imageUrl) updateData.imageUrl = imageUrl

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
      }
    })

    return NextResponse.json(updatedArticle)
  } catch (error) {
    console.error('Makale güncellenemedi:', error)
    return NextResponse.json(
      { error: 'Makale güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/articles/[id] - Makaleyi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    
    // Admin kontrolü
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    await prisma.article.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Makale silinemedi:', error)
    return NextResponse.json(
      { error: 'Makale silinemedi' },
      { status: 500 }
    )
  }
}
