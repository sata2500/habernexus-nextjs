'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Clock, Eye, ArrowLeft, Loader2 } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string
  category: string
  viewCount: number
  publishedAt: string
  author: {
    name: string | null
  }
}

interface SearchResponse {
  results: SearchResult[]
  total: number
  query: string
  hasMore: boolean
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setTotal(0)
      setSearched(false)
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`)
      if (!response.ok) throw new Error('Arama başarısız')
      
      const data: SearchResponse = await response.json()
      setResults(data.results)
      setTotal(data.total)
    } catch (error) {
      console.error('Arama hatası:', error)
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length >= 2) {
      router.push(`/arama?q=${encodeURIComponent(query)}`)
      performSearch(query)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfaya Dön
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Haber Ara</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Haber başlığı veya içeriği ara..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              type="submit"
              disabled={query.length < 2 || loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ara'}
            </button>
          </form>
          
          {query.length > 0 && query.length < 2 && (
            <p className="mt-2 text-sm text-gray-500">En az 2 karakter girin</p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : searched ? (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {total > 0 ? (
                <>
                  <span className="font-medium text-gray-900 dark:text-white">&quot;{initialQuery}&quot;</span> için{' '}
                  <span className="font-medium text-gray-900 dark:text-white">{total}</span> sonuç bulundu
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-900 dark:text-white">&quot;{initialQuery}&quot;</span> için sonuç bulunamadı
                </>
              )}
            </p>

            {results.length > 0 ? (
              <div className="space-y-6">
                {results.map((article) => (
                  <Link
                    key={article.id}
                    href={`/haber/${article.slug}`}
                    className="flex gap-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="relative w-48 h-32 flex-shrink-0">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 py-3 pr-4">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded mb-2">
                        {article.category}
                      </span>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.viewCount.toLocaleString('tr-TR')}
                        </span>
                        {article.author.name && (
                          <span>{article.author.name}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Farklı anahtar kelimeler deneyin veya daha genel terimler kullanın.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aramak istediğiniz kelimeyi yukarıya yazın
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
}
