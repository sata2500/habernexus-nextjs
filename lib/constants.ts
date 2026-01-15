export const CATEGORIES = [
  { id: 'gundem', name: 'Gündem', slug: 'gundem', icon: 'Newspaper' },
  { id: 'ekonomi', name: 'Ekonomi', slug: 'ekonomi', icon: 'TrendingUp' },
  { id: 'teknoloji', name: 'Teknoloji', slug: 'teknoloji', icon: 'Cpu' },
  { id: 'spor', name: 'Spor', slug: 'spor', icon: 'Trophy' },
  { id: 'saglik', name: 'Sağlık', slug: 'saglik', icon: 'Heart' },
  { id: 'kultur-sanat', name: 'Kültür-Sanat', slug: 'kultur-sanat', icon: 'Palette' },
  { id: 'bilim', name: 'Bilim', slug: 'bilim', icon: 'FlaskConical' },
  { id: 'dunya', name: 'Dünya', slug: 'dunya', icon: 'Globe' },
] as const

// Kategori isimlerinin listesi (admin paneli için)
export const CATEGORY_NAMES = CATEGORIES.map(cat => cat.name)

// Kategori renkleri (admin paneli tablo görünümleri için)
export const CATEGORY_COLORS: Record<string, string> = {
  'Teknoloji': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Ekonomi': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Spor': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Sağlık': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Bilim': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Dünya': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Gündem': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Kültür-Sanat': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

export const SITE_CONFIG = {
  name: 'HaberNexus',
  description: 'AI Destekli Haber Platformu',
  url: 'https://habernexus.com',
  author: 'Salih TANRISEVEN',
  email: 'salihtanriseven25@gmail.com',
  social: {
    twitter: '@habernexus',
    github: 'https://github.com/sata2500/habernexus-nextjs',
  },
} as const

export const NAV_ITEMS = [
  { name: 'Ana Sayfa', href: '/' },
  { name: 'Gündem', href: '/kategori/gundem' },
  { name: 'Ekonomi', href: '/kategori/ekonomi' },
  { name: 'Teknoloji', href: '/kategori/teknoloji' },
  { name: 'Spor', href: '/kategori/spor' },
  { name: 'Dünya', href: '/kategori/dunya' },
] as const
