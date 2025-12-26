import Link from 'next/link'
import { 
  LayoutDashboard, 
  Newspaper, 
  Rss, 
  Users, 
  Settings, 
  BarChart3,
  LogOut,
  ChevronRight
} from 'lucide-react'

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Makaleler', href: '/admin/makaleler', icon: Newspaper },
  { name: 'RSS Kaynakları', href: '/admin/rss', icon: Rss },
  { name: 'Kullanıcılar', href: '/admin/kullanicilar', icon: Users },
  { name: 'Analitik', href: '/admin/analitik', icon: BarChart3 },
  { name: 'Ayarlar', href: '/admin/ayarlar', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                  <span className="font-medium group-hover:text-blue-600">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@habernexus.com</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mt-2"
            >
              <LogOut className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Çıkış Yap</span>
            </Link>
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
              <span className="text-gray-900 dark:text-white font-medium">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
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
