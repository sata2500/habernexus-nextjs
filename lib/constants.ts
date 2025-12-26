export const CATEGORIES = [
  { id: 'gundem', name: 'Gündem', slug: 'gundem', icon: 'Newspaper' },
  { id: 'ekonomi', name: 'Ekonomi', slug: 'ekonomi', icon: 'TrendingUp' },
  { id: 'teknoloji', name: 'Teknoloji', slug: 'teknoloji', icon: 'Cpu' },
  { id: 'spor', name: 'Spor', slug: 'spor', icon: 'Trophy' },
  { id: 'saglik', name: 'Sağlık', slug: 'saglik', icon: 'Heart' },
  { id: 'kultur-sanat', name: 'Kültür & Sanat', slug: 'kultur-sanat', icon: 'Palette' },
  { id: 'bilim', name: 'Bilim', slug: 'bilim', icon: 'FlaskConical' },
  { id: 'dunya', name: 'Dünya', slug: 'dunya', icon: 'Globe' },
] as const

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
