import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'
import ArticleCard from '@/components/articles/ArticleCard'
import { Newspaper, TrendingUp, Cpu, Trophy, Heart, Palette, FlaskConical, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Newspaper,
  TrendingUp,
  Cpu,
  Trophy,
  Heart,
  Palette,
  FlaskConical,
  Globe,
}

const ARTICLES_PER_PAGE = 9

// Kategorideki makaleleri veritabanından çek
async function getArticlesByCategory(categorySlug: string, page: number = 1) {
  // Kategori adını bul (slug'dan)
  const category = CATEGORIES.find((c) => c.slug === categorySlug)
  if (!category) return { articles: [], total: 0 }

  const skip = (page - 1) * ARTICLES_PER_PAGE

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: {
        category: category.name,
      },
      skip,
      take: ARTICLES_PER_PAGE,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.article.count({
      where: {
        category: category.name,
      },
    }),
  ])

  return { articles, total }
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  
  const category = CATEGORIES.find((c) => c.slug === slug)

  if (!category) {
    notFound()
  }

  const currentPage = pageParam ? parseInt(pageParam, 10) : 1
  const { articles, total } = await getArticlesByCategory(slug, currentPage)
  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE)

  const Icon = iconMap[category.icon] || Newspaper

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <header className="mb-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
              <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {category.name} kategorisindeki en güncel haberler
              </p>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sırala:</span>
            <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="newest">En Yeni</option>
              <option value="popular">En Popüler</option>
              <option value="oldest">En Eski</option>
            </select>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {total} haber bulundu
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Newspaper className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Henüz haber yok
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Bu kategoride henüz haber bulunmuyor.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-12 space-x-2">
            {/* Previous Button */}
            {currentPage > 1 ? (
              <Link
                href={`/kategori/${slug}?page=${currentPage - 1}`}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Önceki
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center px-4 py-2 text-gray-400 cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Önceki
              </button>
            )}

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Link
                  key={pageNum}
                  href={`/kategori/${slug}?page=${pageNum}`}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}

            {/* Show ellipsis and last page if needed */}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-2 text-gray-400">...</span>
                <Link
                  href={`/kategori/${slug}?page=${totalPages}`}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {totalPages}
                </Link>
              </>
            )}

            {/* Next Button */}
            {currentPage < totalPages ? (
              <Link
                href={`/kategori/${slug}?page=${currentPage + 1}`}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sonraki
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center px-4 py-2 text-gray-400 cursor-not-allowed"
              >
                Sonraki
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
