# TypeScript Best Practices & Learnings

Bu dosya, HaberNexus projesinde TypeScript geliştirme sürecinde öğrenilen en iyi uygulamaları ve ipuçlarını içerir.

---

## 1. Interface vs Type

### Öğrenilen (26 Ara 2025)

**Best Practice:** 
- Object şekilleri için `interface` kullanın (genişletilebilir)
- Union types, tuple veya utility types için `type` kullanın

```tsx
// ✅ Interface - Object şekilleri için
interface Article {
  id: string
  title: string
  content: string
}

// ✅ Type - Union types için
type ArticleVariant = 'default' | 'featured' | 'compact'

// ✅ Type - Utility types için
type PartialArticle = Partial<Article>
```

---

## 2. Props Typing

### Öğrenilen (26 Ara 2025)

**Best Practice:** React component props için interface kullanın.

```tsx
interface ArticleCardProps {
  article: {
    id: string
    title: string
    slug: string
    excerpt?: string | null  // Optional ve nullable
    content: string
    imageUrl: string
    category: string
    viewCount: number
    publishedAt: Date | string  // Union type
    author: {
      name: string | null
      image: string | null
    }
  }
  variant?: 'default' | 'featured' | 'compact'  // Optional prop
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  // ...
}
```

---

## 3. Const Assertions

### Öğrenilen (26 Ara 2025)

**Best Practice:** Sabit değerler için `as const` kullanın.

```tsx
// ✅ Readonly ve literal types
export const CATEGORIES = [
  { id: 'gundem', name: 'Gündem', slug: 'gundem' },
  { id: 'ekonomi', name: 'Ekonomi', slug: 'ekonomi' },
] as const

// Type inference: readonly [{ readonly id: "gundem"; ... }, ...]
```

**Avantajlar:**
- Daha kesin type inference
- Değişiklik koruması
- Autocomplete desteği

---

## 4. Utility Functions Typing

### Öğrenilen (26 Ara 2025)

**Best Practice:** Utility fonksiyonları için açık return type belirtin.

```tsx
// ✅ Açık return type
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// ✅ Generic utility
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
```

---

## 5. Icon Component Typing

### Öğrenilen (26 Ara 2025)

**Problem:** Lucide React ikonlarını dinamik olarak kullanırken type safety sağlamak.

**Çözüm:** Icon map ile type-safe mapping.

```tsx
import { Newspaper, TrendingUp, Cpu } from 'lucide-react'

// Icon map type
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Newspaper,
  TrendingUp,
  Cpu,
}

// Kullanım
const Icon = iconMap[category.icon] || Newspaper
return <Icon className="w-6 h-6" />
```

---

## 6. Event Handler Typing

### Öğrenilen (26 Ara 2025)

**Best Practice:** Event handler'lar için doğru React event type'ları kullanın.

```tsx
// Form submit
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  // ...
}

// Input change
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEmail(e.target.value)
}

// Button click
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
}
```

---

## 7. Nullable Types

### Öğrenilen (26 Ara 2025)

**Best Practice:** Prisma'dan gelen nullable alanlar için `| null` kullanın.

```tsx
interface User {
  id: string
  email: string
  name: string | null      // Prisma'da nullable
  image: string | null     // Prisma'da nullable
}

// Kullanımda null check
{user.name && <span>{user.name}</span>}
{user.image ? (
  <Image src={user.image} alt={user.name || 'User'} />
) : (
  <DefaultAvatar />
)}
```

---

**Son Güncelleme:** 26 Aralık 2025
**Katkıda Bulunan:** Manus AI Agent
