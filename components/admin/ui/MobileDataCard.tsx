'use client'

import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * MobileDataCard - Mobil cihazlar için kart görünümü
 * 
 * Tablolar mobilde okunması zor olduğundan, bu bileşen
 * verileri kart formatında gösterir.
 */

interface MobileDataCardProps<T> {
  item: T
  title: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  details?: { label: string; value: ReactNode }[]
  actions?: ReactNode
  onClick?: () => void
  selected?: boolean
  onSelect?: (selected: boolean) => void
}

export function MobileDataCard<T>({
  title,
  subtitle,
  badge,
  details,
  actions,
  onClick,
  selected,
  onSelect,
}: MobileDataCardProps<T>) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border p-4 transition-all',
        onClick && 'cursor-pointer hover:shadow-md',
        selected
          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
          : 'border-gray-200 dark:border-gray-700'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation()
              onSelect(e.target.checked)
            }}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-medium text-gray-900 dark:text-white truncate">
                {title}
              </div>
              {subtitle && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>

          {/* Details */}
          {details && details.length > 0 && (
            <div className="mt-3 space-y-2">
              {details.map((detail, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{detail.label}</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Arrow indicator for clickable cards */}
        {onClick && !actions && (
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </div>
    </div>
  )
}

/**
 * MobileDataList - Mobil veri listesi container
 */
interface MobileDataListProps {
  children: ReactNode
  className?: string
}

export function MobileDataList({ children, className }: MobileDataListProps) {
  return <div className={cn('space-y-3', className)}>{children}</div>
}

/**
 * ResponsiveDataView - Masaüstü tablo, mobil kart görünümü
 * 
 * Ekran boyutuna göre otomatik olarak tablo veya kart görünümüne geçer.
 */
interface ResponsiveDataViewProps {
  desktopView: ReactNode
  mobileView: ReactNode
  breakpoint?: 'sm' | 'md' | 'lg'
}

export function ResponsiveDataView({
  desktopView,
  mobileView,
  breakpoint = 'md',
}: ResponsiveDataViewProps) {
  const breakpointClasses = {
    sm: { desktop: 'hidden sm:block', mobile: 'sm:hidden' },
    md: { desktop: 'hidden md:block', mobile: 'md:hidden' },
    lg: { desktop: 'hidden lg:block', mobile: 'lg:hidden' },
  }

  return (
    <>
      <div className={breakpointClasses[breakpoint].desktop}>{desktopView}</div>
      <div className={breakpointClasses[breakpoint].mobile}>{mobileView}</div>
    </>
  )
}

export default MobileDataCard
