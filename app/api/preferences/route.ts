import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

    // Validate input
    if (!Array.isArray(favoriteCategories)) {
      return NextResponse.json(
        { error: 'favoriteCategories bir dizi olmalıdır' },
        { status: 400 }
      )
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        favoriteCategories: favoriteCategories.join(','),
        excludedCategories: excludedCategories?.join(',') || null,
      },
      create: {
        userId: session.user.id,
        favoriteCategories: favoriteCategories.join(','),
        excludedCategories: excludedCategories?.join(',') || null,
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
