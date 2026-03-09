import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CATEGORIES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

// Helper: Normalize incoming strings (e.g. "gundem" or "ekonomi") to their proper Names ("Gündem", "Ekonomi")
const normalizeCategory = (input: string) => {
  const cat = CATEGORIES.find(c => c.slug === input || c.id === input || c.name.toLowerCase() === input.toLowerCase() || c.name === input)
  return cat ? cat.name : input
}

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

    const rawFavs = preferences.favoriteCategories ? preferences.favoriteCategories.split(',').map(c => c.trim()).filter(Boolean) : []
    const rawExcls = preferences.excludedCategories ? preferences.excludedCategories.split(',').map(c => c.trim()).filter(Boolean) : []

    return NextResponse.json({
      favoriteCategories: rawFavs.map(normalizeCategory),
      excludedCategories: rawExcls.map(normalizeCategory),
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

    // Convert all incoming categories to their Normalized names
    const normalizedFavsList = favoriteCategories.map((c: string) => normalizeCategory(c))
    const normalizedExclsList = Array.isArray(excludedCategories) ? excludedCategories.map((c: string) => normalizeCategory(c)) : []

    // 1. Remove duplicates using Set
    // 2. Ensure logical consistency: if a category is excluded, it CANNOT be a favorite.
    const uniqueExcls = [...new Set(normalizedExclsList)]
    const uniqueFavs = [...new Set(normalizedFavsList)].filter(cat => !uniqueExcls.includes(cat))

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        favoriteCategories: uniqueFavs.length > 0 ? uniqueFavs.join(',') : null,
        excludedCategories: uniqueExcls.length > 0 ? uniqueExcls.join(',') : null,
      },
      create: {
        userId: session.user.id,
        favoriteCategories: uniqueFavs.length > 0 ? uniqueFavs.join(',') : null,
        excludedCategories: uniqueExcls.length > 0 ? uniqueExcls.join(',') : null,
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
