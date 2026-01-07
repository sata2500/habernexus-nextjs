'use client'

import { useState, useEffect } from 'react'
import { Share2, Bookmark, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'

interface ArticleActionsProps {
  articleId: string
  articleTitle: string
  articleUrl: string
}

export default function ArticleActions({ articleId, articleTitle, articleUrl }: ArticleActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)
  const [userVote, setUserVote] = useState<boolean | null>(null)
  const [voteLoading, setVoteLoading] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(0)
  const [notHelpfulCount, setNotHelpfulCount] = useState(0)

  // Sayfa yüklendiğinde bookmark ve oy durumunu kontrol et
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Bookmark durumu
        const bookmarkRes = await fetch(`/api/bookmarks/${articleId}`)
        if (bookmarkRes.ok) {
          const bookmarkData = await bookmarkRes.json()
          setIsBookmarked(bookmarkData.isBookmarked)
        }

        // Oy durumu
        const voteRes = await fetch(`/api/articles/${articleId}/vote`)
        if (voteRes.ok) {
          const voteData = await voteRes.json()
          setUserVote(voteData.userVote)
          setHelpfulCount(voteData.helpfulCount)
          setNotHelpfulCount(voteData.notHelpfulCount)
        }
      } catch (error) {
        console.error('Status check error:', error)
      }
    }

    checkStatus()
  }, [articleId])

  // Görüntülenme sayısını artır
  useEffect(() => {
    const incrementView = async () => {
      try {
        await fetch(`/api/articles/${articleId}/view`, {
          method: 'POST',
        })
      } catch (error) {
        console.error('View increment error:', error)
      }
    }

    incrementView()
  }, [articleId])

  const handleBookmark = async () => {
    if (bookmarkLoading) return
    setBookmarkLoading(true)

    try {
      if (isBookmarked) {
        const response = await fetch(`/api/bookmarks/${articleId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setIsBookmarked(false)
        } else if (response.status === 401) {
          window.location.href = '/auth/signin'
        }
      } else {
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId }),
        })
        
        if (response.ok) {
          setIsBookmarked(true)
        } else if (response.status === 401) {
          window.location.href = '/auth/signin'
        }
      }
    } catch (error) {
      console.error('Bookmark error:', error)
    } finally {
      setBookmarkLoading(false)
    }
  }

  const handleVote = async (isHelpful: boolean) => {
    if (voteLoading) return
    setVoteLoading(true)

    try {
      const response = await fetch(`/api/articles/${articleId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHelpful }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserVote(data.userVote)
        
        // Oy sayılarını güncelle
        const voteRes = await fetch(`/api/articles/${articleId}/vote`)
        if (voteRes.ok) {
          const voteData = await voteRes.json()
          setHelpfulCount(voteData.helpfulCount)
          setNotHelpfulCount(voteData.notHelpfulCount)
        }
      } else if (response.status === 401) {
        window.location.href = '/auth/signin'
      }
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setVoteLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: articleTitle,
          url: articleUrl,
        })
      } catch (error) {
        // Kullanıcı paylaşımı iptal etti
        console.log('Share cancelled:', error)
      }
    } else {
      // Fallback: URL'yi panoya kopyala
      try {
        await navigator.clipboard.writeText(articleUrl)
        alert('Bağlantı panoya kopyalandı!')
      } catch {
        // Kopyalama başarısız
        console.error('Copy failed')
      }
    }
  }

  return (
    <>
      {/* Header Actions */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked 
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
              : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
          }`}
          aria-label={isBookmarked ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
        >
          {bookmarkLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          )}
        </button>
        <button 
          onClick={handleShare}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Paylaş"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Bu makale faydalı mıydı?</span>
          <button 
            onClick={() => handleVote(true)}
            disabled={voteLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              userVote === true 
                ? 'text-green-600 bg-green-50' 
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            {voteLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ThumbsUp className={`w-5 h-5 ${userVote === true ? 'fill-current' : ''}`} />
                <span>Evet {helpfulCount > 0 && `(${helpfulCount})`}</span>
              </>
            )}
          </button>
          <button 
            onClick={() => handleVote(false)}
            disabled={voteLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              userVote === false 
                ? 'text-red-600 bg-red-50' 
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            {voteLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ThumbsDown className={`w-5 h-5 ${userVote === false ? 'fill-current' : ''}`} />
                <span>Hayır {notHelpfulCount > 0 && `(${notHelpfulCount})`}</span>
              </>
            )}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Paylaş</span>
          </button>
        </div>
      </div>
    </>
  )
}
