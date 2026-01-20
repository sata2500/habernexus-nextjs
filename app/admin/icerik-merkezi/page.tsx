'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  Brain, 
  Settings, 
  FileText, 
  Image as ImageIcon, 
  Play, 
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
  Crown,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  RotateCcw,
  Rss,
  Eye,
  BarChart3,
  Timer,
  ExternalLink
} from 'lucide-react'

/**
 * İçerik Üretim Merkezi - Birleşik Admin Sayfası
 * 
 * Tüm içerik üretimi ayarlarını ve kontrollerini
 * tek bir güçlü arayüzde birleştirir.
 * 
 * Testler ayrı test sayfasına taşındı.
 * Hızlı mod kaldırıldı - sadece standart kaliteli üretim.
 * 
 * @version 2.0.0
 * @lastUpdated 20 January 2026
 */

// ============================================
// Types
// ============================================

interface EngineStatus {
  isConfigured: boolean
  isResearchEnabled: boolean
  isImageGenEnabled: boolean
  isRssImageOptEnabled: boolean
  config: {
    maxTopics: number
    minQualityScore: number
    enableResearch: boolean
    enableImageGeneration: boolean
    enableRssImageOptimization: boolean
    parallelResearch: boolean
  }
  lastGeneration: string | null
  activeFeeds: number
  totalArticles: number
  imageStats: {
    aiGenerated: number
    rssOptimized: number
    placeholder: number
  }
  diagnostics?: {
    geminiApiKey: boolean
    imagenConfigured: boolean
    nodeEnv: string
    timestamp: string
  }
}

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

interface SettingsState {
  ai_model_content: string
  ai_model_sentiment: string
  ai_model_category: string
  ai_model_summary: string
  ai_model_image: string
  enable_image_generation: string
  enable_rss_image_optimization: string
  cron_schedule: string
  articles_per_run: string
}

interface PipelineResult {
  success: boolean
  mode: string
  articlesPublished?: number
  imagesGenerated?: number
  imagesOptimized?: number
  totalDuration?: number
  errors: string[]
  articles?: Array<{
    title: string
    slug: string
    category: string
    qualityScore: number
    imageSource: string
  }>
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
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'En akıllı model', tier: 'premium', group: 'Gemini 3' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', description: 'Hız ve zeka dengesi', tier: 'standard', isRecommended: true, group: 'Gemini 3' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'En iyi fiyat-performans', tier: 'standard', isRecommended: true, group: 'Gemini 2.5' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'Ultra hızlı', tier: 'lite', group: 'Gemini 2.5' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Gelişmiş düşünme', tier: 'premium', group: 'Gemini 2.5' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Stabil workhorse', tier: 'standard', group: 'Gemini 2.0' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite', description: 'Hızlı ve ekonomik', tier: 'lite', group: 'Gemini 2.0' },
]

const IMAGE_MODELS: ModelOption[] = [
  { id: 'imagen-4.0-fast-generate-001', name: 'Imagen 4.0 Fast', description: 'Hızlı (~5s)', tier: 'standard', isRecommended: true, group: 'Imagen' },
  { id: 'imagen-4.0-generate-001', name: 'Imagen 4.0 Standard', description: 'Yüksek kalite (~8s)', tier: 'standard', group: 'Imagen' },
  { id: 'imagen-4.0-ultra-generate-001', name: 'Imagen 4.0 Ultra', description: '2K çözünürlük (~10s)', tier: 'premium', group: 'Imagen' },
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

const PROMPT_TYPE_INFO = {
  CONTENT: { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', label: 'İçerik Üretimi' },
  IMAGE: { icon: ImageIcon, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', label: 'Görsel Üretimi' },
  SENTIMENT: { icon: Brain, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Duygu Analizi' },
  CATEGORY: { icon: BarChart3, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30', label: 'Kategori Belirleme' },
  SUMMARY: { icon: FileText, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', label: 'Özet Oluşturma' },
}

const defaultSettings: SettingsState = {
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
// Helper Components
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

function StatusCard({ 
  icon: Icon, 
  label, 
  value, 
  status 
}: { 
  icon: React.ElementType
  label: string
  value: string | number
  status?: 'success' | 'warning' | 'error' | 'info'
}) {
  const statusColors = {
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    error: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status ? statusColors[status] : 'bg-gray-100 dark:bg-gray-700'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export default function ContentCenterPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'prompts' | 'production'>('overview')
  
  // Data states
  const [status, setStatus] = useState<EngineStatus | null>(null)
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null)
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null)
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ============================================
  // Data Fetching
  // ============================================

  const fetchAllData = useCallback(async () => {
    try {
      const [statusRes, settingsRes, promptsRes, schedulerRes] = await Promise.all([
        fetch('/api/admin/content-engine'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/prompts'),
        fetch('/api/admin/scheduler'),
      ])

      if (statusRes.ok) {
        const data = await statusRes.json()
        setStatus(data)
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings({ ...defaultSettings, ...data })
      }

      if (promptsRes.ok) {
        const data = await promptsRes.json()
        setPrompts(data)
      }

      if (schedulerRes.ok) {
        const data = await schedulerRes.json()
        setSchedulerStatus(data)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Veriler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllData()
    // Scheduler durumunu periyodik olarak güncelle
    const interval = setInterval(() => {
      fetch('/api/admin/scheduler').then(res => res.ok && res.json()).then(data => {
        if (data) setSchedulerStatus(data)
      }).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchAllData])

  // ============================================
  // Settings Handlers
  // ============================================

  const handleSaveSettings = async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error('Ayarlar kaydedilemedi')

      // Restart scheduler
      await fetch('/api/admin/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart' }),
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchAllData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (key: keyof SettingsState, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // ============================================
  // Prompt Handlers
  // ============================================

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
      fetchAllData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleSeedPrompts = async () => {
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
      fetchAllData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // Production Handlers
  // ============================================

  const runProduction = async () => {
    setRunning(true)
    setPipelineResult(null)
    
    try {
      const response = await fetch('/api/admin/content-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'run',
          mode: 'standard',
          maxTopics: parseInt(settings.articles_per_run) || 5,
        }),
      })
      
      const data = await response.json()
      setPipelineResult(data)
      fetchAllData()
    } catch (err) {
      setPipelineResult({
        success: false,
        mode: 'standard',
        errors: [err instanceof Error ? err.message : 'Üretim başarısız'],
      })
    } finally {
      setRunning(false)
    }
  }

  const handleTriggerScheduler = async () => {
    setRunning(true)
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
      fetchAllData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setRunning(false)
    }
  }

  // ============================================
  // Render
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">İçerik Üretim Merkezi</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI ayarları, promptlar ve içerik üretimi kontrolleri
            </p>
          </div>
        </div>
        <button
          onClick={fetchAllData}
          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 dark:text-green-200">İşlem başarıyla tamamlandı!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: Eye },
            { id: 'settings', label: 'AI Ayarları', icon: Settings },
            { id: 'prompts', label: 'Promptlar', icon: FileText },
            { id: 'production', label: 'Üretim', icon: Play },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
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
      <div className="min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatusCard
                icon={status?.isConfigured ? CheckCircle : XCircle}
                label="Sistem Durumu"
                value={status?.isConfigured ? 'Hazır' : 'Yapılandırılmamış'}
                status={status?.isConfigured ? 'success' : 'error'}
              />
              <StatusCard
                icon={Brain}
                label="Gemini API"
                value={status?.diagnostics?.geminiApiKey ? 'Bağlı' : 'Bağlı Değil'}
                status={status?.diagnostics?.geminiApiKey ? 'success' : 'error'}
              />
              <StatusCard
                icon={ImageIcon}
                label="Görsel Üretimi"
                value={status?.isImageGenEnabled ? 'Aktif' : 'Devre Dışı'}
                status={status?.isImageGenEnabled ? 'success' : 'warning'}
              />
              <StatusCard
                icon={Rss}
                label="Aktif RSS"
                value={status?.activeFeeds || 0}
                status="info"
              />
            </div>

            {/* Scheduler Status */}
            {schedulerStatus && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Zamanlayıcı Durumu</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      schedulerStatus.isRunning 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {schedulerStatus.isRunning ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sonraki Çalışma</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {schedulerStatus.nextRun 
                        ? new Date(schedulerStatus.nextRun).toLocaleString('tr-TR')
                        : '-'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Çalışma</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {schedulerStatus.runCount} kez
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Article Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Makale İstatistikleri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{status?.totalArticles || 0}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Toplam Makale</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{status?.config?.maxTopics || 5}</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Çalışma Başına</p>
                  </div>
                </div>
              </div>

              {/* Image Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Görsel İstatistikleri</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{status?.imageStats?.aiGenerated || 0}</p>
                    <p className="text-xs text-green-700 dark:text-green-300">AI Üretilen</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{status?.imageStats?.rssOptimized || 0}</p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">RSS Optimize</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{status?.imageStats?.placeholder || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Placeholder</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hızlı İşlemler</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/testler"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <TestTube className="w-4 h-4" />
                  Sistem Testleri
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => setActiveTab('production')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  İçerik Üret
                </button>
                <button
                  onClick={handleTriggerScheduler}
                  disabled={running}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                >
                  {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Timer className="w-4 h-4" />}
                  Zamanlayıcıyı Tetikle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Text Models */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Metin AI Modelleri</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <ModelSelect
                  value={settings.ai_model_content}
                  onChange={(value) => handleSettingChange('ai_model_content', value)}
                  label="İçerik Üretim"
                  description="Haber makaleleri oluşturma"
                  models={TEXT_MODELS}
                />
                <ModelSelect
                  value={settings.ai_model_sentiment}
                  onChange={(value) => handleSettingChange('ai_model_sentiment', value)}
                  label="Duygu Analizi"
                  description="Makale duygu tespiti"
                  models={TEXT_MODELS}
                />
                <ModelSelect
                  value={settings.ai_model_category}
                  onChange={(value) => handleSettingChange('ai_model_category', value)}
                  label="Kategori Belirleme"
                  description="Otomatik kategori tespiti"
                  models={TEXT_MODELS}
                />
                <ModelSelect
                  value={settings.ai_model_summary}
                  onChange={(value) => handleSettingChange('ai_model_summary', value)}
                  label="Özet Oluşturma"
                  description="Makale özetleri"
                  models={TEXT_MODELS}
                />
              </div>
            </div>

            {/* Image Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Görsel Ayarları</h2>
              </div>
              <div className="space-y-4">
                <Toggle
                  checked={settings.enable_image_generation === 'true'}
                  onChange={(checked) => handleSettingChange('enable_image_generation', checked ? 'true' : 'false')}
                  label="AI Görsel Üretimi"
                  description="Haberler için otomatik AI görsel üretimi"
                />
                <Toggle
                  checked={settings.enable_rss_image_optimization === 'true'}
                  onChange={(checked) => handleSettingChange('enable_rss_image_optimization', checked ? 'true' : 'false')}
                  label="RSS Görsel Optimizasyonu"
                  description="RSS kaynaklarından gelen görselleri optimize et"
                />
                <ModelSelect
                  value={settings.ai_model_image}
                  onChange={(value) => handleSettingChange('ai_model_image', value)}
                  label="Görsel Üretim Modeli"
                  description="AI görsel üretimi için kullanılacak model"
                  models={IMAGE_MODELS}
                />
              </div>
            </div>

            {/* Scheduler Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Zamanlayıcı Ayarları</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Çalışma Sıklığı
                  </label>
                  <select
                    value={settings.cron_schedule}
                    onChange={(e) => handleSettingChange('cron_schedule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {CRON_PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value}>{preset.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Çalışma Başına Makale
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.articles_per_run}
                    onChange={(e) => handleSettingChange('articles_per_run', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* Prompts Tab */}
        {activeTab === 'prompts' && (
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-medium">Prompt Değişkenleri</p>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  Promptlarda <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{'{{değişken}}'}</code> formatında değişkenler kullanabilirsiniz. 
                  Sistem bu değişkenleri otomatik olarak doldurur.
                </p>
              </div>
            </div>

            {prompts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Prompt Bulunamadı</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Varsayılan promptları oluşturmak için aşağıdaki butona tıklayın.</p>
                <button
                  onClick={handleSeedPrompts}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Varsayılan Promptları Oluştur
                </button>
              </div>
            ) : (
              prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onSave={handleSavePrompt}
                  saving={saving}
                />
              ))
            )}
          </div>
        )}

        {/* Production Tab */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            {/* Production Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">İçerik Üretimi</h3>
              
              {/* Standard Mode */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <Brain className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200 text-lg">Standart İçerik Üretimi</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Tam pipeline: Konu seçimi, araştırma, sentez ve yayınlama
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Üretilecek Makale</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{settings.articles_per_run}</p>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">İçerik Modeli</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {TEXT_MODELS.find(m => m.id === settings.ai_model_content)?.name || settings.ai_model_content}
                    </p>
                  </div>
                  <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Görsel Modeli</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {IMAGE_MODELS.find(m => m.id === settings.ai_model_image)?.name || settings.ai_model_image}
                    </p>
                  </div>
                </div>

                <button
                  onClick={runProduction}
                  disabled={running}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-lg transition-colors"
                >
                  {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  {running ? 'Üretim Devam Ediyor...' : 'İçerik Üretimini Başlat'}
                </button>
              </div>
            </div>

            {/* Pipeline Result */}
            {pipelineResult && (
              <div className={`bg-white dark:bg-gray-800 rounded-xl border p-6 ${
                pipelineResult.success
                  ? 'border-green-200 dark:border-green-800'
                  : 'border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  {pipelineResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {pipelineResult.success ? 'Üretim Tamamlandı' : 'Üretim Başarısız'}
                  </h3>
                </div>

                {pipelineResult.success && (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pipelineResult.articlesPublished || 0}</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Yayınlanan</p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{pipelineResult.imagesGenerated || 0}</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">AI Görsel</p>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pipelineResult.imagesOptimized || 0}</p>
                        <p className="text-xs text-orange-700 dark:text-orange-300">RSS Görsel</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                          {pipelineResult.totalDuration ? (pipelineResult.totalDuration / 1000).toFixed(1) : 0}s
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Süre</p>
                      </div>
                    </div>

                    {/* Articles */}
                    {pipelineResult.articles && pipelineResult.articles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">Yayınlanan Makaleler</h4>
                        {pipelineResult.articles.map((article, index) => (
                          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-white">{article.title}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>{article.category}</span>
                              <span>Kalite: {article.qualityScore}/100</span>
                              <span>Görsel: {article.imageSource}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Errors */}
                {pipelineResult.errors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Hatalar</h4>
                    <ul className="space-y-1">
                      {pipelineResult.errors.map((error, i) => (
                        <li key={i} className="text-sm text-red-800 dark:text-red-200">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Prompt Card Component
// ============================================

function PromptCard({ 
  prompt, 
  onSave, 
  saving 
}: { 
  prompt: PromptTemplate
  onSave: (id: string, template: string) => Promise<void>
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

  const handleReset = () => {
    setEditedTemplate(prompt.template)
    setHasChanges(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
              <h3 className="font-semibold text-gray-900 dark:text-white">{prompt.displayName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{typeInfo.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 rounded">
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

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Variables */}
          {variables.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Kullanılabilir Değişkenler:</p>
              <div className="flex flex-wrap gap-2">
                {variables.map((v) => (
                  <code key={v} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Editor */}
          <textarea
            value={editedTemplate}
            onChange={(e) => setEditedTemplate(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-4">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <RotateCcw className="w-4 h-4" />
                Sıfırla
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
