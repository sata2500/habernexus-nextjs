'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Çevrimdışısınız
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          İnternet bağlantınız yok gibi görünüyor. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.
        </p>
        
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Tekrar Dene
        </button>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>İpucu:</strong> HaberNexus&apos;u ana ekranınıza ekleyerek çevrimdışıyken de daha önce okuduğunuz haberlere erişebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  )
}
