'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  Edit,
  User,
  Image as ImageIcon,
  Hash
} from 'lucide-react'
import { CATEGORY_NAMES } from '@/lib/constants'

interface Author {
  id: string
  name: string | null
  email: string
}

interface RssFeed {
  id: string
  name: string
  url: string
  category: string
  isActive: boolean
  topicsPerRun: number
  authorId: string | null
  imageMode: 'rss' | 'ai_original' | 'ai_similar' | 'auto'
  lastFetch: string | null
  createdAt: string
}

const IMAGE_MODE_LABELS: Record<string, string> = {
  'auto': 'Otomatik (AI Karar)',
  'rss': 'RSS Görseli',
  'ai_original': 'AI Özgün',
  'ai_similar': 'AI Benzer',
}

export default function RssManagement() {
  const [feeds, setFeeds] = useState<RssFeed[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    url: string
    category: string
    topicsPerRun: number
    authorId: string
    imageMode: 'rss' | 'ai_original' | 'ai_similar' | 'auto'
  }>({
    name: '',
    url: '',
    category: 'Gündem',
    topicsPerRun: 2,
    authorId: '',
    imageMode: 'auto',
  })
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFeed, setEditingFeed] = useState<RssFeed | null>(null)
  const [editFormData, setEditFormData] = useState<{
    name: string
    category: string
    topicsPerRun: number
    authorId: string
    imageMode: 'rss' | 'ai_original' | 'ai_similar' | 'auto'
  }>({
    name: '',
    category: 'Gündem',
    topicsPerRun: 2,
    authorId: '',
    imageMode: 'auto',
  })

  // Fetch feeds and authors on mount
  useEffect(() => {
    fetchFeeds()
    fetchAuthors()
  }, [])

  const fetchFeeds = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/rss')
      if (!response.ok) throw new Error('Failed to fetch feeds')
      const data = await response.json()
      setFeeds(data)
      setError(null)
    } catch (err) {
      setError('RSS kaynakları yüklenirken bir hata oluştu')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/admin/users?role=AUTHOR')
      if (response.ok) {
        const data = await response.json()
        setAuthors(data.users || [])
      }
    } catch (err) {
      console.error('Failed to fetch authors:', err)
    }
  }

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/rss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          authorId: formData.authorId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add feed')
      }

      setFeeds([data, ...feeds])
      setShowAddModal(false)
      setFormData({ name: '', url: '', category: 'Gündem', topicsPerRun: 2, authorId: '', imageMode: 'auto' })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kaynak eklenirken bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (feed: RssFeed) => {
    try {
      const response = await fetch('/api/admin/rss', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feed.id, isActive: !feed.isActive }),
      })

      if (!response.ok) throw new Error('Failed to update feed')

      setFeeds(feeds.map(f => 
        f.id === feed.id ? { ...f, isActive: !f.isActive } : f
      ))
    } catch {
      alert('Durum güncellenirken bir hata oluştu')
    }
  }

  const handleDeleteFeed = async (id: string) => {
    if (!confirm('Bu kaynağı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/rss?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete feed')

      setFeeds(feeds.filter(f => f.id !== id))
    } catch {
      alert('Kaynak silinirken bir hata oluştu')
    }
  }

  const handleOpenEditModal = (feed: RssFeed) => {
    setEditingFeed(feed)
    setEditFormData({
      name: feed.name,
      category: feed.category,
      topicsPerRun: feed.topicsPerRun,
      authorId: feed.authorId || '',
      imageMode: feed.imageMode,
    })
    setShowEditModal(true)
  }

  const handleEditFeed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFeed) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/rss', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingFeed.id,
          name: editFormData.name,
          category: editFormData.category,
          topicsPerRun: editFormData.topicsPerRun,
          authorId: editFormData.authorId || null,
          imageMode: editFormData.imageMode,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update feed')
      }

      setFeeds(feeds.map(f => 
        f.id === editingFeed.id 
          ? { 
              ...f, 
              name: editFormData.name, 
              category: editFormData.category,
              topicsPerRun: editFormData.topicsPerRun,
              authorId: editFormData.authorId || null,
              imageMode: editFormData.imageMode,
            }
          : f
      ))
      setShowEditModal(false)
      setEditingFeed(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kaynak güncellenirken bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAuthorName = (authorId: string | null) => {
    if (!authorId) return 'Atanmamış'
    const author = authors.find(a => a.id === authorId)
    return author?.name || author?.email || 'Bilinmiyor'
  }

  const filteredFeeds = feeds.filter(feed => 
    feed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feed.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    feed.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Henüz çekilmedi'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Az önce'
    if (diffMins < 60) return `${diffMins} dakika önce`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} saat önce`
    return date.toLocaleDateString('tr-TR')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RSS Kaynakları</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Haber kaynaklarını yönetin ve yeni kaynaklar ekleyin
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Kaynak Ekle
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Kaynak ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchFeeds}
          className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Kaynak</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{feeds.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Aktif Kaynak</p>
          <p className="text-2xl font-bold text-green-600">{feeds.filter(f => f.isActive).length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pasif Kaynak</p>
          <p className="text-2xl font-bold text-red-600">{feeds.filter(f => !f.isActive).length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Haber/Çalıştırma</p>
          <p className="text-2xl font-bold text-blue-600">{feeds.filter(f => f.isActive).reduce((sum, f) => sum + f.topicsPerRun, 0)}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        /* Feeds Table */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kaynak</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yazar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Haber/Çalıştırma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Görsel Modu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Son Güncelleme</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFeeds.length > 0 ? (
                  filteredFeeds.map((feed) => (
                    <tr key={feed.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{feed.name}</p>
                          <a 
                            href={feed.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-blue-600 flex items-center mt-1"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {feed.url.length > 40 ? feed.url.substring(0, 40) + '...' : feed.url}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {CATEGORY_NAMES[feed.category] || feed.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4 mr-1" />
                          {getAuthorName(feed.authorId)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Hash className="w-4 h-4 mr-1" />
                          {feed.topicsPerRun}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <ImageIcon className="w-4 h-4 mr-1" />
                          {IMAGE_MODE_LABELS[feed.imageMode]}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(feed)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            feed.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {feed.isActive ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Aktif</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Pasif</>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(feed.lastFetch)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(feed)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeed(feed.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchQuery ? 'Aramanızla eşleşen kaynak bulunamadı' : 'Henüz RSS kaynağı eklenmemiş'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Feed Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yeni RSS Kaynağı Ekle</h2>
            <form onSubmit={handleAddFeed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kaynak Adı
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: Hürriyet Teknoloji"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  RSS URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/rss"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(CATEGORY_NAMES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Çalıştırma Başına Haber Sayısı
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.topicsPerRun}
                  onChange={(e) => setFormData({ ...formData, topicsPerRun: parseInt(e.target.value) || 2 })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Yazar (Opsiyonel)
                </label>
                <select
                  value={formData.authorId}
                  onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Varsayılan (Admin)</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>{author.name || author.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Görsel Modu
                </label>
                <select
                  value={formData.imageMode}
                  onChange={(e) => setFormData({ ...formData, imageMode: e.target.value as typeof formData.imageMode })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">Otomatik (AI Karar Verir)</option>
                  <option value="rss">RSS Görseli Kullan</option>
                  <option value="ai_original">AI ile Özgün Görsel</option>
                  <option value="ai_similar">AI ile Benzer Görsel</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Feed Modal */}
      {showEditModal && editingFeed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">RSS Kaynağını Düzenle</h2>
            <form onSubmit={handleEditFeed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kaynak Adı
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(CATEGORY_NAMES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Çalıştırma Başına Haber Sayısı
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editFormData.topicsPerRun}
                  onChange={(e) => setEditFormData({ ...editFormData, topicsPerRun: parseInt(e.target.value) || 2 })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Yazar
                </label>
                <select
                  value={editFormData.authorId}
                  onChange={(e) => setEditFormData({ ...editFormData, authorId: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Varsayılan (Admin)</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>{author.name || author.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Görsel Modu
                </label>
                <select
                  value={editFormData.imageMode}
                  onChange={(e) => setEditFormData({ ...editFormData, imageMode: e.target.value as typeof editFormData.imageMode })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">Otomatik (AI Karar Verir)</option>
                  <option value="rss">RSS Görseli Kullan</option>
                  <option value="ai_original">AI ile Özgün Görsel</option>
                  <option value="ai_similar">AI ile Benzer Görsel</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingFeed(null)
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
