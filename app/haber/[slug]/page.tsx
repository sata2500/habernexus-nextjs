import Image from 'next/image'
import Link from 'next/link'
// import { notFound } from 'next/navigation' // Veritabanı entegrasyonunda kullanılacak
import { Clock, Eye, Calendar, Share2, Bookmark, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react'
import { formatDate, getReadingTime } from '@/lib/utils'
import ArticleCard from '@/components/articles/ArticleCard'

// Demo veri - gerçek uygulamada veritabanından gelecek
const demoArticle = {
  id: '1',
  title: 'Yapay Zeka Teknolojisinde Yeni Bir Dönem: 2025 Yılının En Büyük Gelişmeleri',
  slug: 'yapay-zeka-teknolojisinde-yeni-bir-donem-2025',
  excerpt: 'Yapay zeka alanında yaşanan son gelişmeler, teknoloji dünyasını derinden etkiliyor. İşte 2025 yılının en önemli AI haberleri.',
  content: `
    <p>Yapay zeka teknolojisi, son yıllarda inanılmaz bir hızla gelişmeye devam ediyor. 2025 yılı, bu alanda pek çok yeniliğe sahne oldu. Büyük dil modelleri, görüntü işleme ve otonom sistemler gibi alanlarda önemli ilerlemeler kaydedildi.</p>

    <h2>Büyük Dil Modellerinde Devrim</h2>
    <p>2025 yılında büyük dil modelleri, daha önce hiç görülmemiş seviyelere ulaştı. Yeni nesil modeller, insan benzeri metin üretme yeteneklerinin yanı sıra, karmaşık mantıksal çıkarımlar yapabilme kapasitesine de sahip oldu. Bu gelişmeler, eğitimden sağlığa, finanstan hukuka kadar pek çok sektörde köklü değişikliklere yol açtı.</p>

    <h2>Görüntü ve Video Üretimi</h2>
    <p>Yapay zeka destekli görüntü ve video üretim araçları, 2025 yılında profesyonel kalitede içerikler üretebilir hale geldi. Film yapımcıları, reklamcılar ve içerik üreticileri, bu araçları yaratıcı süreçlerinde aktif olarak kullanmaya başladı.</p>

    <h2>Otonom Sistemler</h2>
    <p>Otonom araçlar ve robotik sistemler, 2025 yılında önemli bir olgunluk seviyesine ulaştı. Sürücüsüz taksi hizmetleri birçok büyük şehirde yaygınlaşırken, depo ve lojistik operasyonlarında robotik sistemlerin kullanımı standart hale geldi.</p>

    <h2>Etik ve Düzenleme Tartışmaları</h2>
    <p>Yapay zekanın hızlı gelişimi, beraberinde önemli etik soruları da getirdi. Veri gizliliği, algoritmik önyargı ve iş gücü üzerindeki etkileri gibi konular, 2025 yılında yoğun bir şekilde tartışıldı. Birçok ülke, yapay zeka kullanımını düzenleyen yeni yasalar çıkardı.</p>

    <h2>Geleceğe Bakış</h2>
    <p>Uzmanlar, yapay zeka teknolojisinin önümüzdeki yıllarda daha da hızlı bir şekilde gelişeceğini öngörüyor. Genel yapay zeka (AGI) hedefine doğru atılan adımlar, teknoloji dünyasının en heyecan verici gelişmeleri arasında yer alıyor.</p>
  `,
  imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
  category: 'Teknoloji',
  viewCount: 15420,
  publishedAt: new Date('2025-12-26'),
  author: {
    name: 'HaberNexus AI',
    image: null,
    bio: 'HaberNexus yapay zeka editörü'
  }
}

const relatedArticles = [
  {
    id: '2',
    title: 'Ekonomide Son Durum: Merkez Bankası Faiz Kararını Açıkladı',
    slug: 'ekonomide-son-durum-merkez-bankasi-faiz-karari',
    excerpt: 'Merkez Bankası, beklenen faiz kararını açıkladı.',
    content: 'Merkez Bankası, aylık para politikası toplantısının ardından faiz kararını açıkladı.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
    category: 'Ekonomi',
    viewCount: 12350,
    publishedAt: new Date('2025-12-25'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '3',
    title: 'Bilim Dünyasından Heyecan Verici Keşif: Mars\'ta Su İzleri Bulundu',
    slug: 'bilim-dunyasindan-heyecan-verici-kesif-marsta-su-izleri',
    excerpt: 'NASA\'nın Mars keşif aracı, gezegende su izlerine dair yeni kanıtlar buldu.',
    content: 'NASA\'nın Mars\'taki keşif aracı Perseverance, gezegen yüzeyinde su izlerine dair önemli kanıtlar elde etti.',
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&auto=format&fit=crop&q=60',
    category: 'Bilim',
    viewCount: 11200,
    publishedAt: new Date('2025-12-24'),
    author: { name: 'HaberNexus AI', image: null }
  },
  {
    id: '4',
    title: 'Süper Lig\'de Heyecan Dorukta: Şampiyonluk Yarışı Kızışıyor',
    slug: 'super-ligde-heyecan-dorukta-sampiyonluk-yarisi',
    excerpt: 'Süper Lig\'de şampiyonluk yarışı son haftalara girerken heyecan doruk noktasına ulaştı.',
    content: 'Türkiye Süper Ligi\'nde şampiyonluk yarışı her geçen hafta daha da heyecanlı bir hal alıyor.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=60',
    category: 'Spor',
    viewCount: 8920,
    publishedAt: new Date('2025-12-25'),
    author: { name: 'HaberNexus AI', image: null }
  },
]

export default function ArticlePage() {
  // Gerçek uygulamada veritabanından çekilecek
  const article = demoArticle
  const readingTime = getReadingTime(article.content)

  return (
    <article className="py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Link
              href={`/kategori/${article.category.toLowerCase()}`}
              className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            >
              {article.category}
            </Link>
            <span className="text-gray-400">•</span>
            <span className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {readingTime} dk okuma
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {article.title}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {article.author.name}
                </p>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {article.viewCount.toLocaleString('tr-TR')} görüntülenme
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-3xl mx-auto">
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Article Actions */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bu makale faydalı mıydı?</span>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <ThumbsUp className="w-5 h-5" />
                <span>Evet</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <ThumbsDown className="w-5 h-5" />
                <span>Hayır</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Paylaş</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <section className="max-w-6xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            İlgili Haberler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </div>
    </article>
  )
}
