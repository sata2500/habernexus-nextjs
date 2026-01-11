'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface SettingsState {
  site_name: string
  site_description: string
  ai_model_content: string
  ai_model_image: string
  cron_schedule: string
  articles_per_run: string
  default_category: string
}

const defaultSettings: SettingsState = {
  site_name: 'HaberNexus',
  site_description: 'Yeni Nesil AI Destekli Haber Platformu',
  ai_model_content: 'gemini-1.5-flash',
  ai_model_image: 'imagen-3.0-generate-001',
  cron_schedule: '0 */6 * * *',
  articles_per_run: '5',
  default_category: 'Gündem',
}

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
      setSettings({ ...defaultSettings, ...data })
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sistem Ayarları</h1>
            <p className="text-sm text-gray-500">Platform yapılandırması</p>
          </div>
        </div>
        <button
          onClick={handleSave}
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

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Site Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Site Ayarları</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Adı
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Açıklaması
              </label>
              <textarea
                value={settings.site_description}
                onChange={(e) => handleChange('site_description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Varsayılan Kategori
              </label>
              <select
                value={settings.default_category}
                onChange={(e) => handleChange('default_category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Gündem">Gündem</option>
                <option value="Teknoloji">Teknoloji</option>
                <option value="Ekonomi">Ekonomi</option>
                <option value="Spor">Spor</option>
                <option value="Sağlık">Sağlık</option>
                <option value="Bilim">Bilim</option>
                <option value="Dünya">Dünya</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Model Ayarları</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                İçerik Üretim Modeli
              </label>
              <select
                value={settings.ai_model_content}
                onChange={(e) => handleChange('ai_model_content', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Hızlı)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Kaliteli)</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Deneysel)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Makale içeriği oluşturmak için kullanılır</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Görsel Üretim Modeli
              </label>
              <select
                value={settings.ai_model_image}
                onChange={(e) => handleChange('ai_model_image', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="imagen-3.0-generate-001">Imagen 3.0 (Önerilen)</option>
                <option value="imagen-3.0-fast-generate-001">Imagen 3.0 Fast (Hızlı)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Makale görselleri oluşturmak için kullanılır</p>
            </div>
          </div>
        </div>

        {/* Otomasyon Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Otomasyon Ayarları</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cron Zamanlaması
              </label>
              <input
                type="text"
                value={settings.cron_schedule}
                onChange={(e) => handleChange('cron_schedule', e.target.value)}
                placeholder="0 */6 * * *"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <p className="mt-1 text-xs text-gray-500">Örnek: &quot;0 */6 * * *&quot; = Her 6 saatte bir</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Çalışma Başına Makale Sayısı
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.articles_per_run}
                onChange={(e) => handleChange('articles_per_run', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Her çalışmada üretilecek maksimum makale sayısı</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
