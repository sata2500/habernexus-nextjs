import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CATEGORIES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

/**
 * GET /api/preferences
 * Get current user's preferences
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    })

    if (!preferences) {
      // Return default preferences if not set
      return NextResponse.json({
        favoriteCategories: [],
        excludedCategories: [],
      })
    }

    return NextResponse.json({
      favoriteCategories: preferences.favoriteCategories 
        ? preferences.favoriteCategories.split(',').filter(Boolean)
        : [],
      excludedCategories: preferences.excludedCategories 
        ? preferences.excludedCategories.split(',').filter(Boolean)
        : [],
    })
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Tercihler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/preferences
 * Update user's preferences
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { favoriteCategories, excludedCategories } = body

    // Validasyon
    if (!Array.isArray(favoriteCategories)) {
      return NextResponse.json(
        { error: 'favoriteCategories bir dizi olmalıdır' },
        { status: 400 }
      )
    }

    // Helper: Normalize incoming strings (e.g. "gundem" or "ekonomi") to their proper Names ("Gündem", "Ekonomi")
    const normalizeCategory = (input: string) => {
      const cat = CATEGORIES.find(c => c.slug === input || c.id === input || c.name.toLowerCase() === input.toLowerCase() || c.name === input)
      return cat ? cat.name : input
    }
    
    // Convert all incoming categories to their Normalized names
    const normalizedFavs = favoriteCategories.map(c => typeof c === 'string' ? normalizeCategory(c) : c)
    const normalizedExcls = Array.isArray(excludedCategories) ? excludedCategories.map(c => typeof c === 'string' ? normalizeCategory(c) : c) : []

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        favoriteCategories: normalizedFavs.length > 0 ? normalizedFavs.join(',') : null,
        excludedCategories: normalizedExcls.length > 0 ? normalizedExcls.join(',') : null,
      },
      create: {
        userId: session.user.id,
        favoriteCategories: normalizedFavs.length > 0 ? normalizedFavs.join(',') : null,
        excludedCategories: normalizedExcls.length > 0 ? normalizedExcls.join(',') : null,
      },
    })

    return NextResponse.json({
      success: true,
      favoriteCategories: preferences.favoriteCategories 
        ? preferences.favoriteCategories.split(',').filter(Boolean)
        : [],
      excludedCategories: preferences.excludedCategories 
        ? preferences.excludedCategories.split(',').filter(Boolean)
        : [],
    })
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Tercihler güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
