'use client'

import Link from 'next/link'
import { Rss, Copy, ExternalLink, Code, Newspaper, TrendingUp, Cpu, Trophy, Heart, Palette, FlaskConical, Globe, Check } from 'lucide-react'
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants'
import { useState } from 'react'

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

const rssFeeds = [
  {
    title: 'Tüm Haberler',
    description: 'Tüm kategorilerden en güncel haberler',
    url: '/api/rss',
    icon: Rss,
    color: 'bg-orange-500',
  },
  ...CATEGORIES.map(category => ({
    title: category.name,
    description: `${category.name} kategorisindeki haberler`,
    url: `/api/rss?category=${category.slug}`,
    icon: iconMap[category.icon] || Newspaper,
    color: 'bg-blue-500',
  })),
]

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const fullUrl = `${SITE_CONFIG.url}${url}`
  
  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      title="URL'yi kopyala"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

export default function RSSPage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 dark:bg-orange-900/30 rounded-full mb-6">
            <Rss className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            RSS Akışları
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Favori RSS okuyucunuzla {SITE_CONFIG.name} haberlerini takip edin. 
            Tüm kategoriler veya sadece ilgilendiğiniz konular için ayrı akışlar mevcuttur.
          </p>
        </div>
      </section>

      {/* What is RSS */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-8 border border-orange-200 dark:border-orange-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              RSS Nedir?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              RSS (Really Simple Syndication), web sitelerindeki içerikleri takip etmenizi sağlayan bir formattır. 
              Bir RSS okuyucu kullanarak, favori sitelerinizden gelen güncellemeleri tek bir yerden takip edebilirsiniz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. RSS Okuyucu Seçin</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Feedly, Inoreader veya başka bir RSS okuyucu kullanın.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Akış Ekleyin</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aşağıdaki RSS bağlantılarını okuyucunuza ekleyin.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Takip Edin</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yeni haberler otomatik olarak okuyucunuzda görünecek.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSS Feeds List */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Mevcut RSS Akışları
          </h2>
          <div className="space-y-4">
            {rssFeeds.map((feed, index) => {
              const Icon = feed.icon
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${feed.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {feed.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feed.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CopyButton url={feed.url} />
                      <a
                        href={feed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="RSS akışını aç"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <code className="text-sm text-gray-600 dark:text-gray-400 break-all">
                      {SITE_CONFIG.url}{feed.url}
                    </code>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular RSS Readers */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Önerilen RSS Okuyucular
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Feedly',
                description: 'Popüler ve kullanımı kolay RSS okuyucu',
                url: 'https://feedly.com',
                free: true,
              },
              {
                name: 'Inoreader',
                description: 'Güçlü filtreleme ve arama özellikleri',
                url: 'https://www.inoreader.com',
                free: true,
              },
              {
                name: 'NewsBlur',
                description: 'Açık kaynak kodlu RSS okuyucu',
                url: 'https://newsblur.com',
                free: true,
              },
              {
                name: 'The Old Reader',
                description: 'Klasik Google Reader deneyimi',
                url: 'https://theoldreader.com',
                free: true,
              },
              {
                name: 'Reeder',
                description: 'macOS ve iOS için premium okuyucu',
                url: 'https://reederapp.com',
                free: false,
              },
              {
                name: 'NetNewsWire',
                description: 'Ücretsiz ve açık kaynak (macOS/iOS)',
                url: 'https://netnewswire.com',
                free: true,
              },
            ].map((reader, index) => (
              <a
                key={index}
                href={reader.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {reader.name}
                  </h3>
                  {reader.free && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      Ücretsiz
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {reader.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Info */}
      <section className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Teknik Bilgiler
              </h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                <strong className="text-gray-900 dark:text-white">Format:</strong> RSS 2.0
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Güncelleme Sıklığı:</strong> Her 15 dakikada bir
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">İçerik Sayısı:</strong> Son 20 haber
              </p>
              <p>
                <strong className="text-gray-900 dark:text-white">Encoding:</strong> UTF-8
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Sorunuz mu var?
            </h2>
            <p className="text-gray-300 mb-6">
              RSS akışlarıyla ilgili sorularınız için bizimle iletişime geçebilirsiniz.
            </p>
            <Link
              href="/iletisim"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
