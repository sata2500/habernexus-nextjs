'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  /** Yükleme mesajı */
  message?: string
  /** Boyut: sm, md, lg */
  size?: 'sm' | 'md' | 'lg'
  /** Tam sayfa mı yoksa inline mı */
  fullPage?: boolean
  /** Ek CSS sınıfları */
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

const containerClasses = {
  sm: 'h-32',
  md: 'h-64',
  lg: 'min-h-[400px]',
}

/**
 * LoadingState - Yükleme durumu göstergesi
 * 
 * Admin panelinde tutarlı yükleme gösterimi için kullanılır.
 * 
 * @example
 * // Basit kullanım
 * <LoadingState />
 * 
 * @example
 * // Mesaj ile
 * <LoadingState message="Veriler yükleniyor..." />
 * 
 * @example
 * // Tam sayfa
 * <LoadingState fullPage size="lg" message="Sayfa hazırlanıyor..." />
 */
export function LoadingState({
  message,
  size = 'md',
  fullPage = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullPage ? 'min-h-screen' : containerClasses[size],
        className
      )}
    >
      <Loader2
        className={cn(
          'animate-spin text-blue-600 dark:text-blue-400',
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  )
}

/**
 * LoadingSpinner - Inline yükleme göstergesi
 * 
 * Butonlar veya küçük alanlar için kullanılır.
 */
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('h-4 w-4 animate-spin', className)}
    />
  )
}

/**
 * LoadingOverlay - Üzerine bindirilen yükleme göstergesi
 * 
 * Mevcut içerik üzerine yarı saydam overlay ile gösterilir.
 */
export function LoadingOverlay({
  message,
  className,
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50',
        className
      )}
    >
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        {message && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default LoadingState
