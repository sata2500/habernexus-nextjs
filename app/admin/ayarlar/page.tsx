'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Globe,
  Info
} from 'lucide-react'
import Link from 'next/link'

/**
 * Site Ayarları Sayfası
 * 
 * Sadece genel site ayarlarını içerir.
 * AI ve içerik üretimi ayarları İçerik Üretim Merkezi'ne taşındı.
 * 
 * @version 3.0.0
 * @lastUpdated 20 January 2026
 */

// ============================================
// Types
// ============================================

interface SettingsState {
  site_name: string
  site_description: string
  default_category: string
}

const CATEGORIES = ['Gündem', 'Teknoloji', 'Ekonomi', 'Spor', 'Sağlık', 'Bilim', 'Dünya']

const defaultSettings: SettingsState = {
  site_name: 'HaberNexus',
  site_description: 'Yeni Nesil AI Destekli Haber Platformu',
  default_category: 'Gündem',
}

// ============================================
// Main Component
// ============================================

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Ayarlar yüklenemedi')
      const data = await response.json()
      setSettings({
        site_name: data.site_name || defaultSettings.site_name,
        site_description: data.site_description || defaultSettings.site_description,
        default_category: data.default_category || defaultSettings.default_category,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ayarlar kaydedilemedi')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof SettingsState, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Site Ayarları</h1>
            <p className="text-sm text-gray-500">Genel platform yapılandırması</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-blue-800 dark:text-blue-200 font-medium">AI ve İçerik Ayarları Taşındı</p>
          <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
            AI modelleri, görsel üretimi ve zamanlayıcı ayarları artık{' '}
            <Link href="/admin/icerik-merkezi" className="underline font-medium hover:text-blue-900">
              İçerik Üretim Merkezi
            </Link>
            {' '}sayfasından yönetiliyor.
          </p>
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
          <span className="text-green-800 dark:text-green-200">Ayarlar başarıyla kaydedildi!</span>
        </div>
      )}

      {/* Site Settings Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Genel Ayarlar</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Site Adı
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => handleChange('site_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="HaberNexus"
            />
            <p className="text-xs text-gray-500 mt-1">Sitenin başlık ve meta bilgilerinde kullanılır</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Site Açıklaması
            </label>
            <textarea
              value={settings.site_description}
              onChange={(e) => handleChange('site_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Yeni Nesil AI Destekli Haber Platformu"
            />
            <p className="text-xs text-gray-500 mt-1">SEO meta description olarak kullanılır</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Varsayılan Kategori
            </label>
            <select
              value={settings.default_category}
              onChange={(e) => handleChange('default_category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Kategori belirlenemediğinde kullanılır</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Hızlı Erişim</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/icerik-merkezi"
            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            İçerik Üretim Merkezi
          </Link>
          <Link
            href="/admin/testler"
            className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            Test Ortamı
          </Link>
          <Link
            href="/admin/rss"
            className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
          >
            RSS Kaynakları
          </Link>
        </div>
      </div>
    </div>
  )
}
