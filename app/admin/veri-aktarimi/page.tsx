'use client'

import { useState } from 'react'
import {
  Download,
  Upload,
  Key,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Shield,
  Clock,
  FileArchive,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'

interface ExportResult {
  success: boolean
  code?: string
  secretKey?: string
  expiresAt?: string
  fileName?: string
  metadata?: {
    tablesCount: number
    recordsCount: number
    createdAt: string
    source: string
  }
  error?: string
}

interface ImportResult {
  success: boolean
  tablesImported?: number
  recordsImported?: number
  message?: string
  error?: string
}

export default function DataTransferPage() {
  // Export state
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState<ExportResult | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Import state
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importCode, setImportCode] = useState('')
  const [importSecretKey, setImportSecretKey] = useState('')
  const [importData, setImportData] = useState('')
  const [clearExisting, setClearExisting] = useState(false)
  const [skipUsers, setSkipUsers] = useState(false)
  const [importMode, setImportMode] = useState<'code' | 'file'>('file')

  // Handle export
  const handleExport = async () => {
    setExporting(true)
    setExportResult(null)

    try {
      const response = await fetch('/api/admin/data-transfer/export', {
        method: 'POST',
      })

      const data = await response.json()
      setExportResult(data)
    } catch (error) {
      setExportResult({
        success: false,
        error: 'Veri aktarımı oluşturulamadı. Lütfen tekrar deneyin.',
      })
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

  // Handle download
  const handleDownload = async () => {
    if (!exportResult?.code || !exportResult?.secretKey) return

    setDownloading(true)

    try {
      const response = await fetch(
        `/api/admin/data-transfer/download/${exportResult.code}?key=${exportResult.secretKey}`
      )

      if (!response.ok) {
        throw new Error('İndirme başarısız')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = exportResult.fileName || 'habernexus-export.enc'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Dosya indirilemedi. Lütfen tekrar deneyin.')
    } finally {
      setDownloading(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: 'code' | 'key') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'code') {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedKey(true)
        setTimeout(() => setCopiedKey(false), 2000)
      }
    } catch (error) {
      console.error('Copy error:', error)
    }
  }

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  // Handle import
  const handleImport = async () => {
    if (importMode === 'file' && !importData) {
      alert('Lütfen bir dosya seçin')
      return
    }

    if (!importSecretKey) {
      alert('Lütfen şifreleme anahtarını girin')
      return
    }

    setImporting(true)
    setImportResult(null)

    try {
      const response = await fetch('/api/admin/data-transfer/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedData: importData,
          secretKey: importSecretKey,
          code: importMode === 'code' ? importCode : undefined,
          clearExisting,
          skipUsers,
        }),
      })

      const data = await response.json()
      setImportResult(data)

      if (data.success) {
        // Clear form on success
        setImportData('')
        setImportSecretKey('')
        setImportCode('')
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: 'Veri içe aktarılamadı. Lütfen tekrar deneyin.',
      })
      console.error('Import error:', error)
    } finally {
      setImporting(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Database className="w-7 h-7" />
          Veri Aktarımı
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Tüm verileri başka bir HaberNexus kurulumuna aktarın veya mevcut kuruluma veri içe aktarın.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Güvenli Veri Aktarımı</p>
            <p className="mt-1">
              Tüm veriler AES-256-GCM şifreleme ile korunur. Aktarım kodu ve şifreleme anahtarı
              24 saat geçerlidir. Bu bilgileri güvenli bir yerde saklayın.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Veri Dışa Aktar
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tüm verileri şifreli bir dosya olarak indirin
              </p>
            </div>
          </div>

          {!exportResult ? (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Aktarılacak Veriler
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Kullanıcılar ve hesap bilgileri</li>
                  <li>• Makaleler ve kategoriler</li>
                  <li>• RSS kaynakları ve ayarları</li>
                  <li>• Yorumlar ve etkileşimler</li>
                  <li>• Sistem ayarları ve promptlar</li>
                  <li>• Tüm diğer veritabanı kayıtları</li>
                </ul>
              </div>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Hazırlanıyor...
                  </>
                ) : (
                  <>
                    <FileArchive className="w-5 h-5" />
                    Aktarım Paketi Oluştur
                  </>
                )}
              </button>
            </div>
          ) : exportResult.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Aktarım paketi hazır!</span>
              </div>

              {/* Transfer Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aktarım Kodu
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={exportResult.code}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(exportResult.code!, 'code')}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    {copiedCode ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Şifreleme Anahtarı
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={exportResult.secretKey}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(exportResult.secretKey!, 'key')}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    {copiedKey ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  Bu anahtarı güvenli bir yerde saklayın. İçe aktarma için gereklidir.
                </p>
              </div>

              {/* Metadata */}
              {exportResult.metadata && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Tablolar:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {exportResult.metadata.tablesCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Kayıtlar:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {exportResult.metadata.recordsCount}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Expiration */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  Geçerlilik: {exportResult.expiresAt && formatDate(exportResult.expiresAt)}
                </span>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    İndiriliyor...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Dosyayı İndir
                  </>
                )}
              </button>

              {/* New Export Button */}
              <button
                onClick={() => setExportResult(null)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Yeni Aktarım Oluştur
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Hata oluştu</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{exportResult.error}</p>
              <button
                onClick={() => setExportResult(null)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Tekrar Dene
              </button>
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Veri İçe Aktar
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Başka bir kurulumdan veri aktarın
              </p>
            </div>
          </div>

          {importResult?.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">İçe aktarma başarılı!</span>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200">{importResult.message}</p>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>Tablolar: {importResult.tablesImported}</p>
                  <p>Kayıtlar: {importResult.recordsImported}</p>
                </div>
              </div>

              <button
                onClick={() => setImportResult(null)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Yeni İçe Aktarma
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Import Mode Toggle */}
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                <button
                  onClick={() => setImportMode('file')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    importMode === 'file'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Dosyadan
                </button>
                <button
                  onClick={() => setImportMode('code')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    importMode === 'code'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Koddan
                </button>
              </div>

              {importMode === 'file' ? (
                /* File Upload */
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aktarım Dosyası (.enc)
                  </label>
                  <input
                    type="file"
                    accept=".enc"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                  />
                  {importData && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Dosya yüklendi
                    </p>
                  )}
                </div>
              ) : (
                /* Code Input */
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Aktarım Kodu
                  </label>
                  <input
                    type="text"
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-mono"
                  />
                </div>
              )}

              {/* Secret Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Şifreleme Anahtarı
                </label>
                <input
                  type="text"
                  value={importSecretKey}
                  onChange={(e) => setImportSecretKey(e.target.value)}
                  placeholder="Dışa aktarma sırasında verilen anahtar"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm font-mono"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clearExisting}
                    onChange={(e) => setClearExisting(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Mevcut verileri temizle
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipUsers}
                    onChange={(e) => setSkipUsers(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Kullanıcıları atla (sadece içerik aktar)
                  </span>
                </label>
              </div>

              {/* Warning */}
              {clearExisting && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Mevcut tüm veriler silinecek ve yerine aktarılan veriler gelecek!
                  </p>
                </div>
              )}

              {/* Error Message */}
              {importResult?.error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{importResult.error}</span>
                </div>
              )}

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={importing || (!importData && importMode === 'file') || !importSecretKey}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    İçe Aktarılıyor...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Verileri İçe Aktar
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Nasıl Çalışır?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-green-600 dark:text-green-400">1</span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Dışa Aktar</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Eski sunucunuzda &quot;Aktarım Paketi Oluştur&quot; butonuna tıklayın ve kodu/anahtarı kaydedin.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">2</span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Dosyayı İndir</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Şifreli aktarım dosyasını indirin ve yeni sunucuya aktarın.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">3</span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">İçe Aktar</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Yeni sunucuda dosyayı yükleyin, şifreleme anahtarını girin ve aktarın.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
