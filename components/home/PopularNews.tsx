import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Eye, Clock } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

// Demo veriler - gerçek uygulamada veritabanından gelecek
const popularArticles = [
  {
    id: '1',
    rank: 1,
    title: 'Yapay Zeka Teknolojisinde Yeni Bir Dönem: 2025 Yılının En Büyük Gelişmeleri',
    slug: 'yapay-zeka-teknolojisinde-yeni-bir-donem-2025',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&auto=format&fit=crop&q=60',
    category: 'Teknoloji',
    viewCount: 15420,
    publishedAt: new Date('2025-12-26'),
  },
  {
    id: '2',
    rank: 2,
    title: 'Ekonomide Son Durum: Merkez Bankası Faiz Kararını Açıkladı',
    slug: 'ekonomide-son-durum-merkez-bankasi-faiz-karari',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=60',
    category: 'Ekonomi',
    viewCount: 12350,
    publishedAt: new Date('2025-12-25'),
  },
  {
    id: '3',
    rank: 3,
    title: 'Bilim Dünyasından Heyecan Verici Keşif: Mars\'ta Su İzleri Bulundu',
    slug: 'bilim-dunyasindan-heyecan-verici-kesif-marsta-su-izleri',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&auto=format&fit=crop&q=60',
    category: 'Bilim',
    viewCount: 11200,
    publishedAt: new Date('2025-12-24'),
  },
  {
    id: '4',
    rank: 4,
    title: 'Dünya Liderleri İklim Zirvesi\'nde Buluştu: Tarihi Anlaşma İmzalandı',
    slug: 'dunya-liderleri-iklim-zirvesinde-bulustu-tarihi-anlasma',
    imageUrl: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=400&auto=format&fit=crop&q=60',
    category: 'Dünya',
    viewCount: 9450,
    publishedAt: new Date('2025-12-23'),
  },
  {
    id: '5',
    rank: 5,
    title: 'Süper Lig\'de Heyecan Dorukta: Şampiyonluk Yarışı Kızışıyor',
    slug: 'super-ligde-heyecan-dorukta-sampiyonluk-yarisi',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&auto=format&fit=crop&q=60',
    category: 'Spor',
    viewCount: 8920,
    publishedAt: new Date('2025-12-25'),
  },
]

export default function PopularNews() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-2 mb-8">
          <TrendingUp className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            En Çok Okunanlar
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {popularArticles.map((article) => (
            <Link
              key={article.id}
              href={`/haber/${article.slug}`}
              className="group relative"
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-gray-900">
                  {article.rank}
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-600/80 backdrop-blur-sm rounded-full">
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-white text-sm line-clamp-3 group-hover:text-blue-300 transition-colors mb-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-300">
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {article.viewCount.toLocaleString('tr-TR')}
                    </span>
                    <span>{formatDateShort(article.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
