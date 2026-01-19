# Veri Aktarım Sistemi Araştırma Notları

**Tarih:** 19 Ocak 2026  
**Konu:** Admin Panel Veri Aktarım Sistemi Tasarımı

---

## Araştırma Bulguları

### 1. Benzer Sistemlerin Analizi

#### Django Import-Export
- Admin paneline entegre import/export butonları
- İki aşamalı import süreci (dosya seçimi + onay)
- Geçici depolama mekanizması (dosya sistemi, cache veya S3)
- Güvenlik için hassas verilerin yönetimi önemli

#### Temel Prensipler
- **Basitlik:** Kullanıcı tek bir dosya indirip yeni sisteme yükleyebilmeli
- **Güvenlik:** Veriler şifrelenmiş olmalı, aktarım kodu tek kullanımlık olmalı
- **Bütünlük:** Tüm veriler eksiksiz aktarılmalı

### 2. Teknik Yaklaşımlar

#### SQLite Veritabanı Aktarımı
- SQLite tek dosyalı veritabanı olduğu için aktarım kolay
- Veritabanı dosyası doğrudan kopyalanabilir
- JSON formatına dönüştürme de mümkün

#### Veri Formatı Seçenekleri
1. **SQLite Dump:** Veritabanı dosyasının doğrudan aktarımı
2. **JSON Export:** Tüm tabloların JSON formatında dışa aktarımı
3. **Şifreli Paket:** Tüm verilerin şifrelenmiş tek dosya olarak aktarımı

### 3. Güvenlik Gereksinimleri

- Aktarım dosyası şifrelenmiş olmalı
- Tek kullanımlık aktarım kodu/token
- Zaman sınırlı geçerlilik (örn: 24 saat)
- Admin yetkisi zorunlu

---

## Önerilen Mimari

### Akış Diyagramı

```
ESKİ SUNUCU                          YENİ SUNUCU
┌──────────────────┐                 ┌──────────────────┐
│ Admin Panel      │                 │ Admin Panel      │
│                  │                 │                  │
│ 1. "Veri Aktar"  │                 │ 4. "Veri Al"     │
│    butonuna tık  │                 │    butonuna tık  │
│                  │                 │                  │
│ 2. Aktarım kodu  │ ─── Kod ───>    │ 5. Kodu gir      │
│    oluştur       │                 │                  │
│                  │                 │                  │
│ 3. Verileri      │                 │ 6. Verileri      │
│    hazırla       │ ─── İndir ───>  │    içe aktar     │
└──────────────────┘                 └──────────────────┘
```

### Aktarılacak Veriler

1. **Veritabanı Tabloları:**
   - User, Account, Session
   - Article, RssFeed
   - SystemSetting, PromptTemplate
   - ImageSettings, DeploymentSettings
   - Comment, Bookmark, ArticleVote
   - Follow, Notification
   - NewsletterSubscription, ContactMessage

2. **Ortam Değişkenleri:**
   - API anahtarları (opsiyonel, güvenlik nedeniyle)
   - Sistem ayarları

3. **Medya Dosyaları:**
   - Yüklenen görseller (public/uploads)

### API Endpoint Tasarımı

#### Export API
```
POST /api/admin/data-transfer/export
- Aktarım paketi oluşturur
- Şifreli dosya ve aktarım kodu döner

GET /api/admin/data-transfer/download/[code]
- Aktarım paketini indirir
- Tek kullanımlık kod ile erişim
```

#### Import API
```
POST /api/admin/data-transfer/import
- Aktarım kodunu veya dosyayı alır
- Verileri içe aktarır
- Mevcut verileri yedekler (opsiyonel)
```

---

## Uygulama Planı

### Faz 1: Backend API
1. Export endpoint oluşturma
2. Import endpoint oluşturma
3. Şifreleme/şifre çözme mekanizması
4. Aktarım kodu yönetimi

### Faz 2: Admin Panel UI
1. Veri Aktarım sayfası
2. Export butonu ve kod gösterimi
3. Import formu ve ilerleme göstergesi
4. Başarı/hata mesajları

### Faz 3: Test ve Dokümantasyon
1. Uçtan uca test
2. Kullanıcı dokümantasyonu
3. Hata senaryoları

---

## Teknoloji Seçimleri

- **Şifreleme:** AES-256-GCM (Node.js crypto modülü)
- **Veri Formatı:** JSON (tüm tablolar)
- **Sıkıştırma:** gzip
- **Aktarım Kodu:** UUID v4 + timestamp
- **Geçerlilik Süresi:** 24 saat
