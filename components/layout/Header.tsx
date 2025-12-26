'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Search, User, Moon, Sun, LogOut, Settings } from 'lucide-react'
import { NAV_ITEMS, SITE_CONFIG } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              {SITE_CONFIG.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
              aria-label="Ara"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
              aria-label="Tema değiştir"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu - Authenticated */}
            {status === 'authenticated' && session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'Kullanıcı'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {session.user.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        {session.user.role}
                      </span>
                    </div>

                    {/* Admin Link - Only for ADMIN role */}
                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ) : (
              /* User Menu - Not Authenticated */
              <Link
                href="/auth/signin"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Giriş Yap</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
              aria-label="Menü"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            isMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
          )}
        >
          <nav className="flex flex-col space-y-1 pt-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
              >
                {item.name}
              </Link>
            ))}
            
            {status === 'authenticated' && session?.user ? (
              <>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center justify-center space-x-2 mx-4 mt-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Çıkış Yap</span>
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center space-x-2 mx-4 mt-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Giriş Yap</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
