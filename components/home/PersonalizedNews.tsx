'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Settings, Sparkles, Clock, Eye, MessageCircle, Loader2, ChevronRight } from 'lucide-react'
import PreferencesModal from '@/components/preferences/PreferencesModal'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string
  category: string
  viewCount: number
  sentiment: string | null
  sentimentScore: number | null
  publishedAt: string
  author: {
    name: string | null
    image: string | null
  }
  _count: {
    comments: number
    bookmarks: number
  }
}

interface PersonalizedNewsResponse {
  articles: Article[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
  isPersonalized: boolean
}

export default function PersonalizedNews() {
  const { status } = useSession()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPersonalized, setIsPersonalized] = useState(false)
  const [showPreferencesModal, setShowPreferencesModal] = useState(false)

  const fetchArticles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/personalized?limit=6&t=${Date.now()}`, { cache: 'no-store' })
      if (response.ok) {
        const data: PersonalizedNewsResponse = await response.json()
        setArticles(data.articles)
        setIsPersonalized(data.isPersonalized)
      }
    } catch (error) {
      console.error('Error fetching personalized articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [status])

  const handlePreferencesSaved = () => {
    fetchArticles()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Az önce'
    if (diffHours < 24) return `${diffHours} saat önce`
    if (diffDays < 7) return `${diffDays} gün önce`
    return date.toLocaleDateString('tr-TR')
  }

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null
    
    const badges = {
      POSITIVE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Olumlu' },
      NEGATIVE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Olumsuz' },
      NEUTRAL: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Nötr' },
    }
    
    const badge = badges[sentiment as keyof typeof badges]
    if (!badge) return null
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isPersonalized ? 'Sizin İçin Seçtiklerimiz' : 'Son Haberler'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isPersonalized 
                  ? 'İlgi alanlarınıza göre özelleştirilmiş haberler'
                  : 'En güncel haberler'}
              </p>
            </div>
          </div>
          
          {status === 'authenticated' && (
            <button
              onClick={() => setShowPreferencesModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Tercihlerimi Düzenle</span>
            </button>
          )}
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/haber/${article.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={article.imageUrl || '/images/placeholder.jpg'}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md">
                        {article.category}
                      </span>
                      {getSentimentBadge(article.sentiment)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {article.viewCount.toLocaleString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {article._count.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Link */}
            <div className="flex justify-center mt-8">
              <Link
                href="/arama"
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                Tüm Haberleri Gör
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Henüz haber bulunmuyor.
            </p>
          </div>
        )}

        {/* Login Prompt for Non-Authenticated Users */}
        {status === 'unauthenticated' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Kişiselleştirilmiş Haberler
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Giriş yaparak ilgi alanlarınıza göre haberler alın
                  </p>
                </div>
              </div>
              <Link
                href="/auth/signin"
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={handlePreferencesSaved}
      />
    </section>
  )
}
