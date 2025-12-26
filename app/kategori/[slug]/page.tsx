import { notFound } from 'next/navigation'
import { CATEGORIES } from '@/lib/constants'
import ArticleCard from '@/components/articles/ArticleCard'
import { Newspaper, TrendingUp, Cpu, Trophy, Heart, Palette, FlaskConical, Globe } from 'lucide-react'

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

// Demo veriler - gerçek uygulamada veritabanından gelecek
const demoArticles = [
  {
    id: '1',
    title: 'Yapay Zeka Teknolojisinde Yeni Bir Dönem: 2025 Yılının En Büyük Gelişmeleri',
    slug: 'yapay-zeka-teknolojisinde-yeni-bir-donem-2025',
    excerpt: 'Yapay zeka alanında yaşanan son gelişmeler, teknoloji dünyasını derinden etkiliyor.',
    content: 'Yapay zeka teknolojisi, son yıllarda inanılmaz bir hızla gelişmeye devam ediyor.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
    category: 'Teknoloji',
    viewCount: 15420,
    publishedAt: new Date('2025-12-26'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '2',
    title: 'Yeni Nesil Akıllı Telefonlar: 2025\'in En İyi Modelleri',
    slug: 'yeni-nesil-akilli-telefonlar-2025',
    excerpt: '2025 yılının en çok beklenen akıllı telefon modelleri ve özellikleri.',
    content: 'Akıllı telefon pazarı, her yıl olduğu gibi 2025\'te de heyecan verici yeniliklerle dolu.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60',
    category: 'Teknoloji',
    viewCount: 8750,
    publishedAt: new Date('2025-12-25'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '3',
    title: 'Siber Güvenlik Trendleri: Şirketler Nasıl Korunmalı?',
    slug: 'siber-guvenlik-trendleri-2025',
    excerpt: 'Artan siber tehditler karşısında şirketlerin alması gereken önlemler.',
    content: 'Siber güvenlik, dijital çağda her zamankinden daha kritik bir öneme sahip.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60',
    category: 'Teknoloji',
    viewCount: 6320,
    publishedAt: new Date('2025-12-24'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '4',
    title: 'Elektrikli Araç Pazarı Büyümeye Devam Ediyor',
    slug: 'elektrikli-arac-pazari-buyuyor',
    excerpt: 'Elektrikli araç satışları rekor seviyelere ulaştı.',
    content: 'Elektrikli araç pazarı, çevre bilincinin artmasıyla birlikte hızla büyüyor.',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop&q=60',
    category: 'Teknoloji',
    viewCount: 5890,
    publishedAt: new Date('2025-12-23'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '5',
    title: 'Metaverse Teknolojisinde Son Gelişmeler',
    slug: 'metaverse-teknolojisinde-son-gelismeler',
    excerpt: 'Sanal gerçeklik ve metaverse dünyasında neler oluyor?',
    content: 'Metaverse kavramı, teknoloji dünyasının en çok tartışılan konularından biri olmaya devam ediyor.',
    imageUrl: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&auto=format&fit=crop&q=60',
    category: 'Teknoloji',
    viewCount: 4560,
    publishedAt: new Date('2025-12-22'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '6',
    title: 'Blockchain Teknolojisi ve Finans Sektörü',
    slug: 'blockchain-teknolojisi-finans-sektoru',
    excerpt: 'Blockchain teknolojisi finans sektörünü nasıl dönüştürüyor?',
    content: 'Blockchain teknolojisi, finans sektöründe devrim niteliğinde değişikliklere yol açıyor.',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60',
    category: 'Teknoloji',
    viewCount: 3980,
    publishedAt: new Date('2025-12-21'),
    author: { name: 'HaberNexus AI', image: null }
  },
]

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = CATEGORIES.find((c) => c.slug === params.slug)

  if (!category) {
    notFound()
  }

  const Icon = iconMap[category.icon] || Newspaper

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <header className="mb-12">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
              <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {category.name} kategorisindeki en güncel haberler
              </p>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sırala:</span>
            <select className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="newest">En Yeni</option>
              <option value="popular">En Popüler</option>
              <option value="oldest">En Eski</option>
            </select>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {demoArticles.length} haber bulundu
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-12 space-x-2">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" disabled>
            Önceki
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">2</button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">3</button>
          <span className="px-2 text-gray-400">...</span>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">10</button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            Sonraki
          </button>
        </div>
      </div>
    </div>
  )
}
