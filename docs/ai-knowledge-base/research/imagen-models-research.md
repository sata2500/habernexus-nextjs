# Imagen API Modelleri Araştırması

**Tarih:** 13 Ocak 2026  
**Kaynak:** https://ai.google.dev/gemini-api/docs/imagen

## Mevcut Imagen Modelleri

### Imagen 4 (En Yeni)
| Özellik | Değer |
|---------|-------|
| Model Kodu | `imagen-4.0-generate-001`, `imagen-4.0-ultra-generate-001`, `imagen-4.0-fast-generate-001` |
| Girdi | Text |
| Çıktı | Images |
| Input Token Limit | 480 tokens (text) |
| Output Images | 1 to 4 (Ultra/Standard/Fast) |
| Son Güncelleme | June 2025 |

### Imagen 3
| Özellik | Değer |
|---------|-------|
| Model Kodu | `imagen-3.0-generate-002` |
| Girdi | Text |
| Çıktı | Images |
| Input Token Limit | N/A |
| Output Images | Up to 4 |
| Son Güncelleme | February 2025 |

## API Kullanımı (Python)

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_images(
    model='imagen-4.0-generate-001',
    prompt='Robot holding a red skateboard',
    config=types.GenerateImagesConfig(
        number_of_images=4,
    )
)

for generated_image in response.generated_images:
    generated_image.image.show()
```

## Imagen Yapılandırma Seçenekleri

- **numberOfImages**: 1-4 arası (varsayılan: 4)
- **imageSize**: `1K` veya `2K` (sadece Standard ve Ultra için)
- **aspectRatio**: `"1:1"`, `"3:4"`, `"4:3"`, `"9:16"`, `"16:9"` (varsayılan: `"1:1"`)
- **personGeneration**: 
  - `"dont_allow"`: İnsan görseli üretme
  - `"allow_adult"`: Sadece yetişkin (varsayılan)
  - `"allow_all"`: Tüm yaşlar

## JavaScript/TypeScript Kullanımı

```typescript
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Imagen ile görsel üretimi
const response = await genAI.models.generateImages({
  model: 'imagen-3.0-generate-002',
  prompt: 'A modern news article header image about technology',
  config: {
    numberOfImages: 1,
    aspectRatio: '16:9',
  },
});

// Görseli base64 olarak al
const imageData = response.generatedImages[0].image;
```

## Notlar

1. Imagen API, Gemini API'den ayrı bir endpoint kullanır
2. `generate_images` metodu kullanılır (generateContent değil)
3. Tüm üretilen görseller SynthID watermark içerir
4. Sadece İngilizce prompt desteklenir
5. Görsel üretimi için ayrı API çağrısı gerekir
