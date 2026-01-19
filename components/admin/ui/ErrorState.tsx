'use client'

import { AlertCircle, RefreshCw, XCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ErrorSeverity = 'error' | 'warning' | 'info'

interface ErrorStateProps {
  /** Hata başlığı */
  title?: string
  /** Hata mesajı */
  message: string
  /** Hata şiddeti */
  severity?: ErrorSeverity
  /** Yeniden deneme fonksiyonu */
  onRetry?: () => void
  /** Yeniden deneme butonu metni */
  retryText?: string
  /** Tam sayfa mı yoksa inline mı */
  fullPage?: boolean
  /** Ek CSS sınıfları */
  className?: string
}

const severityConfig = {
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
    buttonColor: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
}

/**
 * ErrorState - Hata durumu göstergesi
 * 
 * Admin panelinde tutarlı hata gösterimi için kullanılır.
 * 
 * @example
 * // Basit kullanım
 * <ErrorState message="Veriler yüklenemedi" />
 * 
 * @example
 * // Yeniden deneme ile
 * <ErrorState 
 *   title="Bağlantı Hatası"
 *   message="Sunucuya bağlanılamadı" 
 *   onRetry={() => fetchData()}
 * />
 * 
 * @example
 * // Uyarı olarak
 * <ErrorState 
 *   severity="warning"
 *   message="Bazı veriler eksik olabilir" 
 * />
 */
export function ErrorState({
  title,
  message,
  severity = 'error',
  onRetry,
  retryText = 'Tekrar Dene',
  fullPage = false,
  className,
}: ErrorStateProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  if (fullPage) {
    return (
      <div className={cn('min-h-screen flex items-center justify-center p-4', className)}>
        <div className="text-center max-w-md">
          <div className={cn('mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4', config.bgColor)}>
            <Icon className={cn('w-8 h-8', config.iconColor)} />
          </div>
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
          )}
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                'inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors',
                config.buttonColor
              )}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryText}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4 flex items-start gap-3',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={cn('font-medium mb-1', config.textColor)}>
            {title}
          </h3>
        )}
        <p className={config.textColor}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              'mt-3 inline-flex items-center px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
              config.buttonColor
            )}
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            {retryText}
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * ErrorBanner - Sayfa üstü hata banner'ı
 * 
 * Sayfanın üstünde gösterilen uyarı banner'ı.
 */
export function ErrorBanner({
  message,
  severity = 'error',
  onDismiss,
  className,
}: {
  message: string
  severity?: ErrorSeverity
  onDismiss?: () => void
  className?: string
}) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 rounded-lg',
        config.bgColor,
        config.borderColor,
        'border',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', config.iconColor)} />
        <span className={cn('text-sm', config.textColor)}>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn('p-1 rounded hover:bg-black/5 dark:hover:bg-white/5', config.iconColor)}
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default ErrorState
