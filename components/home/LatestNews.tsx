import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ArticleCard from '@/components/articles/ArticleCard'
import { prisma } from '@/lib/prisma'

// Son haberleri veritabanından çek
async function getLatestArticles() {
  const articles = await prisma.article.findMany({
    take: 6,
    orderBy: { publishedAt: 'desc' },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  })

  return articles
}

export default async function LatestNews() {
  const articles = await getLatestArticles()

  // Eğer hiç makale yoksa bileşeni gösterme
  if (articles.length === 0) {
    return null
  }

  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Son Haberler
          </h2>
          <Link
            href="/haberler"
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Tüm Haberler
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Article */}
          <div className="lg:col-span-2">
            <ArticleCard article={featuredArticle} variant="featured" />
          </div>

          {/* Side Articles */}
          <div className="space-y-4">
            {otherArticles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>

        {/* More Articles Grid */}
        {otherArticles.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {otherArticles.slice(3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
