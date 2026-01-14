'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ThumbsUp, Reply, Trash2, Loader2, AlertCircle, Send } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string | null
  image: string | null
}

interface CommentReply {
  id: string
  content: string
  createdAt: string
  user: User
  _count: {
    likes: number
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: User
  replies: CommentReply[]
  _count: {
    likes: number
  }
}

interface CommentSectionProps {
  articleId: string
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { data: session, status } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [userLikes, setUserLikes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/comments?articleId=${articleId}`)
      
      if (!response.ok) {
        throw new Error('Yorumlar yüklenemedi')
      }

      const data = await response.json()
      setComments(data.comments)
      setUserLikes(data.userLikes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }, [articleId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: newComment.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Yorum eklenemedi')
      }

      // If auto-approved, add to list
      if (data.comment.status === 'APPROVED') {
        setComments([{ ...data.comment, replies: [] }, ...comments])
      }

      setNewComment('')
      alert(data.message)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          content: replyContent.trim(),
          parentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Yanıt eklenemedi')
      }

      // Refresh comments to show new reply
      fetchComments()
      setReplyingTo(null)
      setReplyContent('')
      alert(data.message)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!session) {
      alert('Beğenmek için giriş yapmalısınız')
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Beğeni işlemi başarısız')
      }

      // Update local state
      if (data.liked) {
        setUserLikes([...userLikes, commentId])
      } else {
        setUserLikes(userLikes.filter((id) => id !== commentId))
      }

      // Update comment like count
      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              _count: { ...comment._count, likes: data.likeCount },
            }
          }
          // Check replies
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  _count: { ...reply._count, likes: data.likeCount },
                }
              }
              return reply
            }),
          }
        })
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Yorum silinemedi')
      }

      // Remove from local state
      setComments(
        comments
          .filter((comment) => comment.id !== commentId)
          .map((comment) => ({
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== commentId),
          }))
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <MessageCircle className="w-6 h-6 mr-2" />
        Yorumlar ({comments.length})
      </h2>

      {/* Comment Form */}
      {status === 'authenticated' ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'Kullanıcı'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {session?.user?.name?.charAt(0) || 'K'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Yorumunuzu yazın..."
                rows={3}
                maxLength={1000}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {newComment.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Gönder
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Yorum yapmak için giriş yapmalısınız
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userLikes={userLikes}
              currentUserId={session?.user?.id}
              onLike={handleLike}
              onDelete={handleDelete}
              onReply={(id) => setReplyingTo(id)}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </section>
  )
}

interface CommentItemProps {
  comment: Comment | CommentReply
  userLikes: string[]
  currentUserId?: string
  onLike: (id: string) => void
  onDelete: (id: string) => void
  onReply?: (id: string) => void
  replyingTo?: string | null
  replyContent?: string
  setReplyContent?: (content: string) => void
  onSubmitReply?: (parentId: string) => void
  isSubmitting?: boolean
  isReply?: boolean
}

function CommentItem({
  comment,
  userLikes,
  currentUserId,
  onLike,
  onDelete,
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  isSubmitting,
  isReply = false,
}: CommentItemProps) {
  const isLiked = userLikes.includes(comment.id)
  const isOwner = currentUserId === comment.user.id
  const hasReplies = 'replies' in comment && comment.replies.length > 0

  return (
    <div className={cn('group', isReply && 'ml-12 mt-4')}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {comment.user.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user.name || 'Kullanıcı'}
              width={isReply ? 32 : 40}
              height={isReply ? 32 : 40}
              className="rounded-full"
            />
          ) : (
            <div
              className={cn(
                'bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center',
                isReply ? 'w-8 h-8' : 'w-10 h-10'
              )}
            >
              <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                {comment.user.name?.charAt(0) || 'K'}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white">
              {comment.user.name || 'Anonim'}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => onLike(comment.id)}
              className={cn(
                'flex items-center space-x-1 text-sm transition-colors',
                isLiked
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              )}
            >
              <ThumbsUp className={cn('w-4 h-4', isLiked && 'fill-current')} />
              <span>{comment._count.likes}</span>
            </button>

            {!isReply && onReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Yanıtla</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sil</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && setReplyContent && onSubmitReply && (
            <div className="mt-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Yanıtınızı yazın..."
                rows={2}
                maxLength={1000}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              />
              <div className="flex items-center justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    if (onReply) onReply('')
                    setReplyContent('')
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => onSubmitReply(comment.id)}
                  disabled={isSubmitting || !replyContent?.trim()}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 mr-1" />
                  )}
                  Yanıtla
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div className="mt-4 space-y-4">
          {(comment as Comment).replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              userLikes={userLikes}
              currentUserId={currentUserId}
              onLike={onLike}
              onDelete={onDelete}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  )
}
