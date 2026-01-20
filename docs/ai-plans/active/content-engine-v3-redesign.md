# HaberNexus Content Engine v3.0 - Yeniden Tasarım Planı

**Tarih:** 20 Ocak 2026  
**Versiyon:** 3.0  
**Durum:** Aktif Geliştirme

---

## 1. Mevcut Sistemin Analizi

### 1.1 Mevcut Sorunlar
- Aşırı karmaşık modül yapısı (unified-content-engine, topic-selector, research-agent, content-synthesizer)
- Gereksiz ayarlar ve yapılandırma seçenekleri
- Birden fazla pipeline modu (quick, standard, preview, test)
- Dağınık görsel üretim mantığı

### 1.2 Silinecek/Birleştirilecek Dosyalar
- `lib/unified-content-engine.ts` → Yeniden yazılacak
- `lib/topic-selector.ts` → Basitleştirilecek
- `lib/research-agent.ts` → İçerik üretimine entegre edilecek
- `lib/content-synthesizer.ts` → Kaldırılacak

---

## 2. Yeni Mimari Tasarım

### 2.1 Temel Prensipler
1. **Basitlik:** Tek bir ana modül, net akış
2. **Güçlülük:** Google Search grounding ile derin araştırma
3. **Esneklik:** Manuel ve otomatik tetikleme
4. **Kontrol:** Admin panelden tam yönetim

### 2.2 Yeni Modül Yapısı

```
lib/
├── content-engine/
│   ├── index.ts              # Ana export ve orchestrator
│   ├── rss-collector.ts      # RSS toplama
│   ├── trend-analyzer.ts     # Trend analizi ve seçim
│   ├── article-generator.ts  # İçerik üretimi (Google Search grounding)
│   ├── image-handler.ts      # Görsel yönetimi (3 mod)
│   └── types.ts              # Tip tanımları
├── gemini-client.ts          # Tekil Gemini client
└── cache-manager.ts          # Önbellekleme
```

### 2.3 Veri Akışı

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT ENGINE v3.0                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. RSS TOPLAMA                                                 │
│     └─ Aktif RSS kaynaklarından başlıkları çek                  │
│     └─ Her kaynak için belirlenen sayıda başlık al              │
│                                                                 │
│  2. TREND ANALİZİ                                               │
│     └─ AI ile trend skorlaması                                  │
│     └─ Her kategoriden belirlenen sayıda seç                    │
│     └─ Mevcut makalelerle çakışma kontrolü                      │
│                                                                 │
│  3. İÇERİK ÜRETİMİ                                              │
│     └─ Google Search grounding ile araştırma                    │
│     └─ Profesyonel haber makalesi oluşturma                     │
│     └─ SEO meta verileri, duygu analizi                         │
│     └─ Kategori yazarı atama                                    │
│                                                                 │
│  4. GÖRSEL İŞLEME                                               │
│     └─ Mod seçimi (RSS/AI özgün/AI benzer)                      │
│     └─ WebP optimizasyonu                                       │
│     └─ İçerik içi görsel yerleştirme                            │
│                                                                 │
│  5. YAYINLAMA                                                   │
│     └─ Veritabanına kayıt                                       │
│     └─ İstatistik güncelleme                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Veritabanı Değişiklikleri

### 3.1 RssFeed Modeli Güncellemesi
```prisma
model RssFeed {
  id              String   @id @default(cuid())
  url             String   @unique
  name            String
  category        String
  isActive        Boolean  @default(true)
  topicsPerRun    Int      @default(2)      // Her çalıştırmada kaç haber
  authorId        String?                    // Kategori yazarı
  imageMode       String   @default("auto") // "rss" | "ai_original" | "ai_similar" | "auto"
  lastFetch       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  author          User?    @relation(fields: [authorId], references: [id])
  
  @@index([isActive])
  @@index([category])
}
```

### 3.2 Article Modeli Güncellemesi
```prisma
model Article {
  // Mevcut alanlar...
  
  // Yeni alanlar
  summaryCache    String?  // Önbelleklenmiş özet
  summaryCachedAt DateTime? // Özet önbellek zamanı
  sourceFeedId    String?  // Kaynak RSS feed
  researchSources String?  // JSON: Araştırma kaynakları
}
```

### 3.3 Yeni ContentEngineSettings Modeli
```prisma
model ContentEngineSettings {
  id                    String   @id @default(cuid())
  key                   String   @unique
  value                 String
  description           String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## 4. Admin Panel Değişiklikleri

### 4.1 RSS Yönetimi Sayfası
- Kategori bazlı RSS kaynakları listesi
- Her kaynak için:
  - Aktif/Pasif durumu
  - Kategori seçimi
  - Çalıştırma başına haber sayısı
  - Yazar ataması
  - Görsel modu seçimi

### 4.2 İçerik Motoru Sayfası
- Manuel tetikleme butonu
- Önizleme modu (sadece seçilen konuları göster)
- Son çalıştırma istatistikleri
- Zamanlayıcı ayarları

### 4.3 Ayarlar Sayfası
- AI model seçimi (içerik, görsel, özet)
- Görsel kalite ayarları
- Önbellek süreleri

---

## 5. API Endpoints

### 5.1 Yeni Endpoints
```
POST /api/admin/content-engine/run
  - mode: "full" | "preview"
  - feedId?: string (opsiyonel, belirli feed için)

GET /api/admin/content-engine/status
  - Son çalıştırma durumu ve istatistikleri

POST /api/admin/content-engine/settings
  - Ayarları güncelle

GET /api/admin/rss/feeds
  - Tüm RSS kaynaklarını listele

POST /api/admin/rss/feeds
  - Yeni RSS kaynağı ekle

PUT /api/admin/rss/feeds/:id
  - RSS kaynağını güncelle (yazar, görsel modu dahil)
```

---

## 6. Görsel İşleme Sistemi

### 6.1 Üç Görsel Modu

| Mod | Açıklama | Kullanım |
|-----|----------|----------|
| `rss` | RSS'den gelen görseli kullan | Orijinal görsel uygunsa |
| `ai_original` | AI ile tamamen özgün görsel | Yaratıcı içerikler |
| `ai_similar` | RSS görseline benzer AI üretimi | Telif hakları için |
| `auto` | AI otomatik karar verir | Varsayılan |

### 6.2 Görsel İşleme Akışı
```
1. Mod belirleme (manuel veya AI)
2. Görsel üretimi/indirme
3. WebP dönüşümü ve optimizasyon
4. İçerik içi görsel yerleştirme (AI önerisi)
5. Dosya kaydetme
```

---

## 7. Önbellekleme Sistemi

### 7.1 Özet Önbellekleme
- İlk özet isteğinde AI ile üret
- Veritabanında sakla
- Sonraki isteklerde önbellekten sun
- Önbellek süresi: 30 gün (ayarlanabilir)

### 7.2 Görsel Önbellekleme
- Üretilen görseller public/images/generated/ altında
- Dosya adı: {slug}-{timestamp}.webp
- Otomatik temizleme: 90 gün sonra (opsiyonel)

---

## 8. Uygulama Adımları

### Faz 1: Temel Altyapı
- [ ] Yeni modül yapısını oluştur
- [ ] Tip tanımlarını yaz
- [ ] Gemini client'ı güncelle

### Faz 2: RSS ve Trend
- [ ] RSS collector modülünü yaz
- [ ] Trend analyzer modülünü yaz
- [ ] Veritabanı migration

### Faz 3: İçerik Üretimi
- [ ] Article generator modülünü yaz
- [ ] Google Search grounding entegrasyonu
- [ ] Yazar atama mantığı

### Faz 4: Görsel İşleme
- [ ] Image handler modülünü yaz
- [ ] 3 mod desteği
- [ ] WebP optimizasyonu

### Faz 5: Admin Panel
- [ ] RSS yönetimi sayfası güncelleme
- [ ] İçerik motoru sayfası
- [ ] Ayarlar sayfası

### Faz 6: Zamanlayıcı
- [ ] Cron job entegrasyonu
- [ ] Manuel tetikleme API

### Faz 7: Test ve Dokümantasyon
- [ ] Entegrasyon testleri
- [ ] Dokümantasyon güncelleme

---

## 9. Doğrulama Kriterleri

Her adımdan sonra:
```bash
npx tsc --noEmit && npm run lint && npm run build
```

---

## 10. Risk ve Azaltma

| Risk | Azaltma |
|------|---------|
| API rate limit | Batch işleme, gecikme ekleme |
| Görsel üretim başarısızlığı | Fallback placeholder |
| RSS erişim hatası | Hata loglama, atlama |
| Yüksek maliyet | Model seçimi optimizasyonu |
