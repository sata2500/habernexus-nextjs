'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye, Bookmark } from 'lucide-react'
import { formatDateShort, getReadingTime, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ArticleCardProps {
  article: {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    content: string
    imageUrl: string
    category: string
    viewCount: number
    publishedAt: Date | string
    author: {
      name: string | null
      image: string | null
    }
  }
  variant?: 'default' | 'featured' | 'compact'
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const readingTime = getReadingTime(article.content)

  if (variant === 'featured') {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-gray-900">
        <Link href={`/haber/${article.slug}`} className="block">
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full mb-4">
              {article.category}
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-gray-300 text-sm md:text-base mb-4 line-clamp-2 hidden md:block">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {readingTime} dk okuma
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {article.viewCount.toLocaleString('tr-TR')}
              </span>
              <span>{formatDateShort(article.publishedAt)}</span>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  if (variant === 'compact') {
    return (
      <article className="group flex space-x-4">
        <Link href={`/haber/${article.slug}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-blue-600">{article.category}</span>
          <Link href={`/haber/${article.slug}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors mt-1">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
            <span>{formatDateShort(article.publishedAt)}</span>
            <span className="flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              {article.viewCount.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
      <Link href={`/haber/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600/90 backdrop-blur-sm rounded-full">
              {article.category}
            </span>
          </div>
          <button
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:text-blue-600 hover:bg-white transition-colors"
            onClick={(e) => {
              e.preventDefault()
              // Bookmark functionality
            }}
            aria-label="Kaydet"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/haber/${article.slug}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            {truncate(article.excerpt, 120)}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {article.author.image ? (
              <Image
                src={article.author.image}
                alt={article.author.name || 'Yazar'}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full" />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {article.author.name || 'HaberNexus'}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {readingTime} dk
            </span>
            <span>{formatDateShort(article.publishedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
