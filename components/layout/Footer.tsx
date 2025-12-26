import Link from 'next/link'
import { Github, Twitter, Mail, Heart } from 'lucide-react'
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="font-bold text-xl text-white">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              {SITE_CONFIG.description}. Yapay zeka destekli, tam otomatik haber agregasyon platformu.
            </p>
            <div className="flex space-x-4">
              <a
                href={SITE_CONFIG.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={`https://twitter.com/${SITE_CONFIG.social.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="E-posta"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">Kategoriler</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/kategori/${category.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/hakkimizda" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-sm text-gray-400 hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/gizlilik" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/kullanim-kosullari" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/rss" className="text-sm text-gray-400 hover:text-white transition-colors">
                  RSS Akışı
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-white mb-4">Bülten</h3>
            <p className="text-sm text-gray-400 mb-4">
              Günlük haber özetlerini e-posta ile alın.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} {SITE_CONFIG.name}. Tüm hakları saklıdır.
            </p>
            <p className="text-sm text-gray-400 flex items-center">
              <Heart className="w-4 h-4 text-red-500 mx-1" />
              ile yapıldı by{' '}
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="text-blue-400 hover:text-blue-300 ml-1"
              >
                {SITE_CONFIG.author}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
