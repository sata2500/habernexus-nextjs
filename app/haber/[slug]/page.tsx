import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Eye, Calendar, ArrowLeft } from 'lucide-react'
import { formatDate, getReadingTime } from '@/lib/utils'
import ArticleCard from '@/components/articles/ArticleCard'
import ArticleActions from '@/components/articles/ArticleActions'
import AISummary from '@/components/articles/AISummary'
import SentimentBadge from '@/components/articles/SentimentBadge'
import CommentSection from '@/components/comments/CommentSection'
import { prisma } from '@/lib/prisma'

// Makaleyi veritabanından çek
async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          bookmarks: true,
          votes: true,
        },
      },
    },
  })

  return article
}

// İlgili makaleleri çek (aynı kategoriden)
async function getRelatedArticles(category: string, excludeSlug: string) {
  const articles = await prisma.article.findMany({
    where: {
      category,
      slug: { not: excludeSlug },
    },
    take: 3,
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

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(article.category, slug)
  const readingTime = getReadingTime(article.content)

  return (
    <article className="py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Link
              href={`/kategori/${article.category.toLowerCase()}`}
              className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            >
              {article.category}
            </Link>
            <SentimentBadge
              sentiment={article.sentiment}
              score={article.sentimentScore}
              articleId={article.id}
              showAnalyzeButton={true}
              size="sm"
            />
            <span className="text-gray-400">•</span>
            <span className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {readingTime} dk okuma
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                {article.author.image ? (
                  <Image
                    src={article.author.image}
                    alt={article.author.name || 'Yazar'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {article.author.name?.charAt(0) || 'H'}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {article.author.name || 'HaberNexus AI'}
                </p>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {article.viewCount.toLocaleString('tr-TR')} görüntülenme
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions - Client Component içinde */}
            <ArticleActions 
              articleId={article.id}
              articleTitle={article.title}
              articleUrl={`https://habernexus.com/haber/${article.slug}`}
            />
          </div>
        </header>

        {/* Featured Image */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="max-w-3xl mx-auto mb-8">
          <AISummary articleId={article.id} />
        </div>

        {/* Article Content */}
        <div className="max-w-3xl mx-auto">
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Comments Section */}
        <div className="max-w-3xl mx-auto">
          <CommentSection articleId={article.id} />
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="max-w-6xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              İlgili Haberler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
