# API Anahtarları Yönetim Sistemi Geliştirme Planı

**Tarih:** 17 Ocak 2026  
**Geliştirici:** AI Agent  
**Durum:** Aktif

---

## 1. Genel Bakış

Bu plan, HaberNexus admin paneline API anahtarları yönetim sistemi eklenmesini kapsar. Sistem, admin kullanıcılarının API anahtarlarını güvenli bir şekilde görüntülemesine, düzenlemesine, eklemesine ve kaldırmasına olanak tanıyacaktır.

## 2. Mevcut Durum Analizi

### Mevcut API Anahtarları (`.env` dosyasından)
| Anahtar | Kullanım Amacı | Kaynak |
|---------|----------------|--------|
| `AUTH_SECRET` | Auth.js oturum şifreleme | Sistem |
| `GOOGLE_CLIENT_ID` | Google OAuth kimlik doğrulama | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth kimlik doğrulama | Google Cloud Console |
| `GEMINI_API_KEY` | AI içerik üretimi ve görsel oluşturma | Google AI Studio |

### Mevcut Yapı
- API anahtarları `.env` dosyasında saklanıyor
- Sunucu tarafında `process.env` ile erişiliyor
- Admin panelde API anahtarlarını yönetme özelliği yok

## 3. Tasarım Kararları

### 3.1 Güvenlik Yaklaşımı
- API anahtarları veritabanında **şifrelenmiş** olarak saklanacak
- Frontend'de anahtarlar **maskelenmiş** gösterilecek (örn: `sk-...****1234`)
- Tam anahtar sadece "Göster" butonuna tıklandığında görünecek
- Tüm işlemler için admin yetkisi zorunlu

### 3.2 Veritabanı Şeması
Yeni bir `ApiKey` modeli oluşturulacak:
```prisma
model ApiKey {
  id          String   @id @default(cuid())
  name        String   // Görünen ad (örn: "Gemini API Key")
  key         String   // Anahtar adı (örn: "GEMINI_API_KEY")
  value       String   // Şifrelenmiş değer
  description String?  // Açıklama
  isActive    Boolean  @default(true)
  lastUsed    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([key])
}
```

### 3.3 Şifreleme Stratejisi
- AES-256-GCM şifreleme kullanılacak
- Şifreleme anahtarı `AUTH_SECRET` environment variable'dan türetilecek
- Bu sayede `.env` dosyasına ek bir anahtar eklenmesine gerek kalmayacak

## 4. Uygulama Adımları

### Adım 1: Prisma Şeması Güncelleme
- [ ] `ApiKey` modelini `schema.prisma`'ya ekle
- [ ] `npx prisma generate` çalıştır
- [ ] `npx prisma db push` çalıştır
- [ ] Doğrulama: `npx tsc --noEmit`

### Adım 2: Şifreleme Utility Oluşturma
- [ ] `lib/encryption.ts` dosyası oluştur
- [ ] `encrypt()` ve `decrypt()` fonksiyonları ekle
- [ ] Doğrulama: `npx tsc --noEmit`

### Adım 3: API Route'ları Oluşturma
- [ ] `app/api/admin/api-keys/route.ts` - GET (liste), POST (ekle)
- [ ] `app/api/admin/api-keys/[id]/route.ts` - GET (detay), PUT (güncelle), DELETE (sil)
- [ ] Doğrulama: `npm run lint && npm run build`

### Adım 4: Admin Panel Sayfası Oluşturma
- [ ] `app/admin/api-anahtarlari/page.tsx` oluştur
- [ ] API anahtarları listesi bileşeni
- [ ] Ekleme/düzenleme modal bileşeni
- [ ] Doğrulama: `npm run build`

### Adım 5: Sidebar'a Menü Ekleme
- [ ] `app/admin/layout.tsx` güncelle
- [ ] Yeni menü öğesi ekle
- [ ] Doğrulama: `npm run build`

### Adım 6: Mevcut API Key Kullanımını Güncelleme
- [ ] `lib/gemini.ts` güncelle - veritabanından API key okuma
- [ ] `lib/imagen.ts` güncelle - veritabanından API key okuma
- [ ] Fallback olarak `.env` değerlerini kullan
- [ ] Doğrulama: `npm run build && npm run dev`

### Adım 7: Migration Script
- [ ] Mevcut `.env` API anahtarlarını veritabanına aktaran script
- [ ] İlk kurulumda otomatik çalışacak

## 5. UI/UX Tasarımı

### Ana Sayfa Görünümü
```
┌─────────────────────────────────────────────────────────────┐
│ 🔑 API Anahtarları                           [+ Yeni Ekle]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Gemini API Key                                    ✅ Aktif│ │
│ │ GEMINI_API_KEY                                          │ │
│ │ AIza...****7890                    [Göster] [✏️] [🗑️]   │ │
│ │ Son kullanım: 17 Ocak 2026, 14:30                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Google OAuth Client ID                            ✅ Aktif│ │
│ │ GOOGLE_CLIENT_ID                                        │ │
│ │ 1234...****5678.apps.googleusercontent.com [Göster] [✏️]│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Ekleme/Düzenleme Modal
```
┌─────────────────────────────────────────────────────────────┐
│ API Anahtarı Ekle                                    [X]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Görünen Ad *                                                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Gemini API Key                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Anahtar Adı (Environment Variable) *                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ GEMINI_API_KEY                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Değer *                                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ••••••••••••••••••••••••••••••••••••        [👁️]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Açıklama                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Google AI Studio'dan alınan API anahtarı                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ☑️ Aktif                                                    │
│                                                             │
│                              [İptal]  [Kaydet]              │
└─────────────────────────────────────────────────────────────┘
```

## 6. Güvenlik Kontrolleri

- [ ] Tüm endpoint'lerde admin yetkisi kontrolü
- [ ] Rate limiting uygulanması
- [ ] Audit log tutulması (opsiyonel)
- [ ] XSS ve CSRF koruması

## 7. Test Senaryoları

- [ ] API anahtarı ekleme
- [ ] API anahtarı görüntüleme (maskelenmiş)
- [ ] API anahtarı tam gösterme
- [ ] API anahtarı düzenleme
- [ ] API anahtarı silme
- [ ] API anahtarı aktif/pasif yapma
- [ ] Yetkisiz erişim denemeleri

## 8. Dokümantasyon

- [ ] Wiki sayfası güncelleme
- [ ] ROADMAP.md güncelleme
- [ ] README.md güncelleme (gerekirse)

---

**Son Güncelleme:** 17 Ocak 2026
