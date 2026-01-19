'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Github, Twitter, Mail, Heart, Rss, Loader2, CheckCircle } from 'lucide-react'
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Ana içerik - Mobil için optimize edilmiş padding ve container */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand - Mobil için ortalanmış */}
          <div className="space-y-4 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center space-x-2 justify-center sm:justify-start">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">H</span>
              </div>
              <span className="font-bold text-lg sm:text-xl text-white">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto sm:mx-0">
              {SITE_CONFIG.description}. Yapay zeka destekli, tam otomatik haber agregasyon platformu.
            </p>
            {/* Sosyal medya ikonları - Mobil için ortalanmış */}
            <div className="flex space-x-3 justify-center sm:justify-start">
              <a
                href={SITE_CONFIG.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href={`https://twitter.com/${SITE_CONFIG.social.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                aria-label="E-posta"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <Link
                href="/rss"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-400 hover:bg-gray-700 transition-colors"
                aria-label="RSS"
              >
                <Rss className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          </div>

          {/* Categories - Mobil için ortalanmış */}
          <div className="text-center sm:text-left">
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
              <li>
                <Link
                  href="/kategoriler"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Tüm Kategoriler →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links - Mobil için ortalanmış */}
          <div className="text-center sm:text-left">
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
              <li>
                <Link href="/haberler" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Tüm Haberler
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter - Mobil için ortalanmış ve tam genişlik */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-white mb-4">Bülten</h3>
            <p className="text-sm text-gray-400 mb-4">
              Günlük haber özetlerini e-posta ile alın.
            </p>
            {status === 'success' ? (
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-green-400 bg-green-900/20 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">Abone oldunuz!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2 max-w-xs mx-auto sm:mx-0 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  required
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Abone Ol'
                  )}
                </button>
                {status === 'error' && (
                  <p className="text-xs text-red-400">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                )}
              </form>
            )}
            <p className="text-xs text-gray-500 mt-3 max-w-xs mx-auto sm:mx-0">
              Abone olarak{' '}
              <Link href="/gizlilik" className="text-gray-400 hover:text-white underline">
                Gizlilik Politikamızı
              </Link>{' '}
              kabul etmiş olursunuz.
            </p>
          </div>
        </div>

        {/* Bottom Bar - Mobil için iyileştirilmiş */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col items-center space-y-4 text-center">
            {/* Copyright ve lisans */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-xs sm:text-sm text-gray-400">
                © {currentYear} {SITE_CONFIG.name}. Tüm hakları saklıdır.
              </p>
              <span className="hidden sm:inline text-gray-600">|</span>
              <a
                href={SITE_CONFIG.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Açık Kaynak (MIT)
              </a>
            </div>
            {/* Yapımcı bilgisi */}
            <p className="text-xs sm:text-sm text-gray-400 flex items-center flex-wrap justify-center">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mx-1 flex-shrink-0" />
              <span>ile yapıldı by</span>
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
