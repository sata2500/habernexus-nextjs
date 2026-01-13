# Araştırma Bulguları: İçerik ve Görsel Üretim Sistemi Geliştirme

**Tarih:** 13 Ocak 2026  
**Geliştirici:** Salih TANRISEVEN (AI Agent)  
**Konu:** AI Prompt Yönetimi ve Görsel Optimizasyon Sistemi

---

## 1. Mevcut Sistem Analizi

### İçerik Üretim Sistemi
- **Dosya:** `lib/gemini.ts`
- **Prompt Yapısı:** Sabit kodlanmış (hardcoded) prompt şablonları
- **Sorun:** Admin panelinden düzenlenemiyor, değişiklik için kod değişikliği gerekiyor

### Görsel Üretim Sistemi
- **Dosya:** `lib/imagen.ts`
- **Mevcut Durum:** AI ile görsel üretimi mevcut, ancak RSS görsellerini optimize etmiyor
- **Sorun:** RSS'den gelen görseller direkt kullanılıyor, optimizasyon yok

---

## 2. Araştırma Bulguları

### Sharp Kütüphanesi (Görsel Optimizasyon)
- **Versiyon:** v0.34.5 (En güncel)
- **Özellikler:**
  - JPEG, PNG, WebP, GIF, AVIF, TIFF ve SVG okuma desteği
  - WebP, AVIF çıktı formatları
  - 4-5x ImageMagick'ten hızlı
  - Otomatik ICC profil ve renk alanı yönetimi
  - Lanczos resampling ile kalite koruması

### WebP Dönüşüm En İyi Uygulamaları
```javascript
sharp(input)
  .resize(1200, 630, { fit: 'cover' }) // OG image boyutu
  .webp({ quality: 80, effort: 6 })
  .toFile('output.webp')
```

### Önerilen Görsel Optimizasyon Ayarları
| Format | Kalite | Kullanım Alanı |
|--------|--------|----------------|
| WebP | 80 | Genel kullanım |
| AVIF | 60 | Yüksek sıkıştırma |
| JPEG | 85 | Fallback |

---

## 3. Prompt Yönetim Sistemi Tasarımı

### Veritabanı Yapısı
```prisma
model PromptTemplate {
  id          String   @id @default(cuid())
  name        String   @unique  // "content_generation", "image_generation", etc.
  displayName String             // "İçerik Üretim Promptu"
  description String?            // Açıklama
  template    String             // Prompt şablonu ({{title}}, {{content}} değişkenleri)
  variables   String             // JSON: ["title", "content", "category"]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Prompt Değişkenleri
| Değişken | Açıklama |
|----------|----------|
| `{{title}}` | Kaynak başlık |
| `{{content}}` | Kaynak içerik |
| `{{category}}` | Kategori |
| `{{style}}` | Görsel stili |

---

## 4. Görsel Sistemi Tasarımı

### RSS Görsel İşleme Akışı
1. RSS'den görsel URL'si al
2. Görseli indir
3. Sharp ile optimize et (WebP, resize)
4. Sunucuya kaydet
5. Habere ekle

### AI Görsel Üretim Akışı
1. Haber türünü analiz et
2. Gerçek görsel mi, AI görsel mi karar ver
3. AI görsel üret veya RSS görselini kullan
4. Optimize et ve kaydet

### Görsel Yerleştirme Mantığı
| Haber Türü | Görsel Kaynağı | Yerleştirme |
|------------|----------------|-------------|
| Spor | RSS (gerçek) | Başlık altı |
| Teknoloji | AI üretim | Kapak |
| Ekonomi | AI üretim | Kapak |
| Gündem | RSS/AI karma | Bağlama göre |

---

## 5. Uygulama Planı

### Faz 1: Veritabanı ve API
- [ ] PromptTemplate modeli ekle
- [ ] Prompt CRUD API'leri oluştur
- [ ] Varsayılan promptları seed et

### Faz 2: Görsel Optimizasyon
- [ ] Sharp kütüphanesini entegre et
- [ ] RSS görsel indirme fonksiyonu
- [ ] WebP dönüşüm ve optimizasyon

### Faz 3: Admin Panel
- [ ] Prompt düzenleme sayfası
- [ ] Görsel ayarları sayfası
- [ ] Önizleme özelliği

### Faz 4: Entegrasyon
- [ ] Content engine güncelleme
- [ ] Imagen güncelleme
- [ ] Test ve doğrulama

---

## 6. Teknik Notlar

### Sharp Kurulumu
```bash
npm install sharp
```

### Önemli Kısıtlamalar
- Sharp, Next.js edge runtime'da çalışmaz (Node.js gerekli)
- Büyük görseller için memory limiti ayarlanmalı
- WebP tarayıcı desteği: %97+ (Safari 14+)

---

**Sonraki Adım:** Prompt yönetim sistemini tasarla ve uygula
