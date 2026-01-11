'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Check, X, Trash2, Loader2, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  article: {
    id: string
    title: string
    slug: string
  }
}

interface Counts {
  pending: number
  approved: number
  rejected: number
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [activeTab])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/comments?status=${activeTab}`)
      
      if (!response.ok) {
        throw new Error('Yorumlar yüklenemedi')
      }

      const data = await response.json()
      setComments(data.comments)
      setCounts(data.counts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id)
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('İşlem başarısız')
      }

      // Refresh comments
      fetchComments()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return

    setProcessingId(id)
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız')
      }

      // Refresh comments
      fetchComments()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setProcessingId(null)
    }
  }

  const tabs = [
    { id: 'PENDING' as const, label: 'Bekleyen', count: counts.pending, icon: Clock },
    { id: 'APPROVED' as const, label: 'Onaylanan', count: counts.approved, icon: CheckCircle },
    { id: 'REJECTED' as const, label: 'Reddedilen', count: counts.rejected, icon: XCircle },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageCircle className="w-7 h-7 mr-2" />
            Yorum Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kullanıcı yorumlarını yönetin ve moderasyon yapın
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs',
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Bu kategoride yorum bulunmuyor</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* User Info */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.user.name || 'Anonim'}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({comment.user.email})
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {comment.content}
                  </p>

                  {/* Article Link */}
                  <Link
                    href={`/haber/${comment.article.slug}`}
                    className="text-sm text-blue-600 hover:underline"
                    target="_blank"
                  >
                    {comment.article.title}
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {activeTab === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(comment.id, 'APPROVED')}
                        disabled={processingId === comment.id}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Onayla"
                      >
                        {processingId === comment.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(comment.id, 'REJECTED')}
                        disabled={processingId === comment.id}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Reddet"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={processingId === comment.id}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    title="Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
