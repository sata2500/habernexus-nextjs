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
- [x] `ApiKey` modelini `schema.prisma`'ya ekle
- [x] `npx prisma generate` çalıştır
- [x] `npx prisma db push` çalıştır
- [x] Doğrulama: `npx tsc --noEmit`

### Adım 2: Şifreleme Utility Oluşturma
- [x] `lib/encryption.ts` dosyası oluştur
- [x] `encrypt()` ve `decrypt()` fonksiyonları ekle
- [x] Doğrulama: `npx tsc --noEmit`

### Adım 3: API Route'ları Oluşturma
- [x] `app/api/admin/api-keys/route.ts` - GET (liste), POST (ekle)
- [x] `app/api/admin/api-keys/[id]/route.ts` - GET (detay), PUT (güncelle), DELETE (sil)
- [x] `app/api/admin/api-keys/sync/route.ts` - GET (sync durumu), POST (sync)
- [x] Doğrulama: `npm run lint && npm run build`

### Adım 4: Admin Panel Sayfası Oluşturma
- [x] `app/admin/api-anahtarlari/page.tsx` oluştur
- [x] API anahtarları listesi bileşeni
- [x] Ekleme/düzenleme modal bileşeni
- [x] .env senkronizasyon arayüzü
- [x] Doğrulama: `npm run build`

### Adım 5: Sidebar'a Menü Ekleme
- [x] `app/admin/layout.tsx` güncelle
- [x] Yeni menü öğesi ekle
- [x] Doğrulama: `npm run build`

### Adım 6: Mevcut API Key Kullanımını Güncelleme
- [x] `lib/gemini.ts` güncelle - veritabanından API key okuma
- [x] `lib/imagen.ts` güncelle - veritabanından API key okuma
- [x] Fallback olarak `.env` değerlerini kullan
- [x] Doğrulama: `npm run build && npm run dev`

### Adım 7: Migration Script
- [x] Mevcut `.env` API anahtarlarını veritabanına aktaran sync API
- [x] Admin panelden tek tıkla senkronizasyon

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
