import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HaberNexus - AI Destekli Haber Platformu',
  description: 'Yapay zeka destekli, tam otomatik haber agregasyon platformu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
