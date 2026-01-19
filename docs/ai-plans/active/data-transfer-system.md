# Veri Aktarım Sistemi Geliştirme Planı

**Tarih:** 19 Ocak 2026  
**Geliştirici:** AI Agent (Manus)  
**Durum:** Aktif

---

## 1. Özet

Bu plan, HaberNexus admin paneline veri aktarım sistemi eklemeyi amaçlamaktadır. Sistem, eski bir VM'den yeni bir VM'e tüm verilerin (veritabanı ve ayarlar) güvenli bir şekilde aktarılmasını sağlayacaktır.

## 2. Gereksinimler

### Fonksiyonel Gereksinimler
- [ ] Admin panelden "Veri Aktar" butonu ile export başlatma
- [ ] Tek kullanımlık aktarım kodu oluşturma
- [ ] Şifreli veri paketi indirme
- [ ] Yeni kurulumda aktarım kodu ile import yapma
- [ ] Tüm veritabanı tablolarının aktarılması
- [ ] Ortam değişkenlerinin aktarılması (opsiyonel)

### Teknik Gereksinimler
- [ ] AES-256-GCM şifreleme
- [ ] gzip sıkıştırma
- [ ] 24 saat geçerlilik süresi
- [ ] Admin yetkisi kontrolü
- [ ] Hata yönetimi ve geri alma

## 3. Mimari Tasarım

### 3.1 Veritabanı Şeması Değişiklikleri

Yeni model: `DataTransfer`

```prisma
model DataTransfer {
  id          String   @id @default(cuid())
  code        String   @unique // Aktarım kodu (UUID)
  secretKey   String   // Şifreleme anahtarı (hash)
  status      String   @default("pending") // pending, ready, used, expired
  expiresAt   DateTime // Geçerlilik süresi
  createdAt   DateTime @default(now())
  usedAt      DateTime?
  createdBy   String   // Admin user ID
  
  @@index([code])
  @@index([status])
}
```

### 3.2 API Endpoints

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/admin/data-transfer/export` | POST | Export başlatır, kod ve anahtar döner |
| `/api/admin/data-transfer/status/[code]` | GET | Export durumunu kontrol eder |
| `/api/admin/data-transfer/download/[code]` | GET | Veri paketini indirir |
| `/api/admin/data-transfer/import` | POST | Veri paketini içe aktarır |

### 3.3 Veri Paketi Yapısı

```json
{
  "version": "1.0",
  "createdAt": "2026-01-19T12:00:00Z",
  "source": "habernexus.com",
  "tables": {
    "users": [...],
    "articles": [...],
    "rssFeeds": [...],
    "systemSettings": [...],
    "promptTemplates": [...],
    ...
  },
  "settings": {
    "envVariables": {...}
  },
  "checksum": "sha256..."
}
```

## 4. Adım Adım Uygulama

### Adım 1: Prisma Schema Güncelleme
- [ ] DataTransfer modeli ekleme
- [ ] `npx prisma generate` çalıştırma
- [ ] `npx prisma db push` çalıştırma
- [ ] Doğrulama: `npx tsc --noEmit`

### Adım 2: Yardımcı Fonksiyonlar
- [ ] `lib/data-transfer/encryption.ts` - Şifreleme fonksiyonları
- [ ] `lib/data-transfer/export.ts` - Export fonksiyonları
- [ ] `lib/data-transfer/import.ts` - Import fonksiyonları
- [ ] Doğrulama: `npm run build`

### Adım 3: Export API Endpoint
- [ ] `/api/admin/data-transfer/export/route.ts`
- [ ] Tüm tabloları JSON'a dönüştürme
- [ ] Şifreleme ve sıkıştırma
- [ ] Aktarım kodu oluşturma
- [ ] Doğrulama: `npm run build`

### Adım 4: Download API Endpoint
- [ ] `/api/admin/data-transfer/download/[code]/route.ts`
- [ ] Kod doğrulama
- [ ] Dosya indirme
- [ ] Doğrulama: `npm run build`

### Adım 5: Import API Endpoint
- [ ] `/api/admin/data-transfer/import/route.ts`
- [ ] Dosya yükleme ve doğrulama
- [ ] Şifre çözme
- [ ] Veritabanına aktarma
- [ ] Doğrulama: `npm run build`

### Adım 6: Admin Panel UI - Sayfa
- [ ] `/app/admin/veri-aktarimi/page.tsx`
- [ ] Export ve Import sekmeleri
- [ ] Doğrulama: `npm run build`

### Adım 7: Admin Panel UI - Bileşenler
- [ ] Export formu ve kod gösterimi
- [ ] Import formu ve dosya yükleme
- [ ] İlerleme göstergesi
- [ ] Doğrulama: `npm run build`

### Adım 8: Admin Layout Güncelleme
- [ ] Sidebar'a "Veri Aktarımı" linki ekleme
- [ ] Doğrulama: `npm run build`

### Adım 9: Test ve Dokümantasyon
- [ ] Manuel test
- [ ] Wiki güncellemesi
- [ ] ROADMAP güncellemesi

## 5. Güvenlik Önlemleri

1. **Şifreleme:** AES-256-GCM ile tüm veriler şifrelenir
2. **Tek Kullanımlık Kod:** Her aktarım için benzersiz kod
3. **Zaman Sınırı:** 24 saat geçerlilik
4. **Admin Yetkisi:** Sadece admin kullanıcılar erişebilir
5. **Checksum:** Veri bütünlüğü kontrolü

## 6. Hata Senaryoları

| Senaryo | Çözüm |
|---------|-------|
| Kod süresi dolmuş | Yeni export oluşturulmalı |
| Şifre çözme hatası | Yanlış anahtar, yeniden dene |
| Veri bütünlüğü hatası | Checksum uyuşmazlığı, yeniden indir |
| Import sırasında hata | Transaction rollback |

## 7. Dosya Yapısı

```
app/
├── admin/
│   └── veri-aktarimi/
│       └── page.tsx
├── api/
│   └── admin/
│       └── data-transfer/
│           ├── export/
│           │   └── route.ts
│           ├── download/
│           │   └── [code]/
│           │       └── route.ts
│           ├── import/
│           │   └── route.ts
│           └── status/
│               └── [code]/
│                   └── route.ts
lib/
└── data-transfer/
    ├── encryption.ts
    ├── export.ts
    ├── import.ts
    └── types.ts
```

## 8. Zaman Tahmini

| Adım | Süre |
|------|------|
| Schema güncelleme | 10 dk |
| Yardımcı fonksiyonlar | 30 dk |
| Export API | 30 dk |
| Download API | 15 dk |
| Import API | 45 dk |
| Admin UI | 60 dk |
| Test ve dokümantasyon | 30 dk |
| **Toplam** | **~4 saat** |

---

## Notlar

- Her adımdan sonra doğrulama komutları çalıştırılacak
- Hatalar anında dokümante edilecek
- Küçük, artımlı değişiklikler yapılacak
