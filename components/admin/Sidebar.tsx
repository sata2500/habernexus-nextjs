'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { 
  LayoutDashboard, 
  Newspaper, 
  Rss, 
  Users, 
  Settings, 
  BarChart3,
  MessageCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  FlaskConical,
  AlertTriangle,
  X,
  FileCode,
  GitBranch,
  DatabaseBackup,
  Bot,
  Cog,
  Mail,
  Activity,
  LucideIcon,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Menü öğesi tipi
interface MenuItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: string
}

// Menü grubu tipi
interface MenuGroup {
  name: string
  icon: LucideIcon
  items: MenuItem[]
  defaultOpen?: boolean
}

// Gruplandırılmış menü yapısı
const menuGroups: MenuGroup[] = [
  {
    name: 'İçerik Yönetimi',
    icon: Newspaper,
    defaultOpen: true,
    items: [
      { name: 'Makaleler', href: '/admin/makaleler', icon: Newspaper },
      { name: 'RSS Kaynakları', href: '/admin/rss', icon: Rss },
      { name: 'Yorumlar', href: '/admin/yorumlar', icon: MessageCircle },
    ],
  },
  {
    name: 'Kullanıcı Yönetimi',
    icon: Users,
    items: [
      { name: 'Kullanıcılar', href: '/admin/kullanicilar', icon: Users },
      { name: 'İletişim Mesajları', href: '/admin/iletisim', icon: Mail },
    ],
  },
  {
    name: 'AI & Analiz',
    icon: Bot,
    items: [
      { name: 'İçerik Üretim Merkezi', href: '/admin/icerik-merkezi', icon: Bot, badge: 'Yeni' },
      { name: 'Testler', href: '/admin/testler', icon: FlaskConical },
      { name: 'Duygu Analizi', href: '/admin/duygu-analizi', icon: Sparkles },
    ],
  },
  {
    name: 'Raporlar',
    icon: BarChart3,
    items: [
      { name: 'Analitik', href: '/admin/analitik', icon: BarChart3 },
      { name: 'Aktivite Geçmişi', href: '/admin/aktivite', icon: Activity, badge: 'Yeni' },
    ],
  },
  {
    name: 'Medya',
    icon: ImageIcon,
    items: [
      { name: 'Görsel Hataları', href: '/admin/gorsel-hatalari', icon: AlertTriangle },
    ],
  },
  {
    name: 'Sistem',
    icon: Cog,
    items: [
      { name: 'Ayarlar', href: '/admin/ayarlar', icon: Settings },
      { name: 'Ortam Değişkenleri', href: '/admin/env-yonetimi', icon: FileCode },
      { name: 'Sürüm Yönetimi', href: '/admin/surum-yonetimi', icon: GitBranch },
      { name: 'Veri Aktarımı', href: '/admin/veri-aktarimi', icon: DatabaseBackup },
    ],
  },
]

// Dashboard öğesi (gruplar dışında)
const dashboardItem: MenuItem = {
  name: 'Dashboard',
  href: '/admin',
  icon: LayoutDashboard,
}

// Aktif sayfa kontrolü
function isActivePath(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin'
  }
  return pathname.startsWith(href)
}

// Grup içinde aktif sayfa var mı kontrolü
function hasActiveItem(pathname: string, items: MenuItem[]): boolean {
  return items.some((item) => isActivePath(pathname, item.href))
}

interface SidebarProps {
  isMobileMenuOpen: boolean
  onMobileMenuClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ 
  isMobileMenuOpen, 
  onMobileMenuClose,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Açık grupları takip et
  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    // Başlangıçta aktif öğe içeren grupları ve defaultOpen olanları aç
    return menuGroups
      .filter((group) => group.defaultOpen || hasActiveItem(pathname, group.items))
      .map((group) => group.name)
  })

  // Pathname değiştiğinde aktif grubu aç
  useEffect(() => {
    const activeGroup = menuGroups.find((group) => hasActiveItem(pathname, group.items))
    if (activeGroup && !openGroups.includes(activeGroup.name)) {
      setOpenGroups((prev) => [...prev, activeGroup.name])
    }
  }, [pathname, openGroups])

  // Toggle group fonksiyonu - düzeltilmiş versiyon
  const toggleGroup = useCallback((groupName: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setOpenGroups((prev) => {
      if (prev.includes(groupName)) {
        return prev.filter((name) => name !== groupName)
      } else {
        return [...prev, groupName]
      }
    })
  }, [])

  // Mobil menüde link tıklandığında menüyü kapat
  const handleNavClick = () => {
    onMobileMenuClose()
  }

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileMenuClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out flex flex-col',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        role="navigation"
        aria-label="Ana menü"
      >
        {/* Logo - Sabit yükseklik: h-16 (64px) - Admin Header ile eşleşiyor */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link 
            href="/admin" 
            className={cn(
              "flex items-center",
              isCollapsed ? "justify-center w-full" : "space-x-3"
            )} 
            onClick={handleNavClick}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-base text-gray-900 dark:text-white block truncate">HaberNexus</span>
                <span className="text-xs text-gray-500 block">Admin Panel</span>
              </div>
            )}
          </Link>
          
          {/* Masaüstü daraltma butonu */}
          {!isCollapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Menüyü daralt"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
          
          {/* Mobil kapatma butonu */}
          <button
            onClick={onMobileMenuClose}
            className="md:hidden p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
            aria-label="Menüyü kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daraltılmış durumda genişletme butonu */}
        {isCollapsed && onToggleCollapse && (
          <div className="hidden md:flex justify-center py-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Menüyü genişlet"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 space-y-1 overflow-y-auto overscroll-contain">
          {/* Dashboard (tek başına) */}
          <Link
            href={dashboardItem.href}
            onClick={handleNavClick}
            className={cn(
              'flex items-center rounded-lg transition-colors group touch-manipulation',
              isCollapsed ? 'justify-center px-2 py-2.5' : 'space-x-3 px-3 py-2.5',
              isActivePath(pathname, dashboardItem.href)
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
            )}
            title={isCollapsed ? dashboardItem.name : undefined}
          >
            <dashboardItem.icon
              className={cn(
                'w-5 h-5 flex-shrink-0',
                isActivePath(pathname, dashboardItem.href)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 group-hover:text-blue-600'
              )}
            />
            {!isCollapsed && (
              <span
                className={cn(
                  'font-medium truncate',
                  isActivePath(pathname, dashboardItem.href)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'group-hover:text-blue-600'
                )}
              >
                {dashboardItem.name}
              </span>
            )}
          </Link>

          {/* Gruplar */}
          <div className="pt-3 sm:pt-4 space-y-1">
            {menuGroups.map((group) => {
              const isOpen = openGroups.includes(group.name)
              const hasActive = hasActiveItem(pathname, group.items)
              const GroupIcon = group.icon

              return (
                <div key={group.name}>
                  {/* Grup başlığı */}
                  <button
                    type="button"
                    onClick={(e) => toggleGroup(group.name, e)}
                    className={cn(
                      'w-full flex items-center rounded-lg transition-colors touch-manipulation',
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5',
                      hasActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                    )}
                    aria-expanded={isOpen}
                    title={isCollapsed ? group.name : undefined}
                  >
                    <div className={cn(
                      "flex items-center",
                      isCollapsed ? "" : "space-x-3"
                    )}>
                      <GroupIcon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium text-sm truncate">{group.name}</span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <span className="flex-shrink-0">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </button>

                  {/* Grup öğeleri */}
                  {isOpen && !isCollapsed && (
                    <div className="mt-1 ml-3 sm:ml-4 pl-3 sm:pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon
                        const isActive = isActivePath(pathname, item.href)

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleNavClick}
                            className={cn(
                              'flex items-center justify-between px-3 py-2 rounded-lg transition-colors group touch-manipulation',
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white active:bg-gray-200 dark:active:bg-gray-600'
                            )}
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <ItemIcon
                                className={cn(
                                  'w-4 h-4 flex-shrink-0',
                                  isActive
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-400 group-hover:text-blue-600'
                                )}
                              />
                              <span className="text-sm truncate">{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded flex-shrink-0 ml-2">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="px-2 sm:px-3 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className={cn(
            "flex items-center px-3 py-2",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'Admin'}
                width={36}
                height={36}
                className="rounded-full w-9 h-9 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {session?.user?.name?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session?.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={cn(
              "flex items-center w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-colors mt-2 touch-manipulation",
              isCollapsed ? "justify-center px-2 py-2.5" : "space-x-3 px-3 py-2.5"
            )}
            title={isCollapsed ? "Çıkış Yap" : undefined}
          >
            <LogOut className="w-5 h-5 text-gray-500 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium text-sm">Çıkış Yap</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
