# Görsel Sistem Analizi ve Araştırma Bulguları

**Tarih:** 14 Ocak 2026  
**Konu:** İçerik Üretim Motoru Görsel Sistemi Analizi

---

## 1. Mevcut Sistem Analizi

### Görsel Üretim Akışı

1. **RSS Feed İşleme** (`lib/content-engine.ts`)
   - RSS kaynaklarından haber çekiliyor
   - Her haber için görsel kaynağı belirleniyor (RSS, AI, placeholder)
   - `shouldUseRssImage()` fonksiyonu kategori bazlı karar veriyor

2. **AI Görsel Üretimi** (`lib/imagen.ts`)
   - Google Imagen API kullanılıyor (`@google/genai` paketi)
   - `generateArticleImage()` fonksiyonu görsel üretiyor
   - Üretilen görseller `public/images/generated/` klasörüne kaydediliyor
   - Dosya adı: `{slug}-{timestamp}.png`

3. **RSS Görsel Optimizasyonu** (`lib/image-optimizer.ts`)
   - Sharp kütüphanesi ile görsel optimizasyonu
   - WebP formatına dönüştürme
   - Boyut ve kalite ayarları
   - `public/images/rss/` klasörüne kaydediliyor

### Tespit Edilen Potansiyel Sorunlar

#### 1. Imagen API Kullanımı
- `@google/genai` paketi v1.34.0 kullanılıyor
- API çağrısı: `genAI.models.generateImages()`
- **Potansiyel Sorun:** API yanıtında `imageBytes` base64 formatında geliyor, doğru decode edilmeli

#### 2. Görsel Kaydetme Mekanizması
```typescript
// imagen.ts - saveGeneratedImage fonksiyonu
if (imageData.imageBytes) {
  const buffer = Buffer.from(imageData.imageBytes, 'base64')
  fs.writeFileSync(filePath, buffer)
}
```
- Base64 decode işlemi yapılıyor
- Dosya sistemi yazma işlemi senkron

#### 3. Next.js Image Konfigürasyonu
```javascript
// next.config.js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'localhost' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
    // ...
  ],
}
```
- **Eksiklik:** Yerel görseller için `remotePatterns` gerekmez, ancak production'da domain ayarı gerekebilir

#### 4. Placeholder Görseller
- `public/images/placeholders/` klasöründe sadece `.gitkeep` var
- Kategori bazlı placeholder görseller tanımlı ama dosyalar yok:
  - `/images/placeholders/tech.jpg`
  - `/images/placeholders/economy.jpg`
  - vb.

#### 5. imageSource Takibi
- Article modeline `imageSource` alanı eklenmiş ('ai', 'rss', 'placeholder')
- Bu alan görselin kaynağını takip ediyor

---

## 2. Google Imagen API Araştırması

### Desteklenen Modeller
| Model | Açıklama |
|-------|----------|
| `imagen-3.0-generate-002` | Yüksek kaliteli görsel üretimi |
| `imagen-4.0-generate-001` | En yeni model |
| `imagen-4.0-fast-generate-001` | Hızlı üretim |
| `imagen-4.0-ultra-generate-001` | Ultra yüksek kalite (2K) |

### API Konfigürasyonu
- `numberOfImages`: 1-4 (varsayılan: 4)
- `aspectRatio`: "1:1", "3:4", "4:3", "9:16", "16:9"
- `personGeneration`: "dont_allow", "allow_adult", "allow_all"
- **Önemli:** Sadece İngilizce prompt destekleniyor

### Bilinen Sorunlar (Google Dokümantasyonundan)
1. **500 Internal Error:** Context çok uzun olabilir
2. **RESOURCE_EXHAUSTED (429):** Rate limit aşımı
3. **INVALID_ARGUMENT (400):** Yanlış parametre formatı
4. **Content Policy:** İnsan içeren görseller için allowlist gerekebilir

---

## 3. Olası Sorun Kaynakları

### A. API Yapılandırma Sorunları
1. GEMINI_API_KEY ortam değişkeni ayarlanmamış olabilir
2. API kotası aşılmış olabilir
3. Model adı yanlış olabilir

### B. Dosya Sistemi Sorunları
1. `public/images/generated/` klasörü oluşturulmamış olabilir
2. Yazma izinleri eksik olabilir
3. Dosya yolu hatalı olabilir

### C. Next.js Görsel Yükleme Sorunları
1. Görsel yolu yanlış olabilir (`/images/generated/...` vs `images/generated/...`)
2. Build sırasında public klasörü kopyalanmamış olabilir
3. Image component `fill` veya `width/height` eksik olabilir

### D. RSS Görsel İndirme Sorunları
1. RSS kaynağındaki görsel URL'leri erişilemez olabilir
2. CORS veya User-Agent kısıtlamaları olabilir
3. Timeout sorunları olabilir

---

## 4. Önerilen Kontroller

### Hemen Kontrol Edilmesi Gerekenler
1. [ ] GEMINI_API_KEY ortam değişkeni kontrolü
2. [ ] `public/images/generated/` klasör varlığı ve izinleri
3. [ ] `public/images/rss/` klasör varlığı ve izinleri
4. [ ] Placeholder görsel dosyalarının varlığı
5. [ ] API çağrısı log'ları

### Kod İncelemesi Gereken Alanlar
1. [ ] `imagen.ts` - API yanıt işleme
2. [ ] `image-optimizer.ts` - Dosya kaydetme
3. [ ] `content-engine.ts` - Görsel seçim mantığı
4. [ ] ArticleCard ve haber detay sayfası - Image component kullanımı

---

## 5. Sonraki Adımlar

1. Placeholder görselleri oluştur/ekle
2. API hata yakalama ve loglama iyileştir
3. Görsel kaydetme işlemini test et
4. Next.js Image component konfigürasyonunu kontrol et
5. Production ortamı için domain ayarlarını güncelle
