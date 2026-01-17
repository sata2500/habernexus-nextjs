'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Shield,
  Sparkles,
  Globe,
  Copy,
  Check
} from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key: string
  maskedValue: string
  value?: string
  description: string | null
  category: string
  isActive: boolean
  isRequired: boolean
  lastUsed: string | null
  createdAt: string
  updatedAt: string
}

interface FormData {
  name: string
  key: string
  value: string
  description: string
  category: string
  isRequired: boolean
}

const initialFormData: FormData = {
  name: '',
  key: '',
  value: '',
  description: '',
  category: 'general',
  isRequired: false,
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ai: { label: 'AI Servisleri', icon: Sparkles, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  auth: { label: 'Kimlik Doğrulama', icon: Shield, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  general: { label: 'Genel', icon: Globe, color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  
  // Reveal state
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>({})
  const [loadingReveal, setLoadingReveal] = useState<string | null>(null)
  
  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/api-keys')
      if (!response.ok) throw new Error('API anahtarları yüklenemedi')
      const data = await response.json()
      setApiKeys(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  const handleRevealKey = async (id: string) => {
    if (revealedKeys.has(id)) {
      // Hide the key
      setRevealedKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      return
    }

    try {
      setLoadingReveal(id)
      const response = await fetch(`/api/admin/api-keys/${id}?reveal=true`)
      if (!response.ok) throw new Error('Anahtar gösterilemedi')
      const data = await response.json()
      
      setRevealedValues(prev => ({ ...prev, [id]: data.value }))
      setRevealedKeys(prev => new Set(prev).add(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoadingReveal(null)
    }
  }

  const handleCopyKey = async (id: string) => {
    const value = revealedValues[id]
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(id)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      setError('Panoya kopyalanamadı')
    }
  }

  const handleOpenModal = (key?: ApiKey) => {
    if (key) {
      setEditingKey(key)
      setFormData({
        name: key.name,
        key: key.key,
        value: '', // Don't pre-fill value for security
        description: key.description || '',
        category: key.category,
        isRequired: key.isRequired,
      })
    } else {
      setEditingKey(null)
      setFormData(initialFormData)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingKey(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = editingKey 
        ? `/api/admin/api-keys/${editingKey.id}`
        : '/api/admin/api-keys'
      
      const method = editingKey ? 'PUT' : 'POST'
      
      // For edit, only send value if it's changed
      const payload = editingKey && !formData.value
        ? { ...formData, value: undefined }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'İşlem başarısız')
      }

      setSuccess(editingKey ? 'API anahtarı güncellendi' : 'API anahtarı eklendi')
      setTimeout(() => setSuccess(null), 3000)
      handleCloseModal()
      fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (key: ApiKey) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${key.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !key.isActive }),
      })

      if (!response.ok) throw new Error('Durum değiştirilemedi')
      
      setSuccess(`API anahtarı ${!key.isActive ? 'aktif' : 'pasif'} yapıldı`)
      setTimeout(() => setSuccess(null), 3000)
      fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Silinemedi')
      }

      setSuccess('API anahtarı silindi')
      setTimeout(() => setSuccess(null), 3000)
      setDeleteConfirm(null)
      fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  // Group keys by category
  const groupedKeys = apiKeys.reduce((acc, key) => {
    const category = key.category || 'general'
    if (!acc[category]) acc[category] = []
    acc[category].push(key)
    return acc
  }, {} as Record<string, ApiKey[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <Key className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Anahtarları</h1>
            <p className="text-sm text-gray-500">Güvenli API anahtar yönetimi</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Ekle
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 dark:text-green-200">{success}</span>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Güvenlik Bilgisi</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• API anahtarları veritabanında şifrelenmiş olarak saklanır</li>
          <li>• Anahtarlar varsayılan olarak maskelenmiş gösterilir</li>
          <li>• Zorunlu anahtarlar silinmeden önce işareti kaldırılmalıdır</li>
          <li>• Değişiklikler anında uygulanır, sunucu yeniden başlatma gerekmez</li>
        </ul>
      </div>

      {/* API Keys List */}
      {Object.entries(groupedKeys).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Henüz API anahtarı yok
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            İlk API anahtarınızı ekleyerek başlayın
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            API Anahtarı Ekle
          </button>
        </div>
      ) : (
        Object.entries(groupedKeys).map(([category, keys]) => {
          const config = categoryConfig[category] || categoryConfig.general
          const CategoryIcon = config.icon
          
          return (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${config.color}`}>
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {config.label}
                  </h2>
                  <span className="text-sm text-gray-500">({keys.length})</span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {keys.map((key) => (
                  <div key={key.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {key.name}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            key.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {key.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                          {key.isRequired && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              Zorunlu
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">
                          {key.key}
                        </p>
                        
                        {key.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {key.description}
                          </p>
                        )}
                        
                        {/* Value display */}
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex-1 max-w-md">
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm">
                              <span className="text-gray-700 dark:text-gray-300 truncate">
                                {revealedKeys.has(key.id) 
                                  ? revealedValues[key.id] 
                                  : key.maskedValue}
                              </span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRevealKey(key.id)}
                            disabled={loadingReveal === key.id}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title={revealedKeys.has(key.id) ? 'Gizle' : 'Göster'}
                          >
                            {loadingReveal === key.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : revealedKeys.has(key.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          
                          {revealedKeys.has(key.id) && (
                            <button
                              onClick={() => handleCopyKey(key.id)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Kopyala"
                            >
                              {copiedKey === key.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {key.lastUsed && (
                          <p className="text-xs text-gray-400 mt-2">
                            Son kullanım: {new Date(key.lastUsed).toLocaleString('tr-TR')}
                          </p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleToggleActive(key)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            key.isActive
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {key.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>
                        
                        <button
                          onClick={() => handleOpenModal(key)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        {deleteConfirm === key.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(key.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(key.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={handleCloseModal}
            />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingKey ? 'API Anahtarını Düzenle' : 'Yeni API Anahtarı'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Görünen Ad *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Gemini API Key"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Anahtar Adı (Environment Variable) *
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                    placeholder="GEMINI_API_KEY"
                    required
                    disabled={!!editingKey}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {editingKey && (
                    <p className="text-xs text-gray-500 mt-1">Anahtar adı değiştirilemez</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Değer {!editingKey && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={editingKey ? 'Değiştirmek için yeni değer girin' : 'API anahtarı değeri'}
                    required={!editingKey}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {editingKey && (
                    <p className="text-xs text-gray-500 mt-1">Boş bırakırsanız mevcut değer korunur</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Bu API anahtarının kullanım amacı"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ai">AI Servisleri</option>
                    <option value="auth">Kimlik Doğrulama</option>
                    <option value="general">Genel</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isRequired" className="text-sm text-gray-700 dark:text-gray-300">
                    Zorunlu anahtar (silinmesini engeller)
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
