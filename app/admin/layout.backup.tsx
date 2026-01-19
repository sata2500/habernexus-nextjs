'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Newspaper, 
  Rss, 
  Users, 
  Settings, 
  BarChart3,
  MessageCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  FileText,
  Image as ImageIcon,
  FlaskConical,
  AlertTriangle,
  Menu,
  X,
  FileCode,
  GitBranch,
  DatabaseBackup
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Makaleler', href: '/admin/makaleler', icon: Newspaper },
  { name: 'RSS Kaynakları', href: '/admin/rss', icon: Rss },
  { name: 'Yorumlar', href: '/admin/yorumlar', icon: MessageCircle },
  { name: 'Kullanıcılar', href: '/admin/kullanicilar', icon: Users },
  { name: 'Duygu Analizi', href: '/admin/duygu-analizi', icon: Sparkles },
  { name: 'Analitik', href: '/admin/analitik', icon: BarChart3 },
  { name: 'AI Promptları', href: '/admin/promptlar', icon: FileText },
  { name: 'Görsel Ayarları', href: '/admin/gorsel-ayarlari', icon: ImageIcon },
  { name: 'Görsel Hataları', href: '/admin/gorsel-hatalari', icon: AlertTriangle },
  { name: 'Test Ortamı', href: '/admin/test-ortami', icon: FlaskConical },
  { name: 'Ortam Değişkenleri', href: '/admin/env-yonetimi', icon: FileCode },
  { name: 'Sürüm Yönetimi', href: '/admin/surum-yonetimi', icon: GitBranch },
  { name: 'Veri Aktarımı', href: '/admin/veri-aktarimi', icon: DatabaseBackup },
  { name: 'Ayarlar', href: '/admin/ayarlar', icon: Settings },
]

// Sayfa başlıklarını URL'den belirle
function getPageTitle(pathname: string): string {
  // Tam eşleşme kontrolü
  const exactMatch = sidebarItems.find(item => item.href === pathname)
  if (exactMatch) return exactMatch.name
  
  // Alt sayfa kontrolü (örn: /admin/makaleler/yeni)
  const parentMatch = sidebarItems.find(item => 
    pathname.startsWith(item.href) && item.href !== '/admin'
  )
  if (parentMatch) return parentMatch.name
  
  return 'Dashboard'
}

// Aktif sayfa kontrolü
function isActivePath(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin'
  }
  return pathname.startsWith(href)
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!session?.user) {
    router.push('/auth/signin')
    return null
  }

  // Check if user has ADMIN role
  if (session.user.role !== 'ADMIN') {
    router.push('/?error=unauthorized')
    return null
  }

  const pageTitle = getPageTitle(pathname)

  // Mobil menüde link tıklandığında menüyü kapat
  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">HaberNexus</span>
                <span className="block text-xs text-gray-500">Admin Panel</span>
              </div>
            </div>
            {/* Mobil kapatma butonu */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = isActivePath(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleMobileNavClick}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 group-hover:text-blue-600'
                  )} />
                  <span className={cn(
                    'font-medium',
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'group-hover:text-blue-600'
                  )}>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 px-4 py-3">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'Admin'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {session.user.name?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session.user.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mt-2"
            >
              <LogOut className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Mobil menü butonu */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 -ml-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href="/admin" className="hover:text-blue-600">Admin</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 dark:text-white font-medium">{pageTitle}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                {session.user.role}
              </span>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-blue-600 hidden sm:block"
              >
                Siteyi Görüntüle
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
