'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, Save, AlertCircle, CheckCircle, RefreshCw, Sparkles, Zap, Crown, Clock, Play, Timer, ExternalLink } from 'lucide-react'
import Link from 'next/link'

/**
 * Gemini Model Configuration
 * All available models with their properties
 */
interface GeminiModel {
  id: string
  name: string
  description: string
  tier: 'premium' | 'standard' | 'lite'
  isExperimental: boolean
  isDeprecated: boolean
}

interface ModelGroup {
  title: string
  models: string[]
  badge: string
  badgeColor: string
}

interface SchedulerStatus {
  isRunning: boolean
  currentSchedule: string
  scheduleDescription: string
  lastRun: string | null
  nextRun: string | null
  runCount: number
  lastError: string | null
}

const GEMINI_MODELS: Record<string, GeminiModel> = {
  // Gemini 3 Series (Latest)
  'gemini-3-pro-preview': {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    description: 'En akıllı model - Multimodal anlama ve agentic görevler için ideal',
    tier: 'premium',
    isExperimental: true,
    isDeprecated: false,
  },
  'gemini-3-flash-preview': {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    description: 'Hız ve zeka dengesi - Ölçeklenebilir görevler için',
    tier: 'standard',
    isExperimental: true,
    isDeprecated: false,
  },

  // Gemini 2.5 Series (Recommended)
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'En iyi fiyat-performans - Genel kullanım için önerilen',
    tier: 'standard',
    isExperimental: false,
    isDeprecated: false,
  },
  'gemini-2.5-flash-lite': {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    description: 'Ultra hızlı - Yüksek hacimli basit görevler için',
    tier: 'lite',
    isExperimental: false,
    isDeprecated: false,
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: 'Gelişmiş düşünme - Karmaşık analiz ve muhakeme için',
    tier: 'premium',
    isExperimental: false,
    isDeprecated: false,
  },

  // Gemini 2.0 Series (Previous Generation)
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Stabil workhorse - Güvenilir genel kullanım',
    tier: 'standard',
    isExperimental: false,
    isDeprecated: false,
  },
  'gemini-2.0-flash-lite': {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    description: 'Hızlı ve ekonomik - Basit görevler için',
    tier: 'lite',
    isExperimental: false,
    isDeprecated: false,
  },

  // Gemini 1.5 Series (Legacy)
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Eski nesil - Yakında kullanımdan kaldırılacak',
    tier: 'standard',
    isExperimental: false,
    isDeprecated: true,
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Eski nesil Pro - Yakında kullanımdan kaldırılacak',
    tier: 'premium',
    isExperimental: false,
    isDeprecated: true,
  },
}

const MODEL_GROUPS: ModelGroup[] = [
  {
    title: 'Gemini 3 Serisi (En Yeni)',
    models: ['gemini-3-pro-preview', 'gemini-3-flash-preview'],
    badge: 'Yeni',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  {
    title: 'Gemini 2.5 Serisi (Önerilen)',
    models: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'],
    badge: 'Önerilen',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  {
    title: 'Gemini 2.0 Serisi (Stabil)',
    models: ['gemini-2.0-flash', 'gemini-2.0-flash-lite'],
    badge: 'Stabil',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  {
    title: 'Gemini 1.5 Serisi (Eski)',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    badge: 'Kullanımdan Kaldırılacak',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
]

const CRON_PRESETS = [
  { label: 'Her 15 dakikada', value: '*/15 * * * *' },
  { label: 'Her 30 dakikada', value: '*/30 * * * *' },
  { label: 'Her saat başı', value: '0 * * * *' },
  { label: 'Her 2 saatte', value: '0 */2 * * *' },
  { label: 'Her 4 saatte', value: '0 */4 * * *' },
  { label: 'Her 6 saatte', value: '0 */6 * * *' },
  { label: 'Her 12 saatte', value: '0 */12 * * *' },
  { label: 'Günde bir (gece yarısı)', value: '0 0 * * *' },
  { label: 'Günde bir (sabah 8)', value: '0 8 * * *' },
  { label: 'Özel...', value: 'custom' },
]

interface SettingsState {
  site_name: string
  site_description: string
  ai_model_content: string
  ai_model_sentiment: string
  ai_model_category: string
  ai_model_summary: string
  ai_model_image: string
  enable_image_generation: string
  cron_schedule: string
  articles_per_run: string
  default_category: string
}

const defaultSettings: SettingsState = {
  site_name: 'HaberNexus',
  site_description: 'Yeni Nesil AI Destekli Haber Platformu',
  ai_model_content: 'gemini-2.5-flash',
  ai_model_sentiment: 'gemini-2.5-flash',
  ai_model_category: 'gemini-2.5-flash-lite',
  ai_model_summary: 'gemini-2.5-flash-lite',
  ai_model_image: 'imagen-3.0-generate-002',
  enable_image_generation: 'true',
  cron_schedule: '0 */6 * * *',
  articles_per_run: '5',
  default_category: 'Gündem',
}

function TierBadge({ tier }: { tier: 'premium' | 'standard' | 'lite' }) {
  const config = {
    premium: { icon: Crown, color: 'text-amber-500', label: 'Premium' },
    standard: { icon: Zap, color: 'text-blue-500', label: 'Standart' },
    lite: { icon: Clock, color: 'text-green-500', label: 'Lite' },
  }
  const { icon: Icon, color, label } = config[tier]
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function ModelSelect({
  value,
  onChange,
  label,
  description,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  description: string
}) {
  const selectedModel = GEMINI_MODELS[value]

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {MODEL_GROUPS.map((group) => (
          <optgroup key={group.title} label={group.title}>
            {group.models.map((modelId) => {
              const model = GEMINI_MODELS[modelId]
              if (!model) return null
              return (
                <option key={modelId} value={modelId} disabled={model.isDeprecated}>
                  {model.name} {model.isExperimental ? '(Deneysel)' : ''} {model.isDeprecated ? '(Kullanımdan Kaldırılacak)' : ''}
                </option>
              )
            })}
          </optgroup>
        ))}
      </select>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      {selectedModel && (
        <div className="flex items-center gap-2 mt-1">
          <TierBadge tier={selectedModel.tier} />
          {selectedModel.isExperimental && (
            <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
              <Sparkles className="w-3 h-3" />
              Deneysel
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null)
  const [triggeringScheduler, setTriggeringScheduler] = useState(false)

  const fetchSchedulerStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scheduler')
      if (response.ok) {
        const data = await response.json()
        setSchedulerStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch scheduler status:', err)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
    fetchSchedulerStatus()
    
    // Refresh scheduler status every 30 seconds
    const interval = setInterval(fetchSchedulerStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchSchedulerStatus])

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

      // Restart scheduler with new settings
      await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart' }),
      })

      setSuccess(true)
      fetchSchedulerStatus()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleTriggerScheduler = async () => {
    setTriggeringScheduler(true)
    try {
      const response = await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger' }),
      })
      const data = await response.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.message || 'İçerik üretimi başlatılamadı')
      }
      fetchSchedulerStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setTriggeringScheduler(false)
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
        {/* Scheduler Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Zamanlayıcı Durumu</h2>
            </div>
            <button
              onClick={handleTriggerScheduler}
              disabled={triggeringScheduler}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {triggeringScheduler ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {triggeringScheduler ? 'Çalışıyor...' : 'Şimdi Çalıştır'}
            </button>
          </div>
          
          {schedulerStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Durum</p>
                <p className={`text-sm font-medium ${schedulerStatus.isRunning ? 'text-green-600' : 'text-yellow-600'}`}>
                  {schedulerStatus.isRunning ? 'Aktif' : 'Pasif'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Zamanlama</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {schedulerStatus.scheduleDescription || schedulerStatus.currentSchedule}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Son Çalışma</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {schedulerStatus.lastRun 
                    ? new Date(schedulerStatus.lastRun).toLocaleString('tr-TR')
                    : 'Henüz çalışmadı'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Çalışma</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {schedulerStatus.runCount} kez
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Zamanlayıcı durumu yükleniyor...</p>
          )}
          
          {schedulerStatus?.lastError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">Son Hata: {schedulerStatus.lastError}</p>
            </div>
          )}
        </div>

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

        {/* AI Model Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Model Ayarları</h2>
          </div>
          
          {/* Model Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Model Seçimi Hakkında</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Premium</strong> modeller en yüksek kaliteyi sunar ancak daha yavaş ve pahalıdır</li>
              <li>• <strong>Standart</strong> modeller iyi bir denge sağlar ve çoğu kullanım için önerilir</li>
              <li>• <strong>Lite</strong> modeller hızlı ve ekonomiktir, basit görevler için idealdir</li>
              <li>• <strong>Deneysel</strong> modeller en yeni özellikleri içerir ancak değişebilir</li>
            </ul>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ModelSelect
              value={settings.ai_model_content}
              onChange={(value) => handleChange('ai_model_content', value)}
              label="İçerik Üretim Modeli"
              description="Haber makaleleri oluşturmak için kullanılır"
            />
            <ModelSelect
              value={settings.ai_model_sentiment}
              onChange={(value) => handleChange('ai_model_sentiment', value)}
              label="Duygu Analizi Modeli"
              description="Makale duygu analizi için kullanılır"
            />
            <ModelSelect
              value={settings.ai_model_category}
              onChange={(value) => handleChange('ai_model_category', value)}
              label="Kategori Belirleme Modeli"
              description="Otomatik kategori tespiti için kullanılır"
            />
            <ModelSelect
              value={settings.ai_model_summary}
              onChange={(value) => handleChange('ai_model_summary', value)}
              label="Özet Oluşturma Modeli"
              description="Makale özetleri için kullanılır"
            />
          </div>

          {/* Görsel Ayarları Yönlendirmesi */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white">Görsel Üretim Ayarları</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  AI görsel üretimi ve optimizasyon ayarları için ayrı sayfaya gidin
                </p>
              </div>
              <Link
                href="/admin/gorsel-ayarlari"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Görsel Ayarları</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Otomasyon Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Otomasyon Ayarları</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zamanlama
              </label>
              <select
                value={CRON_PRESETS.some(p => p.value === settings.cron_schedule) ? settings.cron_schedule : 'custom'}
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    handleChange('cron_schedule', e.target.value)
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CRON_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">İçerik üretim motorunun ne sıklıkla çalışacağı</p>
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
          
          {/* Custom Cron Input - Sadece "Özel" seçiliğinde veya mevcut değer preset listesinde değilse göster */}
          {!CRON_PRESETS.some(p => p.value === settings.cron_schedule && p.value !== 'custom') && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Özel Cron İfadesi
              </label>
              <input
                type="text"
                value={settings.cron_schedule === 'custom' ? '' : settings.cron_schedule}
                onChange={(e) => handleChange('cron_schedule', e.target.value)}
                placeholder="*/15 * * * *"
                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: dakika saat gün ay haftanın_günü (örn: &quot;*/15 * * * *&quot; = her 15 dakikada)
              </p>
            </div>
          )}
        </div>

        {/* Model Referans Tablosu */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Referans Tablosu</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Model</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Seviye</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Açıklama</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Durum</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(GEMINI_MODELS).map((model) => (
                  <tr key={model.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 px-3 font-mono text-xs text-gray-900 dark:text-white">{model.id}</td>
                    <td className="py-2 px-3"><TierBadge tier={model.tier} /></td>
                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{model.description}</td>
                    <td className="py-2 px-3">
                      {model.isDeprecated ? (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">Kullanımdan Kaldırılacak</span>
                      ) : model.isExperimental ? (
                        <span className="text-xs text-purple-600 dark:text-purple-400">Deneysel</span>
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400">Aktif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
