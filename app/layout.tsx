import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SessionProvider from '@/components/providers/SessionProvider'
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: {
    default: 'HaberNexus - AI Destekli Haber Platformu',
    template: '%s | HaberNexus'
  },
  description: 'Yapay zeka destekli, tam otomatik haber agregasyon platformu. Güncel haberler, ekonomi, teknoloji, spor ve daha fazlası.',
  keywords: ['haber', 'gündem', 'ekonomi', 'teknoloji', 'spor', 'yapay zeka', 'AI', 'haberler'],
  authors: [{ name: 'Salih TANRISEVEN', url: 'https://habernexus.com' }],
  creator: 'Salih TANRISEVEN',
  publisher: 'HaberNexus',
  metadataBase: new URL('https://habernexus.com'),
  applicationName: 'HaberNexus',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HaberNexus',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://habernexus.com',
    siteName: 'HaberNexus',
    title: 'HaberNexus - AI Destekli Haber Platformu',
    description: 'Yapay zeka destekli, tam otomatik haber agregasyon platformu.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HaberNexus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HaberNexus - AI Destekli Haber Platformu',
    description: 'Yapay zeka destekli, tam otomatik haber agregasyon platformu.',
    images: ['/og-image.png'],
    creator: '@habernexus',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HaberNexus" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ServiceWorkerRegistration />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <PWAInstallPrompt />
        </SessionProvider>
      </body>
    </html>
  )
}
