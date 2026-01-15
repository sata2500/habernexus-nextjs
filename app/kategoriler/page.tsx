import { Metadata } from 'next'
import Link from 'next/link'
import { Newspaper, TrendingUp, Cpu, Trophy, Heart, Palette, FlaskConical, Globe, ChevronRight, ArrowRight } from 'lucide-react'
import { CATEGORIES, SITE_CONFIG } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Kategoriler | HaberNexus',
  description: 'HaberNexus haber kategorileri - Gündem, Ekonomi, Teknoloji, Spor ve daha fazlası.',
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Newspaper,
  TrendingUp,
  Cpu,
  Trophy,
  Heart,
  Palette,
  FlaskConical,
  Globe,
}

const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
  gundem: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  ekonomi: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  teknoloji: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  spor: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  saglik: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  'kultur-sanat': { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
  bilim: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  dunya: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
}

async function getCategoryStats() {
  const stats = await prisma.article.groupBy({
    by: ['category'],
    _count: {
      id: true,
    },
  })

  return stats.reduce((acc, stat) => {
    acc[stat.category.toLowerCase()] = stat._count.id
    return acc
  }, {} as Record<string, number>)
}

export default async function CategoriesPage() {
  const categoryStats = await getCategoryStats()

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Kategoriler
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            İlgi alanlarınıza göre haberleri keşfedin. {SITE_CONFIG.name} size gündem, ekonomi, 
            teknoloji ve daha birçok kategoride en güncel haberleri sunar.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => {
            const Icon = iconMap[category.icon] || Newspaper
            const colors = colorMap[category.slug] || colorMap.gundem
            const articleCount = categoryStats[category.slug] || categoryStats[category.name] || 0

            return (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className={`group relative overflow-hidden rounded-2xl p-6 border ${colors.border} ${colors.bg} hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors.text} bg-white dark:bg-gray-800 shadow-sm`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <ArrowRight className={`w-5 h-5 ${colors.text} opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all`} />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h2>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {getCategoryDescription(category.slug)}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                  <Newspaper className="w-4 h-4 mr-1" />
                  <span>{articleCount} haber</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Browse All */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Tüm Haberleri Keşfedin
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Kategorilere göre filtreleme yapmadan tüm haberlere göz atın veya arama yaparak 
            ilgilendiğiniz konuları bulun.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/haberler"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Newspaper className="w-5 h-5 mr-2" />
              Tüm Haberler
            </Link>
            <Link
              href="/arama"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Haber Ara
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function getCategoryDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    gundem: 'Türkiye ve dünyadan en önemli gelişmeler',
    ekonomi: 'Piyasalar, finans ve iş dünyası haberleri',
    teknoloji: 'Dijital dünya ve teknoloji yenilikleri',
    spor: 'Futbol, basketbol ve tüm spor dalları',
    saglik: 'Sağlık, tıp ve yaşam kalitesi haberleri',
    'kultur-sanat': 'Sanat, müzik, sinema ve kültür dünyası',
    bilim: 'Bilimsel keşifler ve araştırmalar',
    dunya: 'Uluslararası haberler ve dünya gündemi',
  }
  return descriptions[slug] || 'En güncel haberler'
}
