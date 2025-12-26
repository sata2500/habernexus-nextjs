# ERR-002: Module Not Found - Eksik Bağımlılıklar

**Tarih:** 26 Aralık 2025  
**Hata Tipi:** Runtime Error  
**Öncelik:** Yüksek  
**Durum:** ✅ Çözüldü

## Hata Özeti

Kullanıcı yerel makinede `npm run dev` komutunu çalıştırdığında "Module not found" hataları alıyordu.

## Hata Mesajları

```
Module not found: Can't resolve 'clsx'
Module not found: Can't resolve 'lucide-react'
Module not found: Can't resolve 'tailwind-merge'
```

## Etkilenen Dosyalar

| Dosya | Eksik Modül |
|-------|-------------|
| `lib/utils.ts` | clsx, tailwind-merge |
| `components/layout/Header.tsx` | lucide-react |
| `components/layout/Footer.tsx` | lucide-react |
| `components/articles/ArticleCard.tsx` | lucide-react |
| `components/home/HeroSection.tsx` | lucide-react |
| `components/home/CategorySection.tsx` | lucide-react |
| `components/home/LatestNews.tsx` | lucide-react |
| `components/home/PopularNews.tsx` | lucide-react |
| `components/home/NewsletterSection.tsx` | lucide-react |

## Kök Neden Analizi

### Sorun
Kullanıcı repoyu klonladıktan sonra `npm install` komutunu çalıştırmamış veya bağımlılıklar düzgün yüklenmemiş.

### Kontrol Edilenler
1. ✅ `package.json` dosyasında bağımlılıklar tanımlı
2. ✅ `package-lock.json` dosyası GitHub'da mevcut
3. ✅ Sandbox ortamında `node_modules` klasöründe paketler mevcut
4. ✅ Build başarılı (3.8s içinde derlendi)

## Çözüm

### Kullanıcı İçin Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/sata2500/habernexus-nextjs.git
cd habernexus-nextjs

# 2. Bağımlılıkları yükle (ÖNEMLİ!)
npm install

# 3. .env dosyasını oluştur
cp .env.example .env

# 4. Prisma client oluştur
npx prisma generate
npx prisma db push

# 5. Development server'ı başlat
npm run dev
```

### Önemli Not
`npm install` komutu mutlaka çalıştırılmalıdır. Bu komut `package.json` ve `package-lock.json` dosyalarını okuyarak tüm bağımlılıkları `node_modules` klasörüne indirir.

## Önleme Stratejileri

1. **README.md Güncelleme:** Kurulum adımlarını daha belirgin hale getir
2. **Postinstall Script:** `package.json`'a postinstall script eklenebilir
3. **Hata Mesajı İyileştirme:** Next.js config'de daha açıklayıcı hata mesajları

## İlgili Dosyalar

- `package.json` - Bağımlılık tanımları
- `package-lock.json` - Bağımlılık kilitleri
- `README.md` - Kurulum talimatları

## Referanslar

- [Next.js Module Not Found](https://nextjs.org/docs/messages/module-not-found)
- [npm install Documentation](https://docs.npmjs.com/cli/v10/commands/npm-install)

## Öğrenilen Dersler

1. Kullanıcı hata raporlarında her zaman `npm install` çalıştırılıp çalıştırılmadığını sor
2. README.md'deki kurulum adımlarını daha görünür yap
3. CI/CD pipeline'da bağımlılık kontrolü ekle
