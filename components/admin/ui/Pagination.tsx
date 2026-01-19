'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  /** Mevcut sayfa (1'den başlar) */
  currentPage: number
  /** Toplam sayfa sayısı */
  totalPages: number
  /** Sayfa değişikliği callback'i */
  onPageChange: (page: number) => void
  /** Sayfa başına öğe sayısı */
  pageSize?: number
  /** Sayfa başına öğe sayısı değişikliği callback'i */
  onPageSizeChange?: (size: number) => void
  /** Toplam öğe sayısı */
  totalItems?: number
  /** Sayfa başına öğe seçenekleri */
  pageSizeOptions?: number[]
  /** Kompakt mod */
  compact?: boolean
  /** Ek CSS sınıfları */
  className?: string
}

/**
 * Pagination - Sayfalama bileşeni
 * 
 * Tablolar ve listeler için sayfalama kontrolü sağlar.
 * 
 * @example
 * <Pagination
 *   currentPage={page}
 *   totalPages={10}
 *   onPageChange={setPage}
 *   totalItems={100}
 *   pageSize={10}
 *   onPageSizeChange={setPageSize}
 * />
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  totalItems,
  pageSizeOptions = [10, 20, 50, 100],
  compact = false,
  className,
}: PaginationProps) {
  // Görünür sayfa numaralarını hesapla
  const getVisiblePages = () => {
    const delta = compact ? 1 : 2
    const range: (number | string)[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l) {
        if (typeof i === 'number' && i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (typeof i === 'number' && i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = typeof i === 'number' ? i : l
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  // Gösterilen öğe aralığı
  const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0

  if (totalPages <= 1 && !onPageSizeChange) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3',
        className
      )}
    >
      {/* Sol taraf - Bilgi ve sayfa boyutu */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        {totalItems !== undefined && (
          <span>
            {totalItems > 0 ? (
              <>
                <span className="font-medium text-gray-900 dark:text-white">{startItem}</span>
                {' - '}
                <span className="font-medium text-gray-900 dark:text-white">{endItem}</span>
                {' / '}
                <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span>
                {' öğe'}
              </>
            ) : (
              'Öğe bulunamadı'
            )}
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Sayfa başına:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sağ taraf - Sayfa navigasyonu */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* İlk sayfa */}
          {!compact && (
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="İlk sayfa"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}

          {/* Önceki sayfa */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Önceki sayfa"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Sayfa numaraları */}
          <div className="flex items-center gap-1">
            {visiblePages.map((page, index) => (
              <span key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={cn(
                      'min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-colors',
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {page}
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Sonraki sayfa */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Sonraki sayfa"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Son sayfa */}
          {!compact && (
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Son sayfa"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * usePagination - Pagination hook'u
 * 
 * Sayfalama state yönetimini kolaylaştırır.
 */
export function usePagination<T>(
  items: T[],
  initialPageSize = 10
) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Sayfa değiştiğinde geçerli aralıkta kal
  const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages))
  if (validPage !== currentPage) {
    setCurrentPage(validPage)
  }

  const paginatedItems = items.slice(
    (validPage - 1) * pageSize,
    validPage * pageSize
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Sayfa boyutu değişince ilk sayfaya dön
  }

  return {
    currentPage: validPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    setCurrentPage: handlePageChange,
    setPageSize: handlePageSizeChange,
  }
}

// useState import'u eklenmeli
import { useState } from 'react'

export default Pagination
