'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from './LoadingState'

type DialogVariant = 'danger' | 'warning' | 'success' | 'info'

interface ConfirmDialogProps {
  /** Dialog açık mı */
  isOpen: boolean
  /** Kapatma fonksiyonu */
  onClose: () => void
  /** Onay fonksiyonu */
  onConfirm: () => void | Promise<void>
  /** Başlık */
  title: string
  /** Açıklama */
  description?: string
  /** Onay butonu metni */
  confirmText?: string
  /** İptal butonu metni */
  cancelText?: string
  /** Dialog varyantı */
  variant?: DialogVariant
  /** Yükleme durumu */
  isLoading?: boolean
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
}

/**
 * ConfirmDialog - Onay dialogu
 * 
 * Silme, güncelleme gibi kritik işlemler için kullanıcı onayı alır.
 * Native confirm() yerine kullanılır.
 * 
 * @example
 * const [showDialog, setShowDialog] = useState(false)
 * 
 * <ConfirmDialog
 *   isOpen={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   onConfirm={handleDelete}
 *   title="Makaleyi Sil"
 *   description="Bu makale kalıcı olarak silinecek. Bu işlem geri alınamaz."
 *   variant="danger"
 *   confirmText="Sil"
 * />
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const config = variantConfig[variant]
  const Icon = config.icon

  const loading = isLoading || internalLoading

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, loading, onClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleConfirm = useCallback(async () => {
    try {
      setInternalLoading(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Confirm action failed:', error)
    } finally {
      setInternalLoading(false)
    }
  }, [onConfirm, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <div className={cn('mx-auto w-12 h-12 rounded-full flex items-center justify-center', config.iconBg)}>
              <Icon className={cn('w-6 h-6', config.iconColor)} />
            </div>

            {/* Content */}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {description && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center',
                  config.confirmButton
                )}
              >
                {loading ? (
                  <LoadingSpinner className="text-white" />
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * useConfirmDialog - Confirm dialog hook'u
 * 
 * Dialog state yönetimini kolaylaştırır.
 * 
 * @example
 * const { dialog, confirm, DialogComponent } = useConfirmDialog()
 * 
 * const handleDelete = () => {
 *   confirm({
 *     title: 'Silmek istediğinize emin misiniz?',
 *     onConfirm: async () => {
 *       await deleteItem(id)
 *     }
 *   })
 * }
 * 
 * return (
 *   <>
 *     <button onClick={handleDelete}>Sil</button>
 *     <DialogComponent />
 *   </>
 * )
 */
export function useConfirmDialog() {
  const [dialog, setDialog] = useState<Omit<ConfirmDialogProps, 'isOpen' | 'onClose'> | null>(null)

  const confirm = useCallback((options: Omit<ConfirmDialogProps, 'isOpen' | 'onClose'>) => {
    setDialog(options)
  }, [])

  const close = useCallback(() => {
    setDialog(null)
  }, [])

  const DialogComponent = useCallback(() => {
    if (!dialog) return null
    return (
      <ConfirmDialog
        isOpen={true}
        onClose={close}
        {...dialog}
      />
    )
  }, [dialog, close])

  return { dialog, confirm, close, DialogComponent }
}

export default ConfirmDialog
