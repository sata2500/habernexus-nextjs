'use client'

import { LucideIcon, Inbox, FileText, Users, Rss, MessageCircle, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** Başlık */
  title?: string
  /** Açıklama */
  description?: string
  /** İkon */
  icon?: LucideIcon
  /** Aksiyon butonu metni */
  actionLabel?: string
  /** Aksiyon butonu fonksiyonu */
  onAction?: () => void
  /** Ek CSS sınıfları */
  className?: string
}

/**
 * EmptyState - Boş durum göstergesi
 * 
 * Veri olmadığında veya arama sonucu bulunamadığında gösterilir.
 * 
 * @example
 * // Basit kullanım
 * <EmptyState title="Henüz makale yok" />
 * 
 * @example
 * // Aksiyon ile
 * <EmptyState 
 *   icon={FileText}
 *   title="Henüz makale yok"
 *   description="İlk makalenizi oluşturarak başlayın"
 *   actionLabel="Makale Oluştur"
 *   onAction={() => router.push('/admin/makaleler/yeni')}
 * />
 */
export function EmptyState({
  title = 'Veri bulunamadı',
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/**
 * SearchEmptyState - Arama sonucu boş durumu
 */
export function SearchEmptyState({
  searchTerm,
  onClear,
  className,
}: {
  searchTerm: string
  onClear?: () => void
  className?: string
}) {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        Sonuç bulunamadı
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
        &quot;{searchTerm}&quot; için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Aramayı Temizle
        </button>
      )}
    </div>
  )
}

// Önceden tanımlanmış boş durumlar
export const emptyStatePresets = {
  articles: {
    icon: FileText,
    title: 'Henüz makale yok',
    description: 'AI motorunu çalıştırarak veya manuel olarak içerik oluşturun.',
  },
  users: {
    icon: Users,
    title: 'Henüz kullanıcı yok',
    description: 'Kullanıcılar sisteme kayıt oldukça burada görünecekler.',
  },
  rss: {
    icon: Rss,
    title: 'Henüz RSS kaynağı yok',
    description: 'Haber kaynaklarını ekleyerek içerik toplamaya başlayın.',
  },
  comments: {
    icon: MessageCircle,
    title: 'Henüz yorum yok',
    description: 'Kullanıcılar yorum yaptıkça burada görünecekler.',
  },
}

export default EmptyState
