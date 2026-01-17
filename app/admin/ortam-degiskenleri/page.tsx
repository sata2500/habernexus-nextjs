'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  FileCode, 
  Save, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  ExternalLink,
  Shield,
  Sparkles,
  Database,
  Settings,
  X
} from 'lucide-react'

interface EnvVariable {
  key: string
  name: string
  description: string
  category: string
  isRequired: boolean
  isSecret: boolean
  link: string | null
  value: string
  maskedValue: string
  isSet: boolean
}

interface FormValues {
  [key: string]: string
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ai: { label: 'AI Servisleri', icon: Sparkles, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  auth: { label: 'Kimlik Doğrulama', icon: Shield, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  database: { label: 'Veritabanı', icon: Database, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  other: { label: 'Diğer', icon: Settings, color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
}

export default function EnvVariablesPage() {
  const [variables, setVariables] = useState<EnvVariable[]>([])
  const [customVariables, setCustomVariables] = useState<EnvVariable[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [formValues, setFormValues] = useState<FormValues>({})
  const [hasChanges, setHasChanges] = useState(false)
  
  // Reveal state
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  
  // New variable modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newVarKey, setNewVarKey] = useState('')
  const [newVarValue, setNewVarValue] = useState('')
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchVariables = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/env')
      if (!response.ok) throw new Error('Değişkenler yüklenemedi')
      const data = await response.json()
      
      setVariables(data.variables || [])
      setCustomVariables(data.customVariables || [])
      
      // Initialize form values
      const initialValues: FormValues = {}
      for (const v of data.variables || []) {
        initialValues[v.key] = v.value
      }
      for (const v of data.customVariables || []) {
        initialValues[v.key] = v.value
      }
      setFormValues(initialValues)
      setHasChanges(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVariables()
  }, [fetchVariables])

  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleToggleReveal = (key: string) => {
    setRevealedKeys(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/admin/env', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: formValues }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Kaydetme başarısız')
      }

      const data = await response.json()
      setSuccess(data.message || 'Değişkenler kaydedildi')
      setTimeout(() => setSuccess(null), 5000)
      setHasChanges(false)
      fetchVariables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleAddVariable = async () => {
    if (!newVarKey.trim()) {
      setError('Anahtar adı gerekli')
      return
    }

    try {
      const response = await fetch('/api/admin/env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newVarKey.toUpperCase(), value: newVarValue }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ekleme başarısız')
      }

      setSuccess('Yeni değişken eklendi')
      setTimeout(() => setSuccess(null), 3000)
      setIsModalOpen(false)
      setNewVarKey('')
      setNewVarValue('')
      fetchVariables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  const handleDelete = async (key: string) => {
    try {
      const response = await fetch(`/api/admin/env?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Silme başarısız')
      }

      setSuccess('Değişken silindi')
      setTimeout(() => setSuccess(null), 3000)
      setDeleteConfirm(null)
      fetchVariables()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  // Group variables by category
  const groupedVariables = variables.reduce((acc, v) => {
    const category = v.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(v)
    return acc
  }, {} as Record<string, EnvVariable[]>)

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
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <FileCode className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ortam Değişkenleri</h1>
            <p className="text-sm text-gray-500">.env dosyası yönetimi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yeni Ekle
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
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

      {hasChanges && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-amber-800 dark:text-amber-200">
            Kaydedilmemiş değişiklikler var. Değişiklikleri kaydetmek için &quot;Kaydet&quot; butonuna tıklayın.
          </span>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Bilgi</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Bu sayfa .env dosyasını doğrudan düzenlemenizi sağlar</li>
          <li>• Değişiklikler kaydedildiğinde .env dosyası güncellenir</li>
          <li>• Bazı değişiklikler için sunucu yeniden başlatılması gerekebilir</li>
          <li>• Zorunlu değişkenler silinemez</li>
        </ul>
      </div>

      {/* Variables by Category */}
      {Object.entries(groupedVariables).map(([category, vars]) => {
        const config = categoryConfig[category] || categoryConfig.other
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
              </div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {vars.map((variable) => (
                <div key={variable.key} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {variable.name}
                        </h3>
                        {variable.isRequired && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            Zorunlu
                          </span>
                        )}
                        {variable.isSet ? (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Ayarlandı
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                            Boş
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {variable.key}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {variable.description}
                      </p>
                      {variable.link && (
                        <a
                          href={variable.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                        >
                          Nasıl alınır?
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Input */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={variable.isSecret && !revealedKeys.has(variable.key) ? 'password' : 'text'}
                        value={formValues[variable.key] || ''}
                        onChange={(e) => handleInputChange(variable.key, e.target.value)}
                        placeholder={variable.isSet ? variable.maskedValue : 'Değer girin...'}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                    </div>
                    
                    {variable.isSecret && (
                      <button
                        onClick={() => handleToggleReveal(variable.key)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title={revealedKeys.has(variable.key) ? 'Gizle' : 'Göster'}
                      >
                        {revealedKeys.has(variable.key) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Custom Variables */}
      {customVariables.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${categoryConfig.other.color}`}>
                <Settings className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Özel Değişkenler
              </h2>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {customVariables.map((variable) => (
              <div key={variable.key} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white font-mono">
                      {variable.key}
                    </p>
                  </div>
                  
                  {deleteConfirm === variable.key ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(variable.key)}
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
                      onClick={() => setDeleteConfirm(variable.key)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Input */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={variable.isSecret && !revealedKeys.has(variable.key) ? 'password' : 'text'}
                      value={formValues[variable.key] || ''}
                      onChange={(e) => handleInputChange(variable.key, e.target.value)}
                      placeholder={variable.maskedValue}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                  
                  {variable.isSecret && (
                    <button
                      onClick={() => handleToggleReveal(variable.key)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {revealedKeys.has(variable.key) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Variable Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Yeni Değişken Ekle
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Anahtar Adı *
                  </label>
                  <input
                    type="text"
                    value={newVarKey}
                    onChange={(e) => setNewVarKey(e.target.value.toUpperCase())}
                    placeholder="MY_CUSTOM_KEY"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Büyük harf, rakam ve alt çizgi kullanın (örn: MY_API_KEY)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Değer
                  </label>
                  <input
                    type="text"
                    value={newVarValue}
                    onChange={(e) => setNewVarValue(e.target.value)}
                    placeholder="Değer girin..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddVariable}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
