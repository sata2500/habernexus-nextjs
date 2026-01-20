'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Newspaper, Eye, Bookmark, ThumbsUp, Trash2, ExternalLink, Edit } from 'lucide-react'
import { CATEGORY_COLORS } from '@/lib/constants'
import { 
  LoadingState, 
  ErrorState, 
  DataTable, 
  ConfirmDialog,
  type Column 
} from '@/components/admin/ui'

interface Article {
  id: string
  title: string
  slug: string
  category: string
  viewCount: number
  publishedAt: string
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    bookmarks: number
    votes: number
  }
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  
  // Silme dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    articleId: string | null
    articleTitle: string
    isBulk: boolean
  }>({
    isOpen: false,
    articleId: null,
    articleTitle: '',
    isBulk: false,
  })

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/articles')
      if (!response.ok) throw new Error('Makaleler yüklenemedi')
      const data = await response.json()
      setArticles(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleDelete = async () => {
    if (deleteDialog.isBulk) {
      // Toplu silme
      try {
        await Promise.all(
          selectedArticles.map((id) =>
            fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
          )
        )
        setArticles(articles.filter((a) => !selectedArticles.includes(a.id)))
        setSelectedArticles([])
      } catch {
        alert('Bazı makaleler silinemedi')
      }
    } else if (deleteDialog.articleId) {
      // Tekli silme
      try {
        const response = await fetch(`/api/admin/articles/${deleteDialog.articleId}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Makale silinemedi')
        }
        setArticles(articles.filter((a) => a.id !== deleteDialog.articleId))
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Bir hata oluştu')
      }
    }
    setDeleteDialog({ isOpen: false, articleId: null, articleTitle: '', isBulk: false })
  }

  const openDeleteDialog = (articleId: string, articleTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      articleId,
      articleTitle,
      isBulk: false,
    })
  }

  const openBulkDeleteDialog = () => {
    setDeleteDialog({
      isOpen: true,
      articleId: null,
      articleTitle: `${selectedArticles.length} makale`,
      isBulk: true,
    })
  }

  // İstatistikler
  const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0)
  const totalBookmarks = articles.reduce((sum, a) => sum + a._count.bookmarks, 0)
  const categories = [...new Set(articles.map((a) => a.category))]

  // Tablo sütunları
  const columns: Column<Article>[] = [
    {
      key: 'title',
      header: 'Makale',
      sortable: true,
      render: (article) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 dark:text-white truncate" title={article.title}>
            {article.title}
          </p>
          <p className="text-xs text-gray-500 truncate">{article.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      sortable: true,
      render: (article) => (
        <span
          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
            CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}
        >
          {article.category}
        </span>
      ),
    },
    {
      key: 'stats',
      header: 'İstatistikler',
      render: (article) => (
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1" title="Görüntülenme">
            <Eye className="w-4 h-4" />
            {article.viewCount}
          </span>
          <span className="flex items-center gap-1" title="Kayıt">
            <Bookmark className="w-4 h-4" />
            {article._count.bookmarks}
          </span>
          <span className="flex items-center gap-1" title="Oy">
            <ThumbsUp className="w-4 h-4" />
            {article._count.votes}
          </span>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Yazar',
      render: (article) => (
        <span className="text-gray-500 dark:text-gray-400">
          {article.author.name || article.author.email}
        </span>
      ),
    },
    {
      key: 'publishedAt',
      header: 'Tarih',
      sortable: true,
      render: (article) => (
        <span className="text-gray-500 dark:text-gray-400">
          {new Date(article.publishedAt).toLocaleDateString('tr-TR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'İşlemler',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (article) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/haber/${article.slug}`}
            target="_blank"
            className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Görüntüle"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <Link
            href={`/admin/makaleler/${article.id}/duzenle`}
            className="p-1.5 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
            title="Düzenle"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation()
              openDeleteDialog(article.id, article.title)
            }}
            className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return <LoadingState message="Makaleler yükleniyor..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Yükleme Hatası"
        message={error}
        onRetry={fetchArticles}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Newspaper className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Makale Yönetimi</h1>
            <p className="text-sm text-gray-500">Toplam {articles.length} makale</p>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedArticles.length > 0 && (
          <button
            onClick={openBulkDeleteDialog}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {selectedArticles.length} Makaleyi Sil
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalViews.toLocaleString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500">Toplam Görüntülenme</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalBookmarks.toLocaleString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500">Toplam Kayıt</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
              <p className="text-sm text-gray-500">Kategori</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={articles}
        columns={columns}
        getRowKey={(article) => article.id}
        searchable
        searchPlaceholder="Makale ara..."
        paginated
        pageSize={10}
        selectable
        selectedItems={selectedArticles}
        onSelectionChange={setSelectedArticles}
        exportable
        exportFileName="makaleler"
        emptyTitle="Henüz makale yok"
        emptyDescription="AI motorunu çalıştırarak veya manuel olarak içerik oluşturun."
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
        onConfirm={handleDelete}
        title={deleteDialog.isBulk ? 'Makaleleri Sil' : 'Makaleyi Sil'}
        description={
          deleteDialog.isBulk
            ? `${selectedArticles.length} makale kalıcı olarak silinecek. Bu işlem geri alınamaz.`
            : `"${deleteDialog.articleTitle}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`
        }
        variant="danger"
        confirmText="Sil"
      />
    </div>
  )
}
