// import Image from 'next/image' // Gelecekte kullanılacak
import Link from 'next/link'
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Globe, 
  Code, 
  Heart,
  Github,
  Twitter,
  Mail
} from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI Destekli İçerik',
    description: 'Google Gemini AI ile haberleri analiz eder, özgün içerikler üretir ve otomatik olarak yayınlar.'
  },
  {
    icon: Zap,
    title: 'Anlık Güncellemeler',
    description: 'RSS kaynaklarından haberleri gerçek zamanlı olarak takip eder ve anında işler.'
  },
  {
    icon: Shield,
    title: 'Güvenilir Kaynaklar',
    description: 'Sadece güvenilir ve doğrulanmış haber kaynaklarından içerik toplar.'
  },
  {
    icon: Globe,
    title: 'Geniş Kapsam',
    description: 'Gündem, ekonomi, teknoloji, spor ve daha fazla kategoride haberler sunar.'
  },
  {
    icon: Code,
    title: 'Açık Kaynak',
    description: 'Tamamen açık kaynak kodlu, kendi sunucunuzda barındırabilirsiniz.'
  },
  {
    icon: Heart,
    title: 'Topluluk Odaklı',
    description: 'Kullanıcı geri bildirimleri ve topluluk katkılarıyla sürekli gelişir.'
  },
]

const stats = [
  { value: '1M+', label: 'Aylık Ziyaretçi' },
  { value: '50K+', label: 'Yayınlanan Haber' },
  { value: '24/7', label: 'Otomatik Güncelleme' },
  { value: '100%', label: 'Açık Kaynak' },
]

export default function AboutPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Hakkımızda
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            HaberNexus, yapay zeka teknolojisini kullanarak haberleri toplayan, analiz eden ve 
            özgün içerikler üreten yeni nesil bir haber platformudur.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Misyonumuz</h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              Herkesin güvenilir, tarafsız ve güncel haberlere kolayca ulaşabilmesini sağlamak. 
              Yapay zeka teknolojisini kullanarak haber tüketim deneyimini dönüştürmek ve 
              kullanıcılarımıza en değerli bilgileri sunmak.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.value}</p>
              <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Neden HaberNexus?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div 
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Technology Section */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16 mb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Teknoloji Altyapısı
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Next.js 16</p>
                  <p className="text-sm text-gray-500">Framework</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">React 19</p>
                  <p className="text-sm text-gray-500">UI Library</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Prisma</p>
                  <p className="text-sm text-gray-500">ORM</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">SQLite</p>
                  <p className="text-sm text-gray-500">Database</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Google Gemini</p>
                  <p className="text-sm text-gray-500">AI Engine</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Tailwind CSS</p>
                  <p className="text-sm text-gray-500">Styling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Geliştirici</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">ST</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Salih TANRISEVEN
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Full Stack Developer</p>
            <div className="flex items-center justify-center space-x-4">
              <a 
                href="https://github.com/sata2500" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
              <a 
                href="https://twitter.com/habernexus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="mailto:salihtanriseven25@gmail.com"
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Projeye Katkıda Bulunun
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            HaberNexus açık kaynak bir projedir. GitHub üzerinden projeye katkıda bulunabilir, 
            hata bildirebilir veya yeni özellikler önerebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/sata2500/habernexus-nextjs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub&apos;da Görüntüle
            </a>
            <Link
              href="/iletisim"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              İletişime Geç
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
