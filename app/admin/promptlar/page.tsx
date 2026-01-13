'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  FileText, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Sparkles, 
  Image as ImageIcon,
  Brain,
  Tag,
  FileSearch,
  ChevronDown,
  ChevronUp,
  Info,
  RotateCcw
} from 'lucide-react'

interface PromptTemplate {
  id: string
  name: string
  displayName: string
  description: string | null
  type: 'CONTENT' | 'IMAGE' | 'SENTIMENT' | 'CATEGORY' | 'SUMMARY'
  template: string
  variables: string
  isActive: boolean
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

const PROMPT_TYPE_INFO = {
  CONTENT: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    label: 'İçerik Üretimi',
    description: 'RSS kaynaklarından gelen haberleri özgün içeriğe dönüştürür',
  },
  IMAGE: {
    icon: ImageIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    label: 'Görsel Üretimi',
    description: 'Haberler için AI ile görsel üretir',
  },
  SENTIMENT: {
    icon: Brain,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900',
    label: 'Duygu Analizi',
    description: 'Haberlerin duygusal tonunu analiz eder',
  },
  CATEGORY: {
    icon: Tag,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900',
    label: 'Kategori Belirleme',
    description: 'Haberlerin kategorisini otomatik belirler',
  },
  SUMMARY: {
    icon: FileSearch,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900',
    label: 'Özet Oluşturma',
    description: 'Haber özetleri oluşturur',
  },
}

function PromptCard({ 
  prompt, 
  onSave, 
  onReset,
  saving 
}: { 
  prompt: PromptTemplate
  onSave: (id: string, template: string) => Promise<void>
  onReset: (id: string) => Promise<void>
  saving: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [editedTemplate, setEditedTemplate] = useState(prompt.template)
  const [hasChanges, setHasChanges] = useState(false)

  const typeInfo = PROMPT_TYPE_INFO[prompt.type]
  const Icon = typeInfo.icon
  const variables = JSON.parse(prompt.variables || '[]') as string[]

  useEffect(() => {
    setHasChanges(editedTemplate !== prompt.template)
  }, [editedTemplate, prompt.template])

  const handleSave = async () => {
    await onSave(prompt.id, editedTemplate)
    setHasChanges(false)
  }

  const handleReset = async () => {
    await onReset(prompt.id)
    setEditedTemplate(prompt.template)
    setHasChanges(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
              <Icon className={`w-5 h-5 ${typeInfo.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {prompt.displayName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {typeInfo.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {prompt.isDefault && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                Varsayılan
              </span>
            )}
            {hasChanges && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                Değişiklik var
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          {/* Variables Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Kullanılabilir Değişkenler
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variables.map((variable) => (
                    <code 
                      key={variable}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded font-mono"
                    >
                      {`{{${variable}}}`}
                    </code>
                  ))}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Bu değişkenler içerik üretimi sırasında gerçek değerlerle değiştirilir.
                </p>
              </div>
            </div>
          </div>

          {/* Template Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prompt Şablonu
            </label>
            <textarea
              value={editedTemplate}
              onChange={(e) => setEditedTemplate(e.target.value)}
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder="Prompt şablonunu buraya yazın..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleReset}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Değişiklikleri Geri Al
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

          {/* Metadata */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Son güncelleme: {new Date(prompt.updatedAt).toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchPrompts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/prompts')
      if (!response.ok) throw new Error('Promptlar yüklenemedi')
      const data = await response.json()
      setPrompts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  const handleSeedDefaults = async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      })
      
      if (!response.ok) throw new Error('Varsayılan promptlar oluşturulamadı')
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchPrompts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePrompt = async (id: string, template: string) => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template }),
      })
      
      if (!response.ok) throw new Error('Prompt kaydedilemedi')
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchPrompts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPrompt = async (_id: string) => {
    // Just refresh to get original value
    fetchPrompts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Group prompts by type
  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.type]) {
      acc[prompt.type] = []
    }
    acc[prompt.type].push(prompt)
    return acc
  }, {} as Record<string, PromptTemplate[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Prompt Yönetimi</h1>
            <p className="text-sm text-gray-500">İçerik ve görsel üretimi için AI promptlarını düzenleyin</p>
          </div>
        </div>
        {prompts.length === 0 && (
          <button
            onClick={handleSeedDefaults}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Varsayılan Promptları Oluştur
          </button>
        )}
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
          <span className="text-green-800 dark:text-green-200">İşlem başarıyla tamamlandı!</span>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Prompt Yönetimi Hakkında</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Promptlar, AI&apos;ın içerik ve görsel üretirken kullandığı talimatları içerir</li>
          <li>• Değişkenler (örn: {`{{title}}`}) içerik üretimi sırasında gerçek değerlerle değiştirilir</li>
          <li>• Değişiklikleri kaydetmeden önce test etmeniz önerilir</li>
          <li>• Varsayılan promptlar en iyi uygulamalara göre optimize edilmiştir</li>
        </ul>
      </div>

      {/* Prompts List */}
      {prompts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Henüz prompt şablonu yok
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Varsayılan prompt şablonlarını oluşturmak için yukarıdaki butona tıklayın.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPrompts).map(([type, typePrompts]) => (
            <div key={type} className="space-y-3">
              {typePrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onSave={handleSavePrompt}
                  onReset={handleResetPrompt}
                  saving={saving}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
