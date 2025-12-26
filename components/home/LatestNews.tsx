import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ArticleCard from '@/components/articles/ArticleCard'

// Demo veriler - gerçek uygulamada veritabanından gelecek
const demoArticles = [
  {
    id: '1',
    title: 'Yapay Zeka Teknolojisinde Yeni Bir Dönem: 2025 Yılının En Büyük Gelişmeleri',
    slug: 'yapay-zeka-teknolojisinde-yeni-bir-donem-2025',
    excerpt: 'Yapay zeka alanında yaşanan son gelişmeler, teknoloji dünyasını derinden etkiliyor. İşte 2025 yılının en önemli AI haberleri.',
    content: 'Yapay zeka teknolojisi, son yıllarda inanılmaz bir hızla gelişmeye devam ediyor. 2025 yılı, bu alanda pek çok yeniliğe sahne oldu. Büyük dil modelleri, görüntü işleme ve otonom sistemler gibi alanlarda önemli ilerlemeler kaydedildi.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
    category: 'Teknoloji',
    viewCount: 15420,
    publishedAt: new Date('2025-12-26'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '2',
    title: 'Ekonomide Son Durum: Merkez Bankası Faiz Kararını Açıkladı',
    slug: 'ekonomide-son-durum-merkez-bankasi-faiz-karari',
    excerpt: 'Merkez Bankası, beklenen faiz kararını açıkladı. Piyasalar bu gelişmeye nasıl tepki verdi?',
    content: 'Merkez Bankası, aylık para politikası toplantısının ardından faiz kararını açıkladı. Karar, piyasalarda çeşitli tepkilere yol açtı. Ekonomistler, bu kararın ekonomi üzerindeki olası etkilerini değerlendirdi.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
    category: 'Ekonomi',
    viewCount: 12350,
    publishedAt: new Date('2025-12-25'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '3',
    title: 'Süper Lig\'de Heyecan Dorukta: Şampiyonluk Yarışı Kızışıyor',
    slug: 'super-ligde-heyecan-dorukta-sampiyonluk-yarisi',
    excerpt: 'Süper Lig\'de şampiyonluk yarışı son haftalara girerken heyecan doruk noktasına ulaştı.',
    content: 'Türkiye Süper Ligi\'nde şampiyonluk yarışı her geçen hafta daha da heyecanlı bir hal alıyor. Lider takım ile takipçileri arasındaki puan farkı oldukça az. Taraftarlar, bu heyecanlı yarışı büyük bir ilgiyle takip ediyor.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60',
    category: 'Spor',
    viewCount: 8920,
    publishedAt: new Date('2025-12-25'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '4',
    title: 'Sağlık Bakanlığı\'ndan Önemli Açıklama: Yeni Aşı Takvimi Belirlendi',
    slug: 'saglik-bakanligindan-onemli-aciklama-yeni-asi-takvimi',
    excerpt: 'Sağlık Bakanlığı, 2025 yılı için yeni aşı takvimini açıkladı. İşte detaylar.',
    content: 'Sağlık Bakanlığı, yeni yıl için güncellenmiş aşı takvimini kamuoyuyla paylaştı. Yeni takvim, çeşitli yaş grupları için önerilen aşıları ve uygulama zamanlarını içeriyor.',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=60',
    category: 'Sağlık',
    viewCount: 6780,
    publishedAt: new Date('2025-12-24'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '5',
    title: 'Bilim Dünyasından Heyecan Verici Keşif: Mars\'ta Su İzleri Bulundu',
    slug: 'bilim-dunyasindan-heyecan-verici-kesif-marsta-su-izleri',
    excerpt: 'NASA\'nın Mars keşif aracı, gezegende su izlerine dair yeni kanıtlar buldu.',
    content: 'NASA\'nın Mars\'taki keşif aracı Perseverance, gezegen yüzeyinde su izlerine dair önemli kanıtlar elde etti. Bu keşif, Mars\'ta yaşam olasılığı konusundaki tartışmaları yeniden alevlendirdi.',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&auto=format&fit=crop&q=60',
    category: 'Bilim',
    viewCount: 11200,
    publishedAt: new Date('2025-12-24'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '6',
    title: 'Dünya Liderleri İklim Zirvesi\'nde Buluştu: Tarihi Anlaşma İmzalandı',
    slug: 'dunya-liderleri-iklim-zirvesinde-bulustu-tarihi-anlasma',
    excerpt: 'Dünya liderleri, iklim değişikliğiyle mücadele için tarihi bir anlaşmaya imza attı.',
    content: 'Birleşmiş Milletler öncülüğünde düzenlenen iklim zirvesinde, dünya liderleri karbon emisyonlarını azaltmak için kapsamlı bir anlaşma imzaladı. Anlaşma, 2030 yılına kadar önemli hedefler içeriyor.',
    imageUrl: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&auto=format&fit=crop&q=60',
    category: 'Dünya',
    viewCount: 9450,
    publishedAt: new Date('2025-12-23'),
    author: { name: 'HaberNexus AI', image: null }
  },
]

export default function LatestNews() {
  const featuredArticle = demoArticles[0]
  const otherArticles = demoArticles.slice(1)

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Son Haberler
          </h2>
          <Link
            href="/haberler"
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Tüm Haberler
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Article */}
          <div className="lg:col-span-2">
            <ArticleCard article={featuredArticle} variant="featured" />
          </div>

          {/* Side Articles */}
          <div className="space-y-4">
            {otherArticles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>

        {/* More Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {otherArticles.slice(3).map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}
