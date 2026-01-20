# Gelişmiş İçerik Motoru (Advanced Content Engine)

## Genel Bakış

Gelişmiş İçerik Motoru, HaberNexus'un yeni nesil içerik üretim sistemidir. RSS kaynaklarından akıllı konu seçimi yaparak, seçilen konular için derinlemesine web araştırması gerçekleştirir ve toplanan bilgilerden özgün, değerli haber içerikleri üretir.

## Mimari

Sistem dört ana aşamadan oluşan bir pipeline mimarisi kullanır:

```
RSS Feeds → Topic Selection → Deep Research → Content Synthesis → Publishing
```

### 1. Konu Seçimi (Topic Selection)

**Modül:** `lib/topic-selector.ts`

- Tüm aktif RSS kaynaklarından başlıkları toplar
- AI kullanarak konuları değerlendirir ve puanlar
- En ilgi çekici, güncel ve değerli konuları seçer
- Duplicate ve benzer konuları filtreler

**Değerlendirme Kriterleri:**
- Güncellik ve zamanlılık (0-25 puan)
- Okuyucu ilgisi ve değeri (0-25 puan)
- Haber değeri ve önemi (0-25 puan)
- Özgünlük ve farklılık (0-25 puan)

### 2. Derinlemesine Araştırma (Deep Research)

**Modül:** `lib/research-agent.ts`

- Seçilen her konu için arama sorguları oluşturur
- Gemini'nin grounding özelliğini kullanarak web araştırması yapar
- Farklı kaynaklardan bilgi toplar ve yapılandırır
- Bulguları kategorize eder (arka plan, güncel, analiz, alıntı, istatistik)

**Araştırma Türleri:**
- Ana konu hakkında genel bilgi
- Son gelişmeler ve güncel haberler
- Uzman görüşleri ve analizler
- İstatistikler ve veriler
- Arka plan ve bağlam bilgisi

### 3. İçerik Sentezi (Content Synthesis)

**Modül:** `lib/content-synthesizer.ts`

- Araştırma sonuçlarını birleştirir
- Özgün ve değerli içerik üretir
- Kaynak atıfları ekler
- SEO optimizasyonu yapar
- Kalite değerlendirmesi gerçekleştirir

**Kalite Kriterleri:**
- Başlık kalitesi (0-15 puan)
- İçerik uzunluğu (0-25 puan)
- Yapı ve paragraflar (0-20 puan)
- SEO uyumluluğu (0-20 puan)
- Kaynak atıfları (0-20 puan)

### 4. Yayınlama (Publishing)

**Modül:** `lib/advanced-content-engine.ts`

- Görsel işleme (AI üretimi veya RSS'den optimizasyon)
- Veritabanına kayıt
- Slug oluşturma ve benzersizlik kontrolü

## API Endpoints

### GET /api/admin/advanced-content-engine

Sistem durumunu ve yapılandırmayı döndürür.

**Yanıt:**
```json
{
  "isConfigured": true,
  "isResearchEnabled": true,
  "isImageGenEnabled": true,
  "config": {
    "maxTopics": 5,
    "minQualityScore": 50,
    "enableResearch": true,
    "enableImageGeneration": true,
    "parallelResearch": false
  },
  "lastRun": "2026-01-20T12:00:00.000Z",
  "stats": {
    "totalArticles": 100,
    "articlesWithResearch": 50,
    "averageQuality": 75
  }
}
```

### POST /api/admin/advanced-content-engine

İçerik üretim pipeline'ını çalıştırır.

**İstek Gövdesi:**
```json
{
  "action": "run" | "preview" | "test",
  "maxTopics": 5
}
```

**Eylemler:**
- `preview`: Sadece konu seçimi yapar, içerik üretmez
- `test`: Tek bir konu için tam pipeline'ı test eder
- `run`: Tam pipeline'ı çalıştırır ve içerikleri yayınlar

## Admin Panel

**Sayfa:** `/admin/gelismis-icerik-motoru`

Admin panelinde dört sekme bulunur:

1. **Genel Bakış:** Sistem yapılandırması ve istatistikler
2. **Konu Önizleme:** RSS'den seçilecek konuları önizleme
3. **Test Modu:** Tek konu için pipeline testi
4. **Tam Çalıştır:** Tam pipeline'ı çalıştırma

## Yapılandırma

Sistem ayarları veritabanındaki `SystemSetting` tablosunda saklanır:

| Anahtar | Açıklama | Varsayılan |
|---------|----------|------------|
| `max_topics_per_run` | Çalışma başına maksimum konu | 5 |
| `min_topic_score` | Minimum konu puanı | 60 |
| `min_article_quality` | Minimum makale kalitesi | 50 |
| `enable_deep_research` | Araştırma aktif mi | true |
| `enable_image_generation` | Görsel üretimi aktif mi | true |
| `parallel_research` | Paralel araştırma | false |

## Kullanım Örnekleri

### Konu Önizleme

```typescript
import { selectTopics } from '@/lib/topic-selector'

const result = await selectTopics(5)
console.log(result.topics) // Seçilen konular
```

### Tek Konu Araştırma

```typescript
import { researchTopic } from '@/lib/research-agent'

const research = await researchTopic(topic)
console.log(research.findings) // Araştırma bulguları
```

### İçerik Sentezi

```typescript
import { synthesizeContent } from '@/lib/content-synthesizer'

const synthesis = await synthesizeContent(research)
console.log(synthesis.article) // Üretilen makale
```

### Tam Pipeline

```typescript
import { runAdvancedContentPipeline } from '@/lib/advanced-content-engine'

const result = await runAdvancedContentPipeline()
console.log(result.articlesPublished) // Yayınlanan makale sayısı
```

## En İyi Uygulamalar

1. **Konu Seçimi:** Minimum 60 puan eşiği kullanın
2. **Araştırma:** Paralel araştırma API limitlerini aşabilir, dikkatli kullanın
3. **Kalite:** Minimum 50 kalite skoru altındaki makaleleri yayınlamayın
4. **Test:** Tam çalıştırmadan önce test modunu kullanın

## Hata Ayıklama

Loglar `[TopicSelector]`, `[ResearchAgent]`, `[ContentSynthesizer]`, `[AdvancedEngine]` prefix'leri ile yazılır.

```bash
# Logları filtreleme
grep -E "\[TopicSelector\]|\[ResearchAgent\]|\[ContentSynthesizer\]|\[AdvancedEngine\]" logs/app.log
```

## Gelecek Geliştirmeler

- [ ] Çoklu dil desteği
- [ ] Kaynak güvenilirlik puanlaması
- [ ] Otomatik zamanlama
- [ ] A/B test desteği
- [ ] Performans metrikleri dashboard'u
