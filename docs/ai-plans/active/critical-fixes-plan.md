# HaberNexus Kritik Sorunlar Geliştirme Planı

**Tarih:** 28 Ocak 2026  
**Plan Sürümü:** 1.0  
**Durum:** Hazır Geliştirmeye

---

## 1. Plan Özeti

Bu plan, HaberNexus projesinin 3 kritik sorununu çözmek için tasarlanmıştır:
1. Google OAuth yapılandırması eksik
2. Admin paneline erişim sorunu
3. Veritabanı seed verisi eksik

**Tahmini Süre:** 2-3 gün  
**Başlangıç:** 28 Ocak 2026

---

## 2. Sorun 1: Google OAuth Yapılandırması Eksik

### 2.1 Mevcut Durum
- `.env` dosyasında test credentials var
- Google OAuth provider yapılandırılmış
- Ama gerçek Google Cloud credentials eksik

### 2.2 Çözüm Adımları

#### Adım 1: Google Cloud Projesi Oluştur
**Dosya:** Yok (manuel işlem)  
**Süresi:** 5 dakika

1. https://console.cloud.google.com adresine git
2. Yeni proje oluştur: "HaberNexus Development"
3. Proje ID'sini not et

#### Adım 2: OAuth Consent Screen Yapılandır
**Dosya:** Yok (manuel işlem)  
**Süresi:** 5 dakika

1. "OAuth consent screen" sayfasına git
2. "External" seç (test için)
3. Uygulama adı: "HaberNexus"
4. Kullanıcı desteği e-postası: salihtanriseven25@gmail.com
5. Geliştirici e-postası: salihtanriseven25@gmail.com

#### Adım 3: OAuth Credentials Oluştur
**Dosya:** Yok (manuel işlem)  
**Süresi:** 5 dakika

1. "Credentials" sayfasına git
2. "Create Credentials" → "OAuth 2.0 Client ID"
3. "Web application" seç
4. Authorized redirect URIs ekle:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://habernexus.com/api/auth/callback/google`
5. Client ID ve Secret'ı kopyala

#### Adım 4: .env Dosyasını Güncelle
**Dosya:** `.env`  
**Süresi:** 2 dakika

```env
# Google OAuth
AUTH_GOOGLE_ID=<your-client-id-from-google-cloud>
AUTH_GOOGLE_SECRET=<your-client-secret-from-google-cloud>
```

#### Adım 5: auth.config.ts Doğrula
**Dosya:** `auth.config.ts`  
**Süresi:** 2 dakika

Mevcut konfigürasyonu kontrol et:
```typescript
import Google from "next-auth/providers/google"

export default {
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
}
```

### 2.3 Doğrulama
```bash
# Dev server başlat
npm run dev

# Tarayıcıda test et
# http://localhost:3000/auth/signin
# Google ile Giriş Yap butonuna tıkla
# Google login flow'u test et
```

---

## 3. Sorun 2: Admin Paneline Erişim Sorunu

### 3.1 Mevcut Durum
- Google OAuth olmadan session oluşturulamıyor
- Test kullanıcısı veritabanında var ama oturum açılamıyor
- Admin layout'ı session kontrol ediyor

### 3.2 Çözüm Adımları

#### Adım 1: Google OAuth Yapılandırmasını Tamamla
**Bağımlılık:** Sorun 1'in tamamlanması gerekli

#### Adım 2: Test Kullanıcısı ile Giriş Yap
**Dosya:** Yok (manuel işlem)  
**Süresi:** 5 dakika

1. http://localhost:3000/auth/signin adresine git
2. "Google ile Giriş Yap" butonuna tıkla
3. Google hesabı seç (test hesabı)
4. Giriş yap
5. Admin paneline yönlendirilmeli

#### Adım 3: Admin Paneli Erişimini Test Et
**Dosya:** Yok (manuel işlem)  
**Süresi:** 5 dakika

1. Giriş yaptıktan sonra http://localhost:3000/admin adresine git
2. Admin dashboard'ı görüntülenebilir mi?
3. Sidebar navigasyonu çalışıyor mu?
4. Sayfalar yükleniyor mu?

#### Adım 4: Session Yönetimini Doğrula
**Dosya:** `app/admin/layout.tsx`  
**Süresi:** 5 dakika

Mevcut session kontrolünü doğrula:
```typescript
// Check if user is authenticated
if (!session?.user) {
  router.push('/auth/signin')
  return null
}

// Check if user has ADMIN role
if (session.user.role !== 'ADMIN') {
  router.push('/?error=unauthorized')
  return null
}
```

### 3.3 Sorun Giderme

**Problem:** "Unauthorized" hatası  
**Çözüm:** Kullanıcının ADMIN rolü olduğunu doğrula
```bash
# Veritabanını kontrol et
sqlite3 data.db "SELECT email, role FROM User;"
```

**Problem:** Session oluşturulmuyor  
**Çözüm:** AUTH_SECRET kontrol et
```env
AUTH_SECRET="dev-secret-key-for-testing-only-12345678901234567890"
```

---

## 4. Sorun 3: Veritabanı Seed Verisi Eksik

### 4.1 Mevcut Durum
- Veritabanı şeması oluşturulmuş
- Ama başlangıç verileri yok
- Kategoriler hardcoded
- Prompt şablonları yok

### 4.2 Çözüm Adımları

#### Adım 1: Seed Dosyası Oluştur
**Dosya:** `prisma/seed.ts`  
**Süresi:** 30 dakika

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // 1. Seed System Settings
  await seedSystemSettings()
  
  // 2. Seed Prompt Templates
  await seedPromptTemplates()
  
  // 3. Seed RSS Feeds
  await seedRssFeeds()
  
  // 4. Seed Image Settings
  await seedImageSettings()
  
  console.log('✅ Seeding completed!')
}

async function seedSystemSettings() {
  // site_name, site_description, default_category
}

async function seedPromptTemplates() {
  // CONTENT, IMAGE, SENTIMENT, CATEGORY, SUMMARY
}

async function seedRssFeeds() {
  // Örnek RSS kaynakları
}

async function seedImageSettings() {
  // Görsel optimizasyon ayarları
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

#### Adım 2: System Settings Seed'i Implement Et
**Dosya:** `prisma/seed.ts`  
**Süresi:** 10 dakika

```typescript
async function seedSystemSettings() {
  const settings = [
    {
      key: 'site_name',
      value: 'HaberNexus'
    },
    {
      key: 'site_description',
      value: 'Yeni Nesil AI Destekli Haber Platformu'
    },
    {
      key: 'default_category',
      value: 'Gündem'
    }
  ]
  
  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
  }
}
```

#### Adım 3: Prompt Templates Seed'i Implement Et
**Dosya:** `prisma/seed.ts`  
**Süresi:** 20 dakika

```typescript
async function seedPromptTemplates() {
  const templates = [
    {
      name: 'content_generation',
      displayName: 'İçerik Üretim Promptu',
      type: 'CONTENT',
      template: 'Aşağıdaki konu hakkında...',
      variables: JSON.stringify(['title', 'content']),
      isDefault: true
    },
    // ... diğer template'ler
  ]
  
  for (const template of templates) {
    await prisma.promptTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template
    })
  }
}
```

#### Adım 4: RSS Feeds Seed'i Implement Et
**Dosya:** `prisma/seed.ts`  
**Süresi:** 10 dakika

```typescript
async function seedRssFeeds() {
  const feeds = [
    {
      url: 'https://example.com/rss/teknoloji',
      name: 'Teknoloji Haberleri',
      category: 'Teknoloji',
      topicsPerRun: 2
    },
    // ... diğer feed'ler
  ]
  
  for (const feed of feeds) {
    await prisma.rssFeed.upsert({
      where: { url: feed.url },
      update: feed,
      create: feed
    })
  }
}
```

#### Adım 5: Image Settings Seed'i Implement Et
**Dosya:** `prisma/seed.ts`  
**Süresi:** 10 dakika

```typescript
async function seedImageSettings() {
  const settings = [
    {
      key: 'max_width',
      value: '1200'
    },
    {
      key: 'max_height',
      value: '800'
    },
    {
      key: 'quality',
      value: '80'
    },
    {
      key: 'format',
      value: 'webp'
    }
  ]
  
  for (const setting of settings) {
    await prisma.imageSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
  }
}
```

#### Adım 6: package.json'a Seed Komutu Ekle
**Dosya:** `package.json`  
**Süresi:** 2 dakika

```json
{
  "scripts": {
    "seed": "node --loader ts-node/esm prisma/seed.ts",
    "seed:reset": "npx prisma migrate reset --force"
  }
}
```

#### Adım 7: Seed'i Çalıştır
**Dosya:** Yok (komut)  
**Süresi:** 5 dakika

```bash
# Seed'i çalıştır
npm run seed

# Veritabanını kontrol et
sqlite3 data.db "SELECT COUNT(*) FROM SystemSetting;"
sqlite3 data.db "SELECT COUNT(*) FROM PromptTemplate;"
```

### 4.3 Doğrulama

```bash
# Veritabanı içeriğini kontrol et
sqlite3 data.db ".tables"
sqlite3 data.db "SELECT * FROM SystemSetting;"
sqlite3 data.db "SELECT * FROM PromptTemplate LIMIT 1;"
sqlite3 data.db "SELECT * FROM ImageSettings;"
```

---

## 5. Entegrasyon Testi

### 5.1 Tam Flow Testi

1. **Dev Server Başlat**
   ```bash
   npm run dev
   ```

2. **Google ile Giriş Yap**
   - http://localhost:3000/auth/signin
   - Google hesabı seç
   - Giriş yap

3. **Admin Paneline Erişim**
   - http://localhost:3000/admin
   - Dashboard görüntüleniyor mu?

4. **Ayarlar Sayfasını Test Et**
   - http://localhost:3000/admin/ayarlar
   - Seed verileri yükleniyor mu?

5. **RSS Sayfasını Test Et**
   - http://localhost:3000/admin/rss
   - Seed RSS kaynakları görünüyor mu?

### 5.2 Hata Kontrolü

```bash
# Build test
npm run build

# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint
```

---

## 6. Micro-Step Implementation Planı

### Faz 1: Google OAuth (1 gün)
- [ ] Google Cloud projesi oluştur
- [ ] OAuth credentials oluştur
- [ ] .env dosyasını güncelle
- [ ] Giriş flow'unu test et

### Faz 2: Admin Erişimi (1 gün)
- [ ] Google OAuth'ı doğrula
- [ ] Admin paneline erişim test et
- [ ] Session yönetimini doğrula
- [ ] Hata giderme

### Faz 3: Seed Verileri (1 gün)
- [ ] seed.ts dosyası oluştur
- [ ] System Settings seed'i implement et
- [ ] Prompt Templates seed'i implement et
- [ ] RSS Feeds seed'i implement et
- [ ] Image Settings seed'i implement et
- [ ] Seed'i çalıştır ve doğrula

### Faz 4: Entegrasyon Testi (0.5 gün)
- [ ] Tam flow testi
- [ ] Hata kontrolü
- [ ] Dokümantasyon güncelle

---

## 7. Başarı Kriterleri

✅ Google OAuth ile giriş yapılabiliyor  
✅ Admin paneline erişim sağlanıyor  
✅ Seed verileri veritabanında var  
✅ Admin dashboard sayfaları yükleniyor  
✅ Ayarlar sayfası seed verilerini gösteriyor  
✅ Tüm testler geçiyor  

---

## 8. Sonraki Adımlar

1. Bu planı implement et
2. Tüm testleri çalıştır
3. Değişiklikleri commit et
4. Sorun 2 (Görsel Optimizasyon) planına geç
5. Sorun 3 (Duygu Analizi) planına geç

---

## 9. Referanslar

- Auth.js Documentation: https://authjs.dev
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Prisma Seeding: https://www.prisma.io/docs/orm/prisma-client/seed-database
- Next.js Admin Patterns: https://nextjs.org/docs
