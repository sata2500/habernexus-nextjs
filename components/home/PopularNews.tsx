import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Eye } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import { prisma } from '@/lib/prisma'

// En çok okunan makaleleri veritabanından çek
async function getPopularArticles() {
  const articles = await prisma.article.findMany({
    take: 5,
    orderBy: { viewCount: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      imageUrl: true,
      category: true,
      viewCount: true,
      publishedAt: true,
    },
  })

  return articles.map((article, index) => ({
    ...article,
    rank: index + 1,
  }))
}

export default async function PopularNews() {
  const popularArticles = await getPopularArticles()

  // Eğer hiç makale yoksa bileşeni gösterme
  if (popularArticles.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-2 mb-8">
          <TrendingUp className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            En Çok Okunanlar
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {popularArticles.map((article) => (
            <Link
              key={article.id}
              href={`/haber/${article.slug}`}
              className="group relative"
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-gray-900">
                  {article.rank}
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-600/80 backdrop-blur-sm rounded-full">
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-white text-sm line-clamp-3 group-hover:text-blue-300 transition-colors mb-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-300">
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {article.viewCount.toLocaleString('tr-TR')}
                    </span>
                    <span>{formatDateShort(article.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
