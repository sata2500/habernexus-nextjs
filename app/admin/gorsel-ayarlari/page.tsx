'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Image as ImageIcon, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  Sparkles,
  Download,
  Zap,
  Info
} from 'lucide-react'

interface ImageSettings {
  maxWidth: number
  maxHeight: number
  quality: number
  format: 'webp' | 'avif' | 'jpeg' | 'png'
  stripMetadata: boolean
  enableImageGeneration: boolean
  enableRssImageOptimization: boolean
  imageModel: string
}

interface ImageStats {
  aiGenerated: number
  rssOptimized: number
  placeholder: number
}

const FORMAT_OPTIONS = [
  { value: 'webp', label: 'WebP', description: 'Modern format, iyi sıkıştırma, geniş destek' },
  { value: 'avif', label: 'AVIF', description: 'En iyi sıkıştırma, sınırlı tarayıcı desteği' },
  { value: 'jpeg', label: 'JPEG', description: 'Evrensel destek, orta sıkıştırma' },
  { value: 'png', label: 'PNG', description: 'Kayıpsız, büyük dosya boyutu' },
]

// Updated: 14 January 2026 - Imagen 3.0 deprecated, using Imagen 4.0 models
const IMAGE_MODELS = [
  // Stable (GA) Models - Recommended for production
  { value: 'imagen-4.0-fast-generate-001', label: 'Imagen 4.0 Fast (Önerilen)', description: 'Hızlı ve yüksek kalite (~5 saniye)', status: 'stable' },
  { value: 'imagen-4.0-generate-001', label: 'Imagen 4.0 Standard', description: 'En yüksek kalite (~8 saniye)', status: 'stable' },
  { value: 'imagen-4.0-ultra-generate-001', label: 'Imagen 4.0 Ultra', description: 'Ultra yüksek kalite, 2K çözünürlük (~10 saniye)', status: 'stable' },
  // Preview Models - Will be shut down Feb 17, 2026
  { value: 'imagen-4.0-generate-preview-06-06', label: 'Imagen 4.0 Preview', description: 'Önizleme - 17 Şubat 2026\'da kapanacak', status: 'preview' },
  { value: 'imagen-4.0-ultra-generate-preview-06-06', label: 'Imagen 4.0 Ultra Preview', description: 'Ultra önizleme - 17 Şubat 2026\'da kapanacak', status: 'preview' },
]

export default function ImageSettingsPage() {
  const [settings, setSettings] = useState<ImageSettings>({
    maxWidth: 1200,
    maxHeight: 630,
    quality: 80,
    format: 'webp',
    stripMetadata: true,
    enableImageGeneration: true,
    enableRssImageOptimization: true,
    imageModel: 'imagen-4.0-fast-generate-001',
  })
  const [stats, setStats] = useState<ImageStats>({
    aiGenerated: 0,
    rssOptimized: 0,
    placeholder: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/image-settings')
      if (!response.ok) throw new Error('Ayarlar yüklenemedi')
      const data = await response.json()
      setSettings(data.settings)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/image-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      
      if (!response.ok) throw new Error('Ayarlar kaydedilemedi')
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalImages = stats.aiGenerated + stats.rssOptimized + stats.placeholder

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <ImageIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Görsel Ayarları</h1>
          <p className="text-sm text-gray-500">AI görsel üretimi ve RSS görsel optimizasyonu ayarları</p>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Görsel</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalImages}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI Üretilen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.aiGenerated}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">RSS Optimize</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rssOptimized}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Placeholder</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.placeholder}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Image Generation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Görsel Üretimi</h2>
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">AI Görsel Üretimini Etkinleştir</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Haberler için otomatik AI görsel üretimi</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableImageGeneration}
                onChange={(e) => setSettings({ ...settings, enableImageGeneration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Görsel Üretim Modeli
            </label>
            <select
              value={settings.imageModel}
              onChange={(e) => setSettings({ ...settings, imageModel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {IMAGE_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label} - {model.description}
                </option>
              ))}
            </select>
          </div>

          {/* Info */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-purple-600 mt-0.5" />
              <p className="text-sm text-purple-700 dark:text-purple-300">
                AI görsel üretimi, haber kategorisine göre otomatik stil seçimi yapar. 
                Prompt şablonunu &quot;AI Prompt Yönetimi&quot; sayfasından düzenleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* RSS Image Optimization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">RSS Görsel Optimizasyonu</h2>
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">RSS Görsel Optimizasyonunu Etkinleştir</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">RSS kaynaklarından gelen görselleri optimize et</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableRssImageOptimization}
                onChange={(e) => setSettings({ ...settings, enableRssImageOptimization: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Çıktı Formatı
            </label>
            <select
              value={settings.format}
              onChange={(e) => setSettings({ ...settings, format: e.target.value as ImageSettings['format'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {FORMAT_OPTIONS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label} - {format.description}
                </option>
              ))}
            </select>
          </div>

          {/* Quality Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kalite: {settings.quality}%
            </label>
            <input
              type="range"
              min="50"
              max="100"
              value={settings.quality}
              onChange={(e) => setSettings({ ...settings, quality: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Küçük dosya</span>
              <span>Yüksek kalite</span>
            </div>
          </div>
        </div>

        {/* Dimension Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Boyut Ayarları</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maksimum Genişlik (px)
              </label>
              <input
                type="number"
                value={settings.maxWidth}
                onChange={(e) => setSettings({ ...settings, maxWidth: parseInt(e.target.value) || 1200 })}
                min="400"
                max="2400"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maksimum Yükseklik (px)
              </label>
              <input
                type="number"
                value={settings.maxHeight}
                onChange={(e) => setSettings({ ...settings, maxHeight: parseInt(e.target.value) || 630 })}
                min="200"
                max="1350"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Strip Metadata */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Metadata Temizle</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">EXIF ve diğer metadata bilgilerini kaldır</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.stripMetadata}
                onChange={(e) => setSettings({ ...settings, stripMetadata: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Preset Buttons */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hızlı Ayarlar</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSettings({ ...settings, maxWidth: 1200, maxHeight: 630 })}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                OG Image (1200x630)
              </button>
              <button
                onClick={() => setSettings({ ...settings, maxWidth: 1920, maxHeight: 1080 })}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Full HD (1920x1080)
              </button>
              <button
                onClick={() => setSettings({ ...settings, maxWidth: 800, maxHeight: 450 })}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Küçük (800x450)
              </button>
            </div>
          </div>
        </div>

        {/* Category Image Rules */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-cyan-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kategori Görsel Kuralları</h2>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">Spor, Gündem, Dünya</span>
                <span className="text-sm text-green-600 dark:text-green-400">RSS Görseli Tercih</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gerçek fotoğraf gerektiren haberler için RSS kaynağından görsel kullanılır
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">Teknoloji, Ekonomi, Bilim</span>
                <span className="text-sm text-purple-600 dark:text-purple-400">AI Görsel Tercih</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Konsept görsel gerektiren haberler için AI ile görsel üretilir
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">Diğer Kategoriler</span>
                <span className="text-sm text-blue-600 dark:text-blue-400">Otomatik Seçim</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                RSS görseli varsa kullanılır, yoksa AI ile üretilir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>
    </div>
  )
}
