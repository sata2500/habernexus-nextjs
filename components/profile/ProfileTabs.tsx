'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, Bookmark, Heart, Eye, MessageSquare, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string
  category: string
  viewCount: number
  publishedAt: string
  commentCount: number
  bookmarkCount: number
  likeCount: number
}

interface ProfileTabsProps {
  userId: string
  username: string | null
  initialArticles: Article[]
  articleCount: number
  bookmarkCount: number
  isOwnProfile: boolean
}

type TabType = 'articles' | 'bookmarks' | 'likes'

export default function ProfileTabs({
  userId,
  username,
  initialArticles,
  articleCount,
  bookmarkCount,
  isOwnProfile
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('articles')
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [isLoading, setIsLoading] = useState(false)

  const tabs = [
    { id: 'articles' as TabType, label: 'Makaleler', icon: FileText, count: articleCount },
    ...(isOwnProfile ? [
      { id: 'bookmarks' as TabType, label: 'Yer İşaretleri', icon: Bookmark, count: bookmarkCount },
    ] : []),
  ]

  const handleTabChange = async (tab: TabType) => {
    if (tab === activeTab) return
    
    setActiveTab(tab)
    setIsLoading(true)

    try {
      let endpoint = ''
      if (tab === 'articles') {
        endpoint = `/api/users/${username || userId}/articles`
      } else if (tab === 'bookmarks') {
        endpoint = `/api/bookmarks`
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        if (tab === 'bookmarks') {
          // Transform bookmarks to article format
          setArticles(data.bookmarks?.map((b: { article: Article }) => b.article) || [])
        } else {
          setArticles(data.articles || [])
        }
      }
    } catch (error) {
      console.error('Error fetching tab data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {activeTab === 'articles' && 'Henüz makale yok'}
            {activeTab === 'bookmarks' && 'Henüz yer işareti yok'}
            {activeTab === 'likes' && 'Henüz beğenilen makale yok'}
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/haber/${article.slug}`}
                className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* Article Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Article Info */}
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded mb-2">
                    {article.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {article.commentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {article.likeCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
