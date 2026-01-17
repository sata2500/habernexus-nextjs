'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  FileCode, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Lock,
  Search,
  Copy,
  Check
} from 'lucide-react'

interface EnvVariable {
  key: string
  value: string
  isSensitive: boolean
  isReadonly: boolean
  comment?: string
  originalLength?: number
}

interface EnvData {
  variables: EnvVariable[]
  count: number
  lastModified: string | null
}

export default function EnvManagementPage() {
  const [envData, setEnvData] = useState<EnvData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Düzenleme state'leri
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editComment, setEditComment] = useState('')
  
  // Yeni değişken state'leri
  const [isAdding, setIsAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newComment, setNewComment] = useState('')
  
  // Görünürlük state'leri
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  
  // Arama state'i
  const [searchTerm, setSearchTerm] = useState('')
  
  // Kopyalama state'i
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  // İşlem durumu
  const [processing, setProcessing] = useState(false)

  const fetchEnvVariables = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/env')
      if (!response.ok) {
        throw new Error('Değişkenler yüklenemedi')
      }
      const data = await response.json()
      setEnvData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEnvVariables()
  }, [fetchEnvVariables])

  // Değişken ekleme
  const handleAdd = async () => {
    if (!newKey.trim()) {
      setError('Anahtar boş olamaz')
      return
    }

    try {
      setProcessing(true)
      const response = await fetch('/api/admin/env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newKey.trim().toUpperCase(),
          value: newValue,
          comment: newComment || undefined,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Değişken eklenemedi')
      }

      setSuccess(data.message)
      setIsAdding(false)
      setNewKey('')
      setNewValue('')
      setNewComment('')
      fetchEnvVariables()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setProcessing(false)
    }
  }

  // Değişken güncelleme
  const handleUpdate = async (key: string) => {
    try {
      setProcessing(true)
      const response = await fetch('/api/admin/env', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: editValue,
          comment: editComment || undefined,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Değişken güncellenemedi')
      }

      setSuccess(data.message)
      setEditingKey(null)
      setEditValue('')
      setEditComment('')
      fetchEnvVariables()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setProcessing(false)
    }
  }

  // Değişken silme
  const handleDelete = async (key: string) => {
    if (!confirm(`"${key}" değişkenini silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/env?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Değişken silinemedi')
      }

      setSuccess(data.message)
      fetchEnvVariables()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setProcessing(false)
    }
  }

  // Düzenleme modunu başlat
  const startEditing = (variable: EnvVariable) => {
    setEditingKey(variable.key)
    setEditValue(variable.isSensitive ? '' : variable.value)
    setEditComment(variable.comment || '')
  }

  // Düzenleme modunu iptal et
  const cancelEditing = () => {
    setEditingKey(null)
    setEditValue('')
    setEditComment('')
  }

  // Görünürlük toggle
  const toggleVisibility = (key: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  // Değer kopyalama
  const copyToClipboard = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      setError('Kopyalama başarısız oldu')
    }
  }

  // Filtrelenmiş değişkenler
  const filteredVariables = envData?.variables.filter(v => 
    v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.comment && v.comment.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  // Değişkenleri grupla
  const groupedVariables = filteredVariables.reduce((acc, variable) => {
    let group = 'Diğer'
    if (variable.key.includes('DATABASE')) group = 'Veritabanı'
    else if (variable.key.includes('AUTH') && !variable.key.includes('OAUTH')) group = 'Kimlik Doğrulama'
    else if (variable.key.includes('GOOGLE') || variable.key.includes('OAUTH')) group = 'OAuth'
    else if (variable.key.includes('GEMINI') || variable.key.includes('AI')) group = 'AI Servisleri'
    else if (variable.key.includes('SITE') || variable.key.includes('PUBLIC')) group = 'Site Ayarları'
    else if (variable.key.includes('NODE')) group = 'Node.js'

    if (!acc[group]) acc[group] = []
    acc[group].push(variable)
    return acc
  }, {} as Record<string, EnvVariable[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <FileCode className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ortam Değişkenleri
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              .env dosyasındaki değişkenleri yönetin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEnvVariables}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Yenile</span>
          </button>
          <button
            onClick={() => setIsAdding(true)}
            disabled={processing || isAdding}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Değişken</span>
          </button>
        </div>
      </div>

      {/* Bildirimler */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Uyarı Kutusu */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700 dark:text-amber-300">
          <p className="font-medium mb-1">Güvenlik Uyarısı</p>
          <p>
            Ortam değişkenleri hassas bilgiler içerebilir. Değişikliklerin sunucu yeniden başlatıldığında 
            etkili olacağını unutmayın. Hassas değerler maskelenmiş olarak gösterilir.
          </p>
        </div>
      </div>

      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Değişken ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Yeni Değişken Formu */}
      {isAdding && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Yeni Değişken Ekle
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Anahtar (Key)
              </label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                placeholder="DEGISKEN_ADI"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Değer (Value)
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="değer"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Açıklama (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Bu değişkenin ne işe yaradığını açıklayın"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => {
                setIsAdding(false)
                setNewKey('')
                setNewValue('')
                setNewComment('')
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleAdd}
              disabled={processing || !newKey.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Ekle
            </button>
          </div>
        </div>
      )}

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Değişken</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{envData?.count || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Hassas Değişken</p>
          <p className="text-2xl font-bold text-amber-600">
            {envData?.variables.filter(v => v.isSensitive).length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Salt Okunur</p>
          <p className="text-2xl font-bold text-purple-600">
            {envData?.variables.filter(v => v.isReadonly).length || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Son Güncelleme</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {envData?.lastModified 
              ? new Date(envData.lastModified).toLocaleString('tr-TR')
              : '-'
            }
          </p>
        </div>
      </div>

      {/* Değişken Grupları */}
      {Object.entries(groupedVariables).map(([group, variables]) => (
        <div key={group} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{variables.length} değişken</p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {variables.map((variable) => (
              <div key={variable.key} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                {editingKey === variable.key ? (
                  // Düzenleme modu
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {variable.key}
                      </span>
                      {variable.isSensitive && (
                        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded">
                          Hassas
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder={variable.isSensitive ? 'Yeni değer girin (boş bırakırsanız değişmez)' : 'Değer'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder="Açıklama (isteğe bağlı)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handleUpdate(variable.key)}
                        disabled={processing}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        Kaydet
                      </button>
                    </div>
                  </div>
                ) : (
                  // Görüntüleme modu
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          {variable.key}
                        </span>
                        {variable.isSensitive && (
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Hassas
                          </span>
                        )}
                        {variable.isReadonly && (
                          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Salt Okunur
                          </span>
                        )}
                      </div>
                      {variable.comment && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {variable.comment}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300 font-mono truncate">
                          {variable.isSensitive && !visibleKeys.has(variable.key)
                            ? variable.value
                            : variable.value
                          }
                        </code>
                        {variable.isSensitive && (
                          <button
                            onClick={() => toggleVisibility(variable.key)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title={visibleKeys.has(variable.key) ? 'Gizle' : 'Göster'}
                          >
                            {visibleKeys.has(variable.key) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {!variable.isSensitive && (
                          <button
                            onClick={() => copyToClipboard(variable.key, variable.value)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Kopyala"
                          >
                            {copiedKey === variable.key ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!variable.isReadonly && (
                        <>
                          <button
                            onClick={() => startEditing(variable)}
                            disabled={processing}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(variable.key)}
                            disabled={processing}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Boş durum */}
      {filteredVariables.length === 0 && !loading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <FileCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Arama kriterlerine uygun değişken bulunamadı' : 'Henüz değişken yok'}
          </p>
        </div>
      )}
    </div>
  )
}
