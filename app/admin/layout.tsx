'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'
import { LoadingState } from '@/components/admin/ui'

/**
 * Admin Layout - Yeni Versiyon
 * 
 * Özellikler:
 * - Gruplandırılmış sidebar navigasyonu
 * - Collapsible menü grupları
 * - Dark mode toggle
 * - Responsive tasarım
 * - Geliştirilmiş breadcrumb
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingState fullPage message="Yükleniyor..." />
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="md:pl-64">
        {/* Header */}
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
