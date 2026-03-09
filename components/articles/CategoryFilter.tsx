'use client'

import { useTransition } from 'react'
import { Filter } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

interface CategoryFilterProps {
  currentCategory?: string
}

export default function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  const [isPending, startTransition] = useTransition()

  const handleCategoryChange = (value: string) => {
    startTransition(() => {
      if (value) {
        window.location.href = `/haberler?category=${encodeURIComponent(value)}`
      } else {
        window.location.href = '/haberler'
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Filter className="w-5 h-5 text-gray-500" />
      <select
        defaultValue={currentCategory || ''}
        onChange={(e) => handleCategoryChange(e.target.value)}
        disabled={isPending}
        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Tüm Kategoriler</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  )
}
