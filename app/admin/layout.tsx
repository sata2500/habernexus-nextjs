'use client'

import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
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
  AlertTriangle
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
  const { data: session, status } = useSession()
  
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
    redirect('/auth/signin')
  }

  // Check if user has ADMIN role
  if (session.user.role !== 'ADMIN') {
    redirect('/?error=unauthorized')
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform -translate-x-full md:translate-x-0 transition-transform">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">HaberNexus</span>
              <span className="block text-xs text-gray-500">Admin Panel</span>
            </div>
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
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/admin" className="hover:text-blue-600">Admin</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium">{pageTitle}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                {session.user.role}
              </span>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-blue-600"
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
