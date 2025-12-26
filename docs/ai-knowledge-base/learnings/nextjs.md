# Next.js Best Practices & Learnings

Bu dosya, HaberNexus projesinde Next.js geliştirme sürecinde öğrenilen en iyi uygulamaları ve ipuçlarını içerir.

---

## 1. Client vs Server Components

### Öğrenilen (26 Ara 2025)

**Problem:** Next.js 14+ App Router'da, event handler'lar (onClick, onChange vb.) içeren bileşenler Server Component olarak render edilemez.

**Çözüm:** Event handler içeren bileşenlerin başına `'use client'` direktifi eklenmeli.

```tsx
// ❌ Yanlış - Server Component'te event handler
export default function Button() {
  return <button onClick={() => alert('click')}>Click</button>
}

// ✅ Doğru - Client Component
'use client'
export default function Button() {
  return <button onClick={() => alert('click')}>Click</button>
}
```

**Etkilenen Dosyalar:**
- `components/layout/Header.tsx` - Menü toggle, tema değiştirme
- `components/articles/ArticleCard.tsx` - Bookmark butonu
- `components/home/NewsletterSection.tsx` - Form submit

---

## 2. Image Optimization

### Öğrenilen (26 Ara 2025)

**Problem:** `next/image` bileşeni harici URL'lerden görsel yüklerken `remotePatterns` konfigürasyonu gerektirir.

**Çözüm:** `next.config.js` dosyasında `images.remotePatterns` tanımlanmalı.

```js
// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}
```

**Not:** `images.domains` deprecated olmuştur, `remotePatterns` kullanılmalıdır.

---

## 3. Dynamic Routes

### Öğrenilen (26 Ara 2025)

**Best Practice:** Dynamic route'lar için dosya yapısı:

```
app/
├── haber/
│   └── [slug]/
│       └── page.tsx      # /haber/makale-basligi
├── kategori/
│   └── [slug]/
│       └── page.tsx      # /kategori/teknoloji
```

**Params Kullanımı:**
```tsx
export default function Page({ params }: { params: { slug: string } }) {
  // params.slug ile erişim
}
```

---

## 4. Layout Composition

### Öğrenilen (26 Ara 2025)

**Best Practice:** Admin paneli gibi farklı layout gerektiren bölümler için nested layout kullanılmalı.

```
app/
├── layout.tsx            # Ana layout (Header, Footer)
├── page.tsx              # Ana sayfa
├── admin/
│   ├── layout.tsx        # Admin layout (Sidebar)
│   └── page.tsx          # Admin dashboard
```

**Not:** Alt layout'lar üst layout'u override etmez, iç içe geçer.

---

## 5. Metadata API

### Öğrenilen (26 Ara 2025)

**Best Practice:** SEO için `generateMetadata` veya `metadata` export kullanılmalı.

```tsx
// Static metadata
export const metadata: Metadata = {
  title: {
    default: 'HaberNexus',
    template: '%s | HaberNexus'
  },
  description: '...',
  openGraph: { ... },
  twitter: { ... },
}
```

**Dinamik Metadata:**
```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getArticle(params.slug)
  return {
    title: article.title,
    description: article.excerpt,
  }
}
```

---

## 6. Font Optimization

### Öğrenilen (26 Ara 2025)

**Best Practice:** `next/font` kullanarak font'ları optimize edin.

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

**Avantajlar:**
- Otomatik self-hosting
- Layout shift önleme
- Performans optimizasyonu

---

## 7. Build Errors

### Öğrenilen (26 Ara 2025)

**Problem:** Build sırasında "Event handlers cannot be passed to Client Component props" hatası.

**Sebep:** Server Component'ten Client Component'e event handler prop olarak geçirilmeye çalışılıyor.

**Çözüm:** 
1. Event handler içeren bileşeni `'use client'` ile işaretle
2. Veya event handler'ı child component'e taşı

---

**Son Güncelleme:** 26 Aralık 2025
**Katkıda Bulunan:** Manus AI Agent
