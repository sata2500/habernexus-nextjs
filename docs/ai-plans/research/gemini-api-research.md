# Google Gemini API Araştırma Bulguları

**Tarih:** 20 Ocak 2026  
**Amaç:** HaberNexus içerik üretim sisteminin yeniden tasarımı için API araştırması

---

## 1. Mevcut Gemini Modelleri

### 1.1 Text/Content Generation Modelleri

| Model | Açıklama | Kullanım Alanı |
|-------|----------|----------------|
| `gemini-3-pro` | En güçlü multimodal ve agentic model | Karmaşık içerik üretimi, araştırma |
| `gemini-3-flash` | Hız ve ölçek için optimize edilmiş | Yüksek hacimli işlemler |
| `gemini-2.5-flash` | Fiyat-performans açısından en iyi | Büyük ölçekli işleme, düşük gecikme |
| `gemini-2.5-flash-lite` | En hızlı flash model | Maliyet etkin, yüksek throughput |
| `gemini-2.5-pro` | Gelişmiş düşünme modeli | Karmaşık analiz, uzun bağlam |
| `gemini-2.0-flash` | İkinci nesil workhorse model | Genel amaçlı, 1M token bağlam |

### 1.2 Görsel Üretim Modelleri

#### Imagen 4 Modelleri
| Model ID | Açıklama | Özellikler |
|----------|----------|------------|
| `imagen-4.0-generate-001` | Standart model | 1K-2K çözünürlük, 1-4 görsel |
| `imagen-4.0-fast-generate-001` | Hızlı model | ~5 saniye |
| `imagen-4.0-ultra-generate-001` | Ultra kalite | 2K çözünürlük |

**Imagen Parametreleri:**
- `numberOfImages`: 1-4 arası
- `imageSize`: "1K" veya "2K"
- `aspectRatio`: "1:1", "3:4", "4:3", "9:16", "16:9"
- `personGeneration`: "dont_allow", "allow_adult", "allow_all"

#### Nano Banana Modelleri (Gemini Native Image Generation)
| Model ID | Açıklama | Özellikler |
|----------|----------|------------|
| `gemini-2.5-flash-image` | Nano Banana | Hızlı, yüksek hacim |
| `gemini-3-pro-image-preview` | Nano Banana Pro | Profesyonel kalite, 4K, thinking |

**Nano Banana Pro Özellikleri:**
- 4K çözünürlük desteği
- Gelişmiş metin render
- Google Search grounding ile görsel üretim
- 14 referans görsel desteği
- "Thinking" modu ile karmaşık talimatlar

---

## 2. Google Search Grounding

**Amaç:** Gerçek zamanlı web içeriğine bağlantı kurarak doğru ve güncel bilgi sağlama

### Kullanım:
```python
from google import genai
from google.genai import types

client = genai.Client()

grounding_tool = types.Tool(
    google_search=types.GoogleSearch()
)

config = types.GenerateContentConfig(
    tools=[grounding_tool]
)

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents="Konu hakkında araştırma yap",
    config=config,
)
```

### Grounding Metadata:
- `webSearchQueries`: Kullanılan arama sorguları
- `groundingChunks`: Kaynak URL'leri ve başlıkları
- `groundingSupports`: Metin segmentleri ve kaynak eşleştirmeleri

---

## 3. Imagen API Kullanımı

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_images(
    model='imagen-4.0-generate-001',
    prompt='Profesyonel haber fotoğrafı...',
    config=types.GenerateImagesConfig(
        number_of_images=1,
        aspect_ratio='16:9',
        image_size='2K'
    )
)

for generated_image in response.generated_images:
    # image.image.imageBytes içinde base64 veri
    pass
```

---

## 4. Nano Banana API Kullanımı

```python
from google import genai
from google.genai import types

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=["Haber görseli oluştur: ..."],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(
            aspect_ratio='16:9',
            image_size='2K'
        )
    )
)

for part in response.parts:
    if part.inline_data is not None:
        image = part.as_image()
        image.save("output.png")
```

---

## 5. Yeni Sistem İçin Öneriler

### 5.1 Model Seçimi
- **İçerik Üretimi:** `gemini-2.5-flash` veya `gemini-3-flash` (Google Search grounding ile)
- **Trend Analizi:** `gemini-2.5-flash` (hızlı ve maliyet etkin)
- **Görsel Üretimi:** `imagen-4.0-fast-generate-001` (hızlı) veya `gemini-2.5-flash-image` (Nano Banana)
- **Özet Üretimi:** `gemini-2.5-flash-lite` (maliyet etkin)

### 5.2 Basitleştirilmiş Mimari
1. **RSS Yönetimi:** Kategori bazlı RSS kaynakları
2. **Trend Seçimi:** Google Search grounding ile trend analizi
3. **İçerik Üretimi:** Tek bir güçlü prompt ile araştırma + içerik
4. **Görsel Üretimi:** 3 mod (RSS, AI özgün, AI benzer)
5. **Önbellekleme:** Özet ve görsel önbellekleme

### 5.3 API Değişiklikleri
- Eski: `@google/genai` paketi
- Yeni: `google-genai` Python SDK veya `@google/genai` JS SDK
- Grounding: `tools: [{ googleSearch: {} }]`

---

## 6. Dikkat Edilecek Noktalar

1. **SynthID Watermark:** Tüm AI üretimi görsellerde otomatik
2. **Dil Desteği:** Imagen sadece İngilizce prompt destekler
3. **Rate Limits:** Model bazında farklı limitler
4. **Fiyatlandırma:** Gemini 3 ile search grounding sorgu başına ücretli
