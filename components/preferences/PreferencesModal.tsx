'use client'

import { useState, useEffect } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

interface PreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function PreferencesModal({ isOpen, onClose, onSave }: PreferencesModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [excludedCategories, setExcludedCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch current preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPreferences()
    }
  }, [isOpen])

  const fetchPreferences = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/preferences')
      if (response.ok) {
        const data = await response.json()
        setSelectedCategories(data.favoriteCategories || [])
        setExcludedCategories(data.excludedCategories || [])
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryToggle = (categorySlug: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categorySlug)) {
        return prev.filter(c => c !== categorySlug)
      } else {
        // Remove from excluded if adding to favorites
        setExcludedCategories(ex => ex.filter(c => c !== categorySlug))
        return [...prev, categorySlug]
      }
    })
  }

  const handleExcludeToggle = (categorySlug: string) => {
    setExcludedCategories(prev => {
      if (prev.includes(categorySlug)) {
        return prev.filter(c => c !== categorySlug)
      } else {
        // Remove from favorites if excluding
        setSelectedCategories(sel => sel.filter(c => c !== categorySlug))
        return [...prev, categorySlug]
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favoriteCategories: selectedCategories,
          excludedCategories: excludedCategories,
        }),
      })

      if (response.ok) {
        onSave()
        onClose()
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Haber Tercihlerim
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Favorite Categories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  İlgi Alanlarım
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Seçtiğiniz kategorilerdeki haberler ana sayfada öncelikli olarak gösterilecek.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.map((category) => {
                    const isSelected = selectedCategories.includes(category.slug)
                    const isExcluded = excludedCategories.includes(category.slug)
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.slug)}
                        disabled={isExcluded}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : isExcluded
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          isSelected 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {category.name}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Excluded Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Görmek İstemediğim Kategoriler
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Bu kategorilerdeki haberler ana sayfanızda gösterilmeyecek.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => {
                    const isExcluded = excludedCategories.includes(category.slug)
                    const isFavorite = selectedCategories.includes(category.slug)
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleExcludeToggle(category.slug)}
                        disabled={isFavorite}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          isExcluded
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-2 border-red-300 dark:border-red-700'
                            : isFavorite
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {isExcluded ? `✕ ${category.name}` : category.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
