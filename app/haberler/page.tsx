import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye, ChevronLeft, ChevronRight, Filter, Newspaper } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDateShort } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Tüm Haberler | HaberNexus',
  description: 'HaberNexus - Tüm kategorilerden en güncel haberler.',
}

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>
}

const ITEMS_PER_PAGE = 12

async function getArticles(page: number, category?: string) {
  try {
    const where = category ? { category: { contains: category, mode: 'insensitive' } } : {}
    
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          category: true,
          viewCount: true,
          publishedAt: true,
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ])

    return {
      articles,
      totalCount,
      totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    }
  } catch (error) {
    console.error('Error fetching articles:', error)
    return {
      articles: [],
      totalCount: 0,
      totalPages: 0,
    }
  }
}

export default async function AllNewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const category = params.category

  const { articles, totalCount, totalPages } = await getArticles(page, category)

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {category ? `${category} Haberleri` : 'Tüm Haberler'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Toplam {totalCount.toLocaleString('tr-TR')} haber bulundu
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              defaultValue={category || ''}
              onChange={(e) => {
                const value = e.target.value
                if (value) {
                  window.location.href = `/haberler?category=${encodeURIComponent(value)}`
                } else {
                  window.location.href = '/haberler'
                }
              }}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tüm Kategoriler</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 mb-12">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/haber/${article.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {article.imageUrl ? (
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.src = '/images/placeholder.jpg'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                      <Newspaper className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h2>
                  
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateShort(article.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {article.viewCount.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Newspaper className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {category ? `${category} kategorisinde henüz haber bulunmuyor.` : 'Henüz haber bulunmuyor.'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
              Lütfen daha sonra tekrar kontrol edin veya başka bir kategori seçin.
            </p>
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Ana Sayfaya Dön
            </Link>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {/* Previous */}
            {page > 1 ? (
              <Link
                href={`/haberler?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Önceki
              </Link>
            ) : (
              <span className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Önceki
              </span>
            )}

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                return (
                  <Link
                    key={pageNum}
                    href={`/haberler?page=${pageNum}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
            </div>

            {/* Current Page Info (Mobile) */}
            <span className="sm:hidden px-4 py-2 text-gray-600 dark:text-gray-400">
              Sayfa {page} / {totalPages}
            </span>

            {/* Next */}
            {page < totalPages ? (
              <Link
                href={`/haberler?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Sonraki
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            ) : (
              <span className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 cursor-not-allowed">
                Sonraki
                <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
