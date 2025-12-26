import { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Giriş Hatası',
  description: 'Giriş işlemi sırasında bir hata oluştu',
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const errorMessages: Record<string, string> = {
    Configuration: 'Sunucu yapılandırma hatası. Lütfen daha sonra tekrar deneyin.',
    AccessDenied: 'Erişim reddedildi. Bu hesapla giriş yapamazsınız.',
    Verification: 'Doğrulama bağlantısının süresi dolmuş veya zaten kullanılmış.',
    Default: 'Giriş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
  }

  const error = searchParams.error || 'Default'
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <span className="font-bold text-2xl text-gray-900 dark:text-white">
            {SITE_CONFIG.name}
          </span>
        </Link>

        {/* Error Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Giriş Başarısız
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tekrar Dene
            </Link>

            <Link
              href="/"
              className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
