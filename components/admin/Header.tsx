'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  Menu,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

// Sayfa başlıkları
const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/makaleler': 'Makaleler',
  '/admin/rss': 'RSS Kaynakları',
  '/admin/yorumlar': 'Yorumlar',
  '/admin/kullanicilar': 'Kullanıcılar',
  '/admin/iletisim': 'İletişim Mesajları',
  '/admin/duygu-analizi': 'Duygu Analizi',
  '/admin/promptlar': 'AI Promptları',
  '/admin/test-ortami': 'Test Ortamı',
  '/admin/analitik': 'Analitik',
  '/admin/aktivite': 'Aktivite Geçmişi',
  '/admin/gorsel-ayarlari': 'Görsel Ayarları',
  '/admin/gorsel-hatalari': 'Görsel Hataları',
  '/admin/ayarlar': 'Ayarlar',
  '/admin/env-yonetimi': 'Ortam Değişkenleri',
  '/admin/surum-yonetimi': 'Sürüm Yönetimi',
  '/admin/veri-aktarimi': 'Veri Aktarımı',
}

// Sayfa başlığını URL'den belirle
function getPageTitle(pathname: string): string {
  // Tam eşleşme kontrolü
  if (pageTitles[pathname]) {
    return pageTitles[pathname]
  }
  
  // Alt sayfa kontrolü
  const parentPath = Object.keys(pageTitles).find(
    (path) => pathname.startsWith(path) && path !== '/admin'
  )
  if (parentPath) {
    return pageTitles[parentPath]
  }
  
  return 'Dashboard'
}

// Breadcrumb oluştur
function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Admin', href: '/admin' },
  ]
  
  if (pathname !== '/admin') {
    const title = getPageTitle(pathname)
    breadcrumbs.push({ label: title, href: pathname })
  }
  
  return breadcrumbs
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Hydration hatası önleme
  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = getBreadcrumbs(pathname)
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Sol: Menü butonu ve breadcrumb */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          {/* Mobil menü butonu */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 touch-manipulation"
            aria-label="Menüyü aç"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Breadcrumb - Masaüstü */}
          <nav className="hidden sm:flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-400" aria-hidden="true" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Sayfa başlığı - Mobil */}
          <h1 className="sm:hidden font-semibold text-gray-900 dark:text-white truncate">
            {pageTitle}
          </h1>
        </div>

        {/* Sağ: Aksiyonlar */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Rol badge - Sadece masaüstü */}
          {session?.user?.role && (
            <span className="hidden lg:inline-flex text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded font-medium">
              {session.user.role}
            </span>
          )}

          {/* Dark mode toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 touch-manipulation"
              title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
              aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Siteyi görüntüle - Masaüstü */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>Siteyi Görüntüle</span>
            <ExternalLink className="w-4 h-4" />
          </Link>

          {/* Siteyi görüntüle - Mobil (sadece ikon) */}
          <Link
            href="/"
            target="_blank"
            className="sm:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 touch-manipulation"
            aria-label="Siteyi görüntüle"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
