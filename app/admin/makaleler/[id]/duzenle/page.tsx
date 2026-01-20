'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Eye,
  Newspaper
} from 'lucide-react'
import { CATEGORY_NAMES_LIST } from '@/lib/constants'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  imageUrl: string
  category: string
  viewCount: number
  publishedAt: string
}

export default function EditArticlePage() {
  const params = useParams()
  const articleId = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const fetchArticle = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`)
      if (!response.ok) {
        throw new Error('Makale bulunamadı')
      }
      const data = await response.json()
      setArticle(data)
      setTitle(data.title)
      setContent(data.content)
      setExcerpt(data.excerpt || '')
      setCategory(data.category)
      setImageUrl(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Makale yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [articleId])

  useEffect(() => {
    fetchArticle()
  }, [fetchArticle])

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !category) {
      setError('Başlık, içerik ve kategori zorunludur')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          category,
          imageUrl: imageUrl.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Makale güncellenemedi')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error && !article) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/makaleler"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Makalelere Dön
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/makaleler"
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Makale Düzenle</h1>
              <p className="text-sm text-gray-500">{article?.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/haber/${article?.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Önizle
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 dark:text-green-200">Makale başarıyla güncellendi!</span>
        </div>
      )}

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Başlık
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Makale başlığı"
            />
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              İçerik
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y"
              placeholder="Makale içeriği (Markdown desteklenir)"
            />
            <p className="mt-2 text-xs text-gray-500">Markdown formatı desteklenir</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORY_NAMES_LIST.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Özet
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="Kısa özet (opsiyonel)"
            />
          </div>

          {/* Image URL */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Görsel URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
            {imageUrl && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Önizleme"
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">İstatistikler</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Görüntülenme</span>
                <span className="font-medium text-gray-900 dark:text-white">{article?.viewCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Yayın Tarihi</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {article?.publishedAt ? new Date(article.publishedAt).toLocaleDateString('tr-TR') : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
