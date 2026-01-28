import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * Category Management API
 * 
 * GET /api/admin/categories
 * Get all categories with statistics
 * 
 * POST /api/admin/categories
 * Create a new category
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

// Predefined categories
const PREDEFINED_CATEGORIES = [
  { name: 'Gündem', slug: 'gundem', description: 'Güncel haberler ve gelişmeler' },
  { name: 'Ekonomi', slug: 'ekonomi', description: 'Ekonomi ve finans haberleri' },
  { name: 'Teknoloji', slug: 'teknoloji', description: 'Teknoloji ve inovasyonlar' },
  { name: 'Spor', slug: 'spor', description: 'Spor haberleri ve etkinlikleri' },
  { name: 'Sağlık', slug: 'saglik', description: 'Sağlık ve tıp haberleri' },
  { name: 'Kültür-Sanat', slug: 'kultur-sanat', description: 'Kültür ve sanat haberleri' },
  { name: 'Dünya', slug: 'dunya', description: 'Uluslararası haberler' },
  { name: 'Bilim', slug: 'bilim', description: 'Bilim ve araştırma haberleri' },
]

/**
 * GET /api/admin/categories
 * Get all categories with article counts
 */
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get article counts by category
    const categoryCounts = await prisma.article.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    })

    // Create a map for quick lookup, filtering out null categories
    const countMap = new Map<string, number>()
    categoryCounts.forEach(item => {
      if (item.category) {
        countMap.set(item.category, item._count.id)
      }
    })

    // Get unique categories from articles
    const uniqueCategories = new Set<string>()
    categoryCounts.forEach(item => {
      if (item.category) {
        uniqueCategories.add(item.category)
      }
    })

    // Combine with predefined categories
    const allCategories = PREDEFINED_CATEGORIES.map(cat => ({
      ...cat,
      articleCount: countMap.get(cat.name) || 0,
      isPredefined: true,
    }))

    // Add any custom categories from articles
    uniqueCategories.forEach(category => {
      if (!allCategories.find(c => c.name === category)) {
        allCategories.push({
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          description: 'Özel kategori',
          articleCount: countMap.get(category) || 0,
          isPredefined: false,
        })
      }
    })

    // Sort by article count (descending)
    allCategories.sort((a, b) => b.articleCount - a.articleCount)

    // Get total statistics
    const totalArticles = await prisma.article.count()
    const categorizedArticles = await prisma.article.count({
      where: {
        category: {
          not: '',
        },
      },
    })

    return NextResponse.json({
      categories: allCategories,
      statistics: {
        totalCategories: allCategories.length,
        totalArticles,
        categorizedArticles,
        uncategorizedArticles: totalArticles - categorizedArticles,
        predefinedCount: PREDEFINED_CATEGORIES.length,
        customCount: allCategories.length - PREDEFINED_CATEGORIES.length,
      },
    })
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/categories
 * Bulk update article categories
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { articleIds, category } = body

    if (!articleIds || !Array.isArray(articleIds) || !category) {
      return NextResponse.json(
        { error: 'articleIds array and category are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = PREDEFINED_CATEGORIES.map(c => c.name)
    if (!validCategories.includes(category) && category.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Update articles
    const result = await prisma.article.updateMany({
      where: {
        id: {
          in: articleIds,
        },
      },
      data: {
        category,
      },
    })

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `${result.count} makale '${category}' kategorisine taşındı`,
    })
  } catch (error) {
    console.error('Update categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
