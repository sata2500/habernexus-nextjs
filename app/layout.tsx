import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

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
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
