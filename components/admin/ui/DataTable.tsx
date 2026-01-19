'use client'

import { useState, useMemo, useCallback } from 'react'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Search,
  X,
  Download,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingState } from './LoadingState'
import { EmptyState, SearchEmptyState } from './EmptyState'
import { Pagination } from './Pagination'

// Sütun tanımı
export interface Column<T> {
  /** Sütun anahtarı */
  key: string
  /** Sütun başlığı */
  header: string
  /** Sütun genişliği */
  width?: string
  /** Sıralanabilir mi */
  sortable?: boolean
  /** Hücre render fonksiyonu */
  render?: (item: T, index: number) => React.ReactNode
  /** Hücre CSS sınıfı */
  className?: string
  /** Başlık CSS sınıfı */
  headerClassName?: string
  /** Gizli mi (varsayılan: false) */
  hidden?: boolean
  /** Değer erişim fonksiyonu (sıralama ve arama için) */
  getValue?: (item: T) => unknown
}

// Sıralama durumu
export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

interface DataTableProps<T> {
  /** Veri dizisi */
  data: T[]
  /** Sütun tanımları */
  columns: Column<T>[]
  /** Yükleniyor mu */
  isLoading?: boolean
  /** Hata mesajı */
  error?: string | null
  /** Satır anahtarı fonksiyonu */
  getRowKey: (item: T) => string
  /** Arama yapılabilir mi */
  searchable?: boolean
  /** Arama placeholder'ı */
  searchPlaceholder?: string
  /** Arama fonksiyonu */
  onSearch?: (term: string) => void
  /** Harici arama terimi */
  searchTerm?: string
  /** Sayfalama aktif mi */
  paginated?: boolean
  /** Sayfa başına öğe sayısı */
  pageSize?: number
  /** Seçilebilir mi */
  selectable?: boolean
  /** Seçili öğeler */
  selectedItems?: string[]
  /** Seçim değişikliği callback'i */
  onSelectionChange?: (selectedIds: string[]) => void
  /** Satır tıklama callback'i */
  onRowClick?: (item: T) => void
  /** Boş durum başlığı */
  emptyTitle?: string
  /** Boş durum açıklaması */
  emptyDescription?: string
  /** CSV export aktif mi */
  exportable?: boolean
  /** Export dosya adı */
  exportFileName?: string
  /** Ek CSS sınıfları */
  className?: string
  /** Tablo CSS sınıfları */
  tableClassName?: string
}

// Değer erişim yardımcı fonksiyonu
function getItemValue<T>(item: T, key: string, getValue?: (item: T) => unknown): unknown {
  if (getValue) {
    return getValue(item)
  }
  // Tip güvenli erişim
  if (typeof item === 'object' && item !== null && key in item) {
    return (item as Record<string, unknown>)[key]
  }
  return undefined
}

/**
 * DataTable - Gelişmiş veri tablosu bileşeni
 * 
 * Sıralama, arama, sayfalama, seçim ve export özellikleri içerir.
 */
export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  error = null,
  getRowKey,
  searchable = false,
  searchPlaceholder = 'Ara...',
  onSearch,
  searchTerm: externalSearchTerm,
  paginated = false,
  pageSize: initialPageSize = 10,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  onRowClick,
  emptyTitle = 'Veri bulunamadı',
  emptyDescription,
  exportable = false,
  exportFileName = 'export',
  className,
  tableClassName,
}: DataTableProps<T>) {
  // State
  const [internalSearchTerm, setInternalSearchTerm] = useState('')
  const [sortState, setSortState] = useState<SortState | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const searchTerm = externalSearchTerm ?? internalSearchTerm

  // Görünür sütunlar
  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.hidden),
    [columns]
  )

  // Filtrelenmiş ve sıralanmış veri
  const processedData = useMemo(() => {
    let result = [...data]

    // Arama filtresi (harici onSearch yoksa)
    if (searchTerm && !onSearch) {
      const term = searchTerm.toLowerCase()
      result = result.filter((item) =>
        visibleColumns.some((col) => {
          const value = getItemValue(item, col.key, col.getValue)
          return value?.toString().toLowerCase().includes(term)
        })
      )
    }

    // Sıralama
    if (sortState) {
      const sortColumn = columns.find((col) => col.key === sortState.key)
      result.sort((a, b) => {
        const aVal = getItemValue(a, sortState.key, sortColumn?.getValue)
        const bVal = getItemValue(b, sortState.key, sortColumn?.getValue)
        
        if (aVal === bVal) return 0
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1

        const comparison = aVal < bVal ? -1 : 1
        return sortState.direction === 'asc' ? comparison : -comparison
      })
    }

    return result
  }, [data, searchTerm, sortState, visibleColumns, columns, onSearch])

  // Sayfalanmış veri
  const paginatedData = useMemo(() => {
    if (!paginated) return processedData
    const start = (currentPage - 1) * pageSize
    return processedData.slice(start, start + pageSize)
  }, [processedData, paginated, currentPage, pageSize])

  const totalPages = Math.ceil(processedData.length / pageSize)

  // Sıralama değiştir
  const handleSort = useCallback((key: string) => {
    setSortState((prev) => {
      if (prev?.key !== key) {
        return { key, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return null
    })
  }, [])

  // Arama değiştir
  const handleSearchChange = useCallback((value: string) => {
    setInternalSearchTerm(value)
    onSearch?.(value)
    setCurrentPage(1)
  }, [onSearch])

  // Seçim değiştir
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return
    const allIds = paginatedData.map(getRowKey)
    const allSelected = allIds.every((id) => selectedItems.includes(id))
    
    if (allSelected) {
      onSelectionChange(selectedItems.filter((id) => !allIds.includes(id)))
    } else {
      onSelectionChange([...new Set([...selectedItems, ...allIds])])
    }
  }, [paginatedData, selectedItems, onSelectionChange, getRowKey])

  const handleSelectRow = useCallback((id: string) => {
    if (!onSelectionChange) return
    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter((i) => i !== id))
    } else {
      onSelectionChange([...selectedItems, id])
    }
  }, [selectedItems, onSelectionChange])

  // CSV Export
  const handleExport = useCallback(() => {
    const headers = visibleColumns.map((col) => col.header).join(',')
    const rows = processedData.map((item) =>
      visibleColumns.map((col) => {
        const value = getItemValue(item, col.key, col.getValue)
        const str = value?.toString() ?? ''
        // CSV escape
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    ).join('\n')

    const csv = `${headers}\n${rows}`
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${exportFileName}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [visibleColumns, processedData, exportFileName])

  // Tüm sayfadaki öğeler seçili mi
  const allSelected = paginatedData.length > 0 && 
    paginatedData.every((item) => selectedItems.includes(getRowKey(item)))
  const someSelected = paginatedData.some((item) => selectedItems.includes(getRowKey(item)))

  // Yükleniyor
  if (isLoading) {
    return <LoadingState message="Veriler yükleniyor..." />
  }

  // Hata
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      {(searchable || exportable || selectedItems.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Sol: Arama */}
          {searchable && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Sağ: Seçim bilgisi ve export */}
          <div className="flex items-center gap-3">
            {selectable && selectedItems.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedItems.length} öğe seçildi
              </span>
            )}
            {exportable && (
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV İndir
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tablo */}
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden', tableClassName)}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                {/* Seçim checkbox'ı */}
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <button
                      onClick={handleSelectAll}
                      className={cn(
                        'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                        allSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : someSelected
                          ? 'bg-blue-100 border-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                      )}
                    >
                      {allSelected && <Check className="w-3 h-3" />}
                      {someSelected && !allSelected && <div className="w-2 h-0.5 bg-blue-600" />}
                    </button>
                  </th>
                )}

                {/* Sütun başlıkları */}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider',
                      col.headerClassName
                    )}
                    style={{ width: col.width }}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {col.header}
                        {sortState?.key === col.key ? (
                          sortState.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const rowKey = getRowKey(item)
                  const isSelected = selectedItems.includes(rowKey)

                  return (
                    <tr
                      key={rowKey}
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        'transition-colors',
                        onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50',
                        isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                    >
                      {/* Seçim checkbox'ı */}
                      {selectable && (
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectRow(rowKey)
                            }}
                            className={cn(
                              'w-5 h-5 rounded border flex items-center justify-center transition-colors',
                              isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        </td>
                      )}

                      {/* Hücreler */}
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-3 text-sm text-gray-900 dark:text-white',
                            col.className
                          )}
                        >
                          {col.render
                            ? col.render(item, index)
                            : String(getItemValue(item, col.key, col.getValue) ?? '')}
                        </td>
                      ))}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                    className="px-4 py-12"
                  >
                    {searchTerm ? (
                      <SearchEmptyState
                        searchTerm={searchTerm}
                        onClear={() => handleSearchChange('')}
                      />
                    ) : (
                      <EmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                      />
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfalama */}
      {paginated && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          totalItems={processedData.length}
        />
      )}
    </div>
  )
}

export default DataTable
