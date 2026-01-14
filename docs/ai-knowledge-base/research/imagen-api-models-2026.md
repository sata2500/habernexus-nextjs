# Imagen API Model Araştırması - Ocak 2026

## Resmi Deprecation Bilgileri (Google AI for Developers)

Kaynak: https://ai.google.dev/gemini-api/docs/deprecations#imagen-models

### Imagen 4 Modelleri (Stable/GA)

| Model Kodu | Yayın Tarihi | Kapanma Tarihi | Önerilen Alternatif |
|------------|--------------|----------------|---------------------|
| `imagen-4.0-generate-001` | 24 Haziran 2025 | En erken Haziran 2026 | gemini-3-pro-image-preview veya gemini-2.5-flash-image |
| `imagen-4.0-ultra-generate-001` | 24 Haziran 2025 | En erken Haziran 2026 | gemini-3-pro-image-preview veya gemini-2.5-flash-image |
| `imagen-4.0-fast-generate-001` | 24 Haziran 2025 | En erken Haziran 2026 | gemini-3-pro-image-preview veya gemini-2.5-flash-image |

### Imagen 4 Preview Modelleri

| Model Kodu | Yayın Tarihi | Kapanma Tarihi | Önerilen Alternatif |
|------------|--------------|----------------|---------------------|
| `imagen-4.0-generate-preview-06-06` | 24 Haziran 2025 | 17 Şubat 2026 | imagen-4.0-generate-001 |
| `imagen-4.0-ultra-generate-preview-06-06` | 24 Haziran 2025 | 17 Şubat 2026 | imagen-4.0-ultra-generate-001 |

### Imagen 3 Modelleri (KAPANDI)

| Model Kodu | Yayın Tarihi | Kapanma Tarihi | Önerilen Alternatif |
|------------|--------------|----------------|---------------------|
| `imagen-3.0-generate-002` | 6 Şubat 2025 | **10 Kasım 2025** | imagen-4.0-generate-001 |

**ÖNEMLİ:** `imagen-3.0-generate-002` modeli 10 Kasım 2025 tarihinde tamamen kapatılmıştır ve artık kullanılamaz.

## Test Sonuçları (14 Ocak 2026)

API Anahtarı ile yapılan testler:

| Model | Sonuç | Süre | Görsel Boyutu |
|-------|-------|------|---------------|
| `imagen-3.0-generate-002` | ❌ 404 NOT_FOUND | - | - |
| `imagen-4.0-generate-001` | ✅ Başarılı | ~10.7s | ~1.3MB |
| `imagen-4.0-fast-generate-001` | ✅ Başarılı | ~4.1s | ~1.2MB |

## Imagen Yapılandırma Parametreleri

- `numberOfImages`: 1-4 arası (varsayılan: 4)
- `imageSize`: `1K` veya `2K` (sadece Standard ve Ultra modellerde)
- `aspectRatio`: `1:1`, `3:4`, `4:3`, `9:16`, `16:9` (varsayılan: `1:1`)
- `personGeneration`: `dont_allow`, `allow_adult` (varsayılan), `allow_all`

## Önerilen Model Seçimi

1. **Hız öncelikli:** `imagen-4.0-fast-generate-001` (~4 saniye)
2. **Kalite öncelikli:** `imagen-4.0-generate-001` (~10 saniye)
3. **Ultra kalite:** `imagen-4.0-ultra-generate-001` (2K çözünürlük)

## Sonuç

- `imagen-3.0-generate-002` artık kullanılamıyor
- Tüm Imagen 4 modelleri aktif ve çalışıyor
- Varsayılan model olarak `imagen-4.0-fast-generate-001` önerilir (hız/kalite dengesi)
