# Content Engine v3.0 - Dokümantasyon

**Versiyon:** 3.0.0  
**Tarih:** 20 Ocak 2026  
**Durum:** Tamamlandı

## Genel Bakış

Content Engine v3.0, HaberNexus için tamamen yeniden tasarlanmış bir içerik üretim sistemidir. Mevcut karmaşık yapı sadeleştirilmiş, Google Gemini API'nin en güncel özellikleri entegre edilmiş ve kullanıcı dostu bir admin panel arayüzü oluşturulmuştur.

## Temel Özellikler

### 1. RSS Kaynak Yönetimi
- Admin panelden RSS kaynaklarını kategorilere göre ekleme
- Her kaynak için özelleştirilebilir ayarlar:
  - **Çalıştırma Başına Haber Sayısı**: Her çalıştırmada bu kaynaktan kaç haber üretileceği
  - **Yazar Ataması**: Kategoriye özel yazar atama
  - **Görsel Modu**: RSS, AI Özgün, AI Benzer veya Otomatik

### 2. Trend Analizi
- RSS kaynaklarından haber başlıklarını çekme
- AI ile trend potansiyeli analizi
- Google'da ilgi görecek haberlerin otomatik seçimi
- Duplicate kontrolü (son 7 gün)

### 3. AI İçerik Üretimi
- **Google Search Grounding** ile derinlemesine araştırma
- Profesyonel kalitede özgün haber makaleleri
- SEO optimizasyonu (başlık, meta açıklama, anahtar kelimeler)
- Duygu analizi (pozitif, negatif, nötr)
- Araştırma kaynaklarının kaydedilmesi

### 4. Görsel Üretimi
Üç farklı görsel modu:
- **RSS**: Orijinal RSS görselini kullanma
- **AI Özgün**: Tamamen yeni AI görseli üretme (Imagen 4.0)
- **AI Benzer**: RSS görseline benzer AI görseli üretme
- **Otomatik**: AI'ın en uygun modu belirlemesi

Tüm görseller:
- WebP formatında optimize edilir
- Maksimum genişlik ve kalite ayarlanabilir
- Otomatik boyutlandırma

### 5. Özet Önbellekleme
- Kullanıcılar için AI özeti oluşturma
- Önbellek süresi ayarlanabilir (varsayılan 30 gün)
- Maliyet ve performans optimizasyonu

### 6. Zamanlama
- Cron tabanlı otomatik çalıştırma
- Manuel tetikleme (Admin panelden)
- Önizleme modu (içerik üretmeden analiz)

## Dosya Yapısı

```
lib/content-engine/
├── index.ts           # Ana orchestrator
├── types.ts           # Tip tanımları
├── rss-collector.ts   # RSS toplama modülü
├── trend-analyzer.ts  # Trend analiz modülü
├── article-generator.ts # Makale üretim modülü
└── image-handler.ts   # Görsel işleme modülü

app/api/admin/content-engine/
└── route.ts           # API endpoint

app/api/cron/content-engine/
└── route.ts           # Cron endpoint

app/admin/content-engine/
└── page.tsx           # Admin panel sayfası
```

## Veritabanı Değişiklikleri

### RssFeed Modeli (Yeni Alanlar)
```prisma
topicsPerRun Int      @default(2)   // Çalıştırma başına haber sayısı
authorId     String?               // Atanmış yazar
imageMode    String   @default("auto") // Görsel modu
```

### Article Modeli (Yeni Alanlar)
```prisma
summaryCache    String?   // Önbelleklenmiş özet
summaryCachedAt DateTime? // Önbellek zamanı
sourceFeedId    String?   // Kaynak RSS ID
researchSources String?   // Araştırma kaynakları (JSON)
```

### ContentEngineRun Modeli (Yeni)
```prisma
model ContentEngineRun {
  id              String   @id @default(cuid())
  status          String   @default("pending")
  mode            String   @default("full")
  feedsProcessed  Int      @default(0)
  topicsFound     Int      @default(0)
  topicsSelected  Int      @default(0)
  articlesCreated Int      @default(0)
  imagesGenerated Int      @default(0)
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  duration        Int?
  errorMessage    String?
  logs            String?
  triggeredBy     String?
}
```

## API Endpoints

### GET /api/admin/content-engine
Motor durumu ve ayarlarını döndürür.

### POST /api/admin/content-engine
Motoru çalıştırır.

**Body:**
```json
{
  "mode": "full" | "preview",
  "feedId": "optional-feed-id",
  "skipImageGeneration": false,
  "dryRun": false
}
```

### PUT /api/admin/content-engine
Ayarları günceller.

### GET /api/cron/content-engine
Cron job tarafından çağrılır. `x-cron-secret` header gerektirir.

## Ayarlar

| Ayar | Varsayılan | Açıklama |
|------|------------|----------|
| contentModel | gemini-2.5-flash | İçerik üretim modeli |
| imageModel | imagen-4.0-fast-generate-001 | Görsel üretim modeli |
| summaryModel | gemini-2.5-flash-lite | Özet üretim modeli |
| defaultTopicsPerFeed | 2 | Varsayılan haber/kaynak |
| maxConcurrentGenerations | 3 | Eşzamanlı üretim |
| defaultImageMode | auto | Varsayılan görsel modu |
| imageQuality | 85 | WebP kalitesi (%) |
| imageMaxWidth | 1200 | Maksimum genişlik (px) |
| summaryCacheDays | 30 | Özet önbellek süresi |
| cronSchedule | 0 */6 * * * | Cron ifadesi |
| isScheduleEnabled | false | Otomatik zamanlama |

## Kullanım

### Admin Panelden Manuel Çalıştırma
1. Admin Panel > İçerik Üretim Motoru
2. "Önizleme Başlat" veya "Üretimi Başlat" butonuna tıklayın
3. Sonuçları takip edin

### Cron ile Otomatik Çalıştırma
1. Ayarlar'dan zamanlamayı etkinleştirin
2. Cron ifadesini ayarlayın
3. CRON_SECRET ortam değişkenini ayarlayın
4. Harici cron servisini yapılandırın

### API ile Çalıştırma
```bash
curl -X POST https://your-domain.com/api/admin/content-engine \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"mode": "full"}'
```

## Geliştirme Notları

### Eski Sistem ile Karşılaştırma
| Özellik | Eski Sistem | Yeni Sistem |
|---------|-------------|-------------|
| Karmaşıklık | Yüksek | Düşük |
| Modül Sayısı | 10+ | 5 |
| Ayar Sayısı | 50+ | 15 |
| API Endpoint | 5 | 3 |
| Görsel Modları | 2 | 4 |
| Önbellekleme | Yok | Var |

### Gelecek Geliştirmeler
- [ ] Makale içi görsel ekleme
- [ ] Video içerik desteği
- [ ] Çoklu dil desteği
- [ ] A/B test desteği
- [ ] Performans metrikleri dashboard'u

## Sorun Giderme

### Motor çalışmıyor
1. GEMINI_API_KEY ortam değişkenini kontrol edin
2. Aktif RSS kaynağı olduğundan emin olun
3. Konsol loglarını inceleyin

### Görsel üretilmiyor
1. Imagen API erişimini kontrol edin
2. Rate limit'e takılmış olabilir, biraz bekleyin
3. Fallback olarak placeholder kullanılır

### Duplicate makaleler
1. Son 7 günlük makaleler kontrol edilir
2. Benzer başlıklar filtrelenir
3. Slug benzersizliği sağlanır
