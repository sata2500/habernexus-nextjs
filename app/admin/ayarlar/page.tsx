'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Settings, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  Crown, 
  Clock, 
  Play, 
  Timer,
  Image as ImageIcon,
  Brain
} from 'lucide-react'

/**
 * Optimized Settings Page v2.0
 * 
 * Simplified and unified settings management
 * - Combined AI model and image settings
 * - Cleaner UI with better organization
 * - Improved model selection with recommendations
 */

// ============================================
// Types
// ============================================

interface SchedulerStatus {
  isRunning: boolean
  currentSchedule: string
  scheduleDescription: string
  lastRun: string | null
  nextRun: string | null
  runCount: number
  lastError: string | null
}

interface SettingsState {
  // Site Settings
  site_name: string
  site_description: string
  default_category: string
  
  // AI Model Settings
  ai_model_content: string
  ai_model_sentiment: string
  ai_model_category: string
  ai_model_summary: string
  
  // Image Settings
  ai_model_image: string
  enable_image_generation: string
  enable_rss_image_optimization: string
  
  // Scheduler Settings
  cron_schedule: string
  articles_per_run: string
}

// ============================================
// Model Configurations
// ============================================

interface ModelOption {
  id: string
  name: string
  description: string
  tier: 'premium' | 'standard' | 'lite'
  isRecommended?: boolean
  group: string
}

const TEXT_MODELS: ModelOption[] = [
  // Gemini 3 Series
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'En akıllı model', tier: 'premium', group: 'Gemini 3' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', description: 'Hız ve zeka dengesi', tier: 'standard', isRecommended: true, group: 'Gemini 3' },
  // Gemini 2.5 Series
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'En iyi fiyat-performans', tier: 'standard', isRecommended: true, group: 'Gemini 2.5' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'Ultra hızlı', tier: 'lite', group: 'Gemini 2.5' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Gelişmiş düşünme', tier: 'premium', group: 'Gemini 2.5' },
  // Gemini 2.0 Series
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Stabil workhorse', tier: 'standard', group: 'Gemini 2.0' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite', description: 'Hızlı ve ekonomik', tier: 'lite', group: 'Gemini 2.0' },
]

const IMAGE_MODELS: ModelOption[] = [
  // Imagen 4.0
  { id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4.0 Fast', description: 'Hızlı (~5s)', tier: 'standard', isRecommended: true, group: 'Imagen' },
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0 Standard', description: 'Yüksek kalite (~8s)', tier: 'standard', group: 'Imagen' },
  { id: 'imagen-4.0-ultra-generate-001', name: 'Imagen 4.0 Ultra', description: '2K çözünürlük (~10s)', tier: 'premium', group: 'Imagen' },
  // Nano Banana
  { id: 'gemini-2.0-flash-exp-image-generation', name: 'Nano Banana', description: 'Gemini tabanlı (~8s)', tier: 'standard', group: 'Nano Banana' },
]

const CRON_PRESETS = [
  { label: 'Her 15 dakikada', value: '*/15 * * * *' },
  { label: 'Her 30 dakikada', value: '*/30 * * * *' },
  { label: 'Her saat başı', value: '0 * * * *' },
  { label: 'Her 2 saatte', value: '0 */2 * * *' },
  { label: 'Her 4 saatte', value: '0 */4 * * *' },
  { label: 'Her 6 saatte', value: '0 */6 * * *' },
  { label: 'Günde bir (gece yarısı)', value: '0 0 * * *' },
  { label: 'Günde bir (sabah 8)', value: '0 8 * * *' },
]

const CATEGORIES = ['Gündem', 'Teknoloji', 'Ekonomi', 'Spor', 'Sağlık', 'Bilim', 'Dünya']

const defaultSettings: SettingsState = {
  site_name: 'HaberNexus',
  site_description: 'Yeni Nesil AI Destekli Haber Platformu',
  default_category: 'Gündem',
  ai_model_content: 'gemini-2.5-flash',
  ai_model_sentiment: 'gemini-2.5-flash',
  ai_model_category: 'gemini-2.5-flash-lite',
  ai_model_summary: 'gemini-2.5-flash-lite',
  ai_model_image: 'imagen-4.0-fast-generate-001',
  enable_image_generation: 'true',
  enable_rss_image_optimization: 'true',
  cron_schedule: '0 */6 * * *',
  articles_per_run: '5',
}

// ============================================
// Components
// ============================================

function TierBadge({ tier }: { tier: 'premium' | 'standard' | 'lite' }) {
  const config = {
    premium: { icon: Crown, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    standard: { icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    lite: { icon: Clock, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  }
  const { icon: Icon, color, bg } = config[tier]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${color} ${bg}`}>
      <Icon className="w-3 h-3" />
      {tier === 'premium' ? 'Premium' : tier === 'standard' ? 'Standart' : 'Lite'}
    </span>
  )
}

function ModelSelect({
  value,
  onChange,
  label,
  description,
  models,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  description: string
  models: ModelOption[]
}) {
  const selectedModel = models.find(m => m.id === value)
  const groups = [...new Set(models.map(m => m.group))]

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        {groups.map((group) => (
          <optgroup key={group} label={group}>
            {models.filter(m => m.group === group).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description} {model.isRecommended ? '⭐' : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        {selectedModel && <TierBadge tier={selectedModel.tier} />}
      </div>
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  )
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
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null)
  const [triggeringScheduler, setTriggeringScheduler] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'scheduler'>('general')

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
    <div className="space-y-6 max-w-4xl mx-auto">
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
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {[
            { id: 'general', label: 'Genel', icon: Settings },
            { id: 'ai', label: 'AI & Görsel', icon: Brain },
            { id: 'scheduler', label: 'Zamanlayıcı', icon: Timer },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Site Ayarları</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Adı
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
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
            </div>
          </div>
        )}

        {/* AI & Image Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* Text Models */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Metin AI Modelleri</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ModelSelect
                  value={settings.ai_model_content}
                  onChange={(value) => handleChange('ai_model_content', value)}
                  label="İçerik Üretim"
                  description="Haber makaleleri oluşturma"
                  models={TEXT_MODELS}
                />
                <ModelSelect
                  value={settings.ai_model_sentiment}
                  onChange={(value) => handleChange('ai_model_sentiment', value)}
                  label="Duygu Analizi"
                  description="Makale duygu tespiti"
                  models={TEXT_MODELS}
                />
                <ModelSelect
                  value={settings.ai_model_category}
                  onChange={(value) => handleChange('ai_model_category', value)}
                  label="Kategori Belirleme"
                  description="Otomatik kategori tespiti"
                  models={TEXT_MODELS}
                />
                <ModelSelect
                  value={settings.ai_model_summary}
                  onChange={(value) => handleChange('ai_model_summary', value)}
                  label="Özet Oluşturma"
                  description="Makale özetleri"
                  models={TEXT_MODELS}
                />
              </div>
            </div>

            {/* Image Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Görsel Ayarları</h2>
              </div>

              <div className="space-y-4">
                <Toggle
                  checked={settings.enable_image_generation === 'true'}
                  onChange={(checked) => handleChange('enable_image_generation', checked ? 'true' : 'false')}
                  label="AI Görsel Üretimi"
                  description="Haberler için otomatik AI görsel üretimi"
                />

                <Toggle
                  checked={settings.enable_rss_image_optimization === 'true'}
                  onChange={(checked) => handleChange('enable_rss_image_optimization', checked ? 'true' : 'false')}
                  label="RSS Görsel Optimizasyonu"
                  description="RSS kaynaklarından gelen görselleri optimize et"
                />

                <ModelSelect
                  value={settings.ai_model_image}
                  onChange={(value) => handleChange('ai_model_image', value)}
                  label="Görsel Üretim Modeli"
                  description="AI görsel üretimi için kullanılacak model"
                  models={IMAGE_MODELS}
                />
              </div>
            </div>
          </div>
        )}

        {/* Scheduler Tab */}
        {activeTab === 'scheduler' && (
          <div className="space-y-6">
            {/* Scheduler Status */}
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
                  {triggeringScheduler ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
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

            {/* Scheduler Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Zamanlama Ayarları</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Çalışma Sıklığı
                  </label>
                  <select
                    value={settings.cron_schedule}
                    onChange={(e) => handleChange('cron_schedule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {CRON_PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value}>{preset.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Her Çalışmada Makale Sayısı
                  </label>
                  <select
                    value={settings.articles_per_run}
                    onChange={(e) => handleChange('articles_per_run', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 5, 10, 15, 20].map((num) => (
                      <option key={num} value={num.toString()}>{num} makale</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
