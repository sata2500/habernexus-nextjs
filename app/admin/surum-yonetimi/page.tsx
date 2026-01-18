'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  GitBranch, 
  Tag, 
  RefreshCw, 
  Play, 
  Settings, 
  History,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Power,
  PowerOff,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CurrentVersion {
  commit: string
  shortCommit: string
  branch: string
  tag: string | null
  lastCommitDate: string | null
  lastCommitMessage: string | null
}

interface DeploymentStatus {
  currentVersion: CurrentVersion
  lastDeployment: {
    id: string
    type: string
    status: string
    fromVersion: string | null
    toVersion: string
    triggeredBy: string | null
    startedAt: string
    completedAt: string | null
    duration: number | null
  } | null
  webhookStatus: string
  settings: {
    webhookEnabled: boolean
    cooldownPeriod: number
    allowedBranches: string
    autoDeployEnabled: boolean
  }
}

interface Release {
  id: number
  tagName: string
  name: string
  description: string
  isDraft: boolean
  isPrerelease: boolean
  createdAt: string
  publishedAt: string
  htmlUrl: string
  author: {
    login: string
    avatarUrl: string
  }
}

interface DeploymentHistoryItem {
  id: string
  type: string
  status: string
  fromVersion: string | null
  toVersion: string
  triggeredBy: string | null
  startedAt: string
  completedAt: string | null
  duration: number | null
  errorMessage: string | null
  hasLogs: boolean
}

interface Settings {
  webhookEnabled: boolean
  autoDeployEnabled: boolean
  cooldownPeriod: number
  allowedBranches: string[]
  webhookSecretConfigured: boolean
  notifyOnDeploy: boolean
  backupBeforeDeploy: boolean
}

export default function VersionManagementPage() {
  const [status, setStatus] = useState<DeploymentStatus | null>(null)
  const [releases, setReleases] = useState<Release[]>([])
  const [history, setHistory] = useState<DeploymentHistoryItem[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [deploying, setDeploying] = useState(false)
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [deploymentLogs, setDeploymentLogs] = useState<Record<string, string[]>>({})

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/deployment/status')
      const data = await response.json()
      if (data.success) {
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Status fetch error:', error)
    }
  }, [])

  const fetchReleases = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/deployment/releases')
      const data = await response.json()
      if (data.success) {
        setReleases(data.data.releases)
      }
    } catch (error) {
      console.error('Releases fetch error:', error)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/deployment/history?limit=10')
      const data = await response.json()
      if (data.success) {
        setHistory(data.data.deployments)
      }
    } catch (error) {
      console.error('History fetch error:', error)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/deployment/settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Settings fetch error:', error)
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchStatus(), fetchReleases(), fetchHistory(), fetchSettings()])
    setLoading(false)
  }, [fetchStatus, fetchReleases, fetchHistory, fetchSettings])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleDeploy = async (version: string, type: string = 'manual') => {
    if (!confirm(`${version} sürümüne geçmek istediğinizden emin misiniz?`)) {
      return
    }

    setDeploying(true)
    try {
      const response = await fetch('/api/admin/deployment/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetVersion: version, type }),
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Deployment başlatıldı! Sayfa otomatik olarak güncellenecek.')
        // Poll for updates
        const pollInterval = setInterval(async () => {
          await fetchStatus()
          await fetchHistory()
          const latestDeployment = history[0]
          if (latestDeployment && latestDeployment.status !== 'running' && latestDeployment.status !== 'pending') {
            clearInterval(pollInterval)
            setDeploying(false)
          }
        }, 5000)
        
        // Stop polling after 10 minutes
        setTimeout(() => {
          clearInterval(pollInterval)
          setDeploying(false)
        }, 600000)
      } else {
        alert(`Hata: ${data.error}`)
        setDeploying(false)
      }
    } catch (error) {
      console.error('Deploy error:', error)
      alert('Deployment başlatılamadı')
      setDeploying(false)
    }
  }

  const handleSettingsUpdate = async (newSettings: Partial<Settings>) => {
    try {
      const response = await fetch('/api/admin/deployment/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })
      const data = await response.json()
      
      if (data.success) {
        await fetchSettings()
        alert('Ayarlar güncellendi')
      } else {
        alert(`Hata: ${data.error}`)
      }
    } catch (error) {
      console.error('Settings update error:', error)
      alert('Ayarlar güncellenemedi')
    }
  }

  const fetchDeploymentLogs = async (deploymentId: string) => {
    try {
      const response = await fetch('/api/admin/deployment/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deploymentId }),
      })
      const data = await response.json()
      
      if (data.success && data.data.logs) {
        setDeploymentLogs(prev => ({
          ...prev,
          [deploymentId]: data.data.logs,
        }))
      }
    } catch (error) {
      console.error('Logs fetch error:', error)
    }
  }

  const getStatusIcon = (webhookStatus: string) => {
    switch (webhookStatus) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'not_running':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getDeploymentStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Başarılı</span>
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Başarısız</span>
      case 'running':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Çalışıyor</span>
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Bekliyor</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sürüm Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            GitHub sürümlerini yönetin ve deployment işlemlerini kontrol edin
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Yenile
        </button>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Version */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Mevcut Sürüm</h3>
          </div>
          {status?.currentVersion && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {status.currentVersion.tag ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm font-mono">
                    <Tag className="w-3 h-3" />
                    {status.currentVersion.tag}
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-mono">
                    {status.currentVersion.shortCommit}
                  </span>
                )}
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  ({status.currentVersion.branch})
                </span>
              </div>
              {status.currentVersion.lastCommitMessage && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {status.currentVersion.lastCommitMessage}
                </p>
              )}
              {status.currentVersion.lastCommitDate && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(status.currentVersion.lastCommitDate).toLocaleString('tr-TR')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Webhook Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              {status?.webhookStatus === 'running' ? (
                <Power className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              ) : (
                <PowerOff className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Webhook Durumu</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(status?.webhookStatus || 'unknown')}
              <span className="text-gray-700 dark:text-gray-300">
                {status?.webhookStatus === 'running' ? 'Çalışıyor' : 
                 status?.webhookStatus === 'not_running' ? 'Çalışmıyor' : 'Bilinmiyor'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={cn(
                "w-2 h-2 rounded-full",
                status?.settings.autoDeployEnabled ? "bg-green-500" : "bg-gray-400"
              )} />
              <span className="text-gray-600 dark:text-gray-400">
                Otomatik Deployment: {status?.settings.autoDeployEnabled ? 'Açık' : 'Kapalı'}
              </span>
            </div>
          </div>
        </div>

        {/* Last Deployment */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Son Deployment</h3>
          </div>
          {status?.lastDeployment ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getDeploymentStatusBadge(status.lastDeployment.status)}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {status.lastDeployment.type === 'auto' ? 'Otomatik' : 
                   status.lastDeployment.type === 'manual' ? 'Manuel' : 'Rollback'}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                → {status.lastDeployment.toVersion}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {new Date(status.lastDeployment.startedAt).toLocaleString('tr-TR')}
                {status.lastDeployment.duration && ` (${status.lastDeployment.duration}s)`}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Henüz deployment yapılmamış</p>
          )}
        </div>
      </div>

      {/* Settings Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Deployment Ayarları</span>
          </div>
          {showSettings ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {showSettings && settings && (
          <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Auto Deploy Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Otomatik Deployment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Push event&apos;lerinde otomatik deploy</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate({ autoDeployEnabled: !settings.autoDeployEnabled })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.autoDeployEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      settings.autoDeployEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Webhook Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Webhook Aktif</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">GitHub webhook isteklerini kabul et</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate({ webhookEnabled: !settings.webhookEnabled })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.webhookEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      settings.webhookEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Backup Before Deploy */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Deployment Öncesi Yedekleme</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Deploy öncesi otomatik yedek al</p>
                </div>
                <button
                  onClick={() => handleSettingsUpdate({ backupBeforeDeploy: !settings.backupBeforeDeploy })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    settings.backupBeforeDeploy ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      settings.backupBeforeDeploy ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Cooldown Period */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-2">Cooldown Süresi</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={settings.cooldownPeriod}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (value >= 0) {
                        handleSettingsUpdate({ cooldownPeriod: value })
                      }
                    }}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="0"
                  />
                  <span className="text-gray-500 dark:text-gray-400">saniye</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Releases Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="font-semibold text-gray-900 dark:text-white">GitHub Sürümleri</h2>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-sm">
              {releases.length} sürüm
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
          {releases.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Henüz release oluşturulmamış
            </div>
          ) : (
            releases.map((release) => {
              const isCurrentVersion = status?.currentVersion.tag === release.tagName
              const isSelected = selectedRelease?.id === release.id
              
              return (
                <div
                  key={release.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => setSelectedRelease(isSelected ? null : release)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-2 py-1 rounded text-sm font-mono",
                        isCurrentVersion 
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      )}>
                        {release.tagName}
                      </span>
                      {isCurrentVersion && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">
                          Mevcut
                        </span>
                      )}
                      {release.isPrerelease && (
                        <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                          Pre-release
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(release.publishedAt).toLocaleDateString('tr-TR')}
                      </span>
                      <a
                        href={release.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {release.description || 'Açıklama yok'}
                      </p>
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={release.author.avatarUrl}
                          alt={release.author.login}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {release.author.login}
                        </span>
                      </div>
                      {!isCurrentVersion && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeploy(release.tagName, 'manual')
                          }}
                          disabled={deploying}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                            deploying
                              ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          )}
                        >
                          {deploying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          Bu Sürüme Geç
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Deployment History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Deployment Geçmişi</span>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-sm">
              {history.length} kayıt
            </span>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        {showHistory && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Henüz deployment kaydı yok
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {history.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getDeploymentStatusBadge(item.status)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.type === 'auto' ? 'Otomatik' : 
                           item.type === 'manual' ? 'Manuel' : 'Rollback'}
                        </span>
                        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                          {item.fromVersion && `${item.fromVersion} → `}{item.toVersion}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {item.triggeredBy && (
                          <span>{item.triggeredBy}</span>
                        )}
                        <span>{new Date(item.startedAt).toLocaleString('tr-TR')}</span>
                        {item.duration && <span>({item.duration}s)</span>}
                      </div>
                    </div>
                    
                    {item.errorMessage && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {item.errorMessage}
                      </p>
                    )}
                    
                    {item.hasLogs && (
                      <button
                        onClick={() => {
                          if (expandedLog === item.id) {
                            setExpandedLog(null)
                          } else {
                            setExpandedLog(item.id)
                            if (!deploymentLogs[item.id]) {
                              fetchDeploymentLogs(item.id)
                            }
                          }
                        }}
                        className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {expandedLog === item.id ? 'Logları Gizle' : 'Logları Göster'}
                      </button>
                    )}
                    
                    {expandedLog === item.id && deploymentLogs[item.id] && (
                      <div className="mt-3 p-3 bg-gray-900 rounded-lg overflow-x-auto">
                        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                          {deploymentLogs[item.id].join('\n')}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Deploy Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Hızlı Deployment</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Tag veya commit hash girin (örn: v3.2.0)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            id="quick-deploy-input"
          />
          <button
            onClick={() => {
              const input = document.getElementById('quick-deploy-input') as HTMLInputElement
              if (input.value) {
                handleDeploy(input.value, 'manual')
              }
            }}
            disabled={deploying}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-lg transition-colors",
              deploying
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {deploying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Deploy
          </button>
        </div>
      </div>
    </div>
  )
}
