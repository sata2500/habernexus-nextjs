# Gemini API Modelleri Araştırması

**Tarih:** 13 Ocak 2026  
**Araştırmacı:** AI Agent  
**Kaynak:** https://ai.google.dev/gemini-api/docs/models

## Mevcut Gemini Modelleri

### 1. Gemini 3 Serisi (En Yeni)

#### Gemini 3 Pro
- **Model Kodu:** `gemini-3-pro-preview`
- **Özellik:** En akıllı model, multimodal anlama için dünya lideri
- **Girdi:** Text, Image, Video, Audio, PDF
- **Çıktı:** Text
- **Input Token Limiti:** 1,048,576
- **Output Token Limiti:** 65,536
- **Desteklenen Özellikler:**
  - Batch API: ✅
  - File search: ✅
  - Function calling: ✅
  - Search grounding: ✅
  - Structured outputs: ✅
  - Thinking: ✅
  - URL context: ✅
- **Desteklenmeyen:**
  - Audio generation: ❌
  - Image generation: ❌
  - Live API: ❌
  - Grounding with Google Maps: ❌
- **Son Güncelleme:** Kasım 2025
- **Knowledge Cutoff:** Ocak 2025

#### Gemini 3 Flash
- **Model Kodu:** `gemini-3-flash-preview`
- **Özellik:** Hız, ölçek ve frontier zeka için dengelenmiş model
- **Kullanım:** Yüksek hacimli işler için ideal

### 2. Gemini 2.5 Serisi

#### Gemini 2.5 Flash
- **Model Kodu:** `gemini-2.5-flash`
- **Özellik:** Fiyat-performans açısından en iyi model
- **Kullanım:** Büyük ölçekli işleme, düşük gecikme, yüksek hacimli görevler, düşünme gerektiren ve agentic kullanım durumları

#### Gemini 2.5 Flash-Lite
- **Model Kodu:** `gemini-2.5-flash-lite`
- **Özellik:** En hızlı flash model
- **Kullanım:** Maliyet verimliliği ve yüksek throughput için optimize edilmiş

#### Gemini 2.5 Pro
- **Model Kodu:** `gemini-2.5-pro`
- **Özellik:** Gelişmiş düşünme modeli
- **Kullanım:** Kod, matematik ve STEM'de karmaşık problemler üzerinde muhakeme, büyük veri setleri, kod tabanları ve belgeleri uzun bağlam kullanarak analiz etme

### 3. Gemini 2.0 Serisi (Önceki Nesil)

#### Gemini 2.0 Flash
- **Model Kodu:** `gemini-2.0-flash`
- **Özellik:** İkinci nesil workhorse model
- **Context Window:** 1 milyon token

#### Gemini 2.0 Flash-Lite
- **Model Kodu:** `gemini-2.0-flash-lite`
- **Özellik:** İkinci nesil hızlı model
- **Context Window:** 1 milyon token

## Model Versiyon Kalıpları

1. **Stable:** Belirli bir kararlı modeli işaret eder (örn: `gemini-2.5-flash`)
2. **Preview:** Üretim için kullanılabilir önizleme modeli (örn: `gemini-2.5-flash-preview-09-2025`)
3. **Latest:** Belirli bir model varyasyonu için en son sürüm (örn: `gemini-flash-latest`)
4. **Experimental:** Deneysel model, üretim için uygun değil

## HaberNexus İçin Önerilen Modeller

### İçerik Üretimi İçin:
1. **gemini-2.5-flash** - Hızlı ve maliyet etkin (Varsayılan önerilen)
2. **gemini-2.5-pro** - Yüksek kaliteli içerik için
3. **gemini-3-pro-preview** - En yüksek kalite (deneysel)
4. **gemini-3-flash-preview** - Hızlı ve yüksek kalite (deneysel)
5. **gemini-2.0-flash** - Eski ama stabil

### Duygu Analizi İçin:
1. **gemini-2.5-flash** - Hızlı analiz
2. **gemini-2.5-flash-lite** - Çok hızlı, düşük maliyetli

### Kategori Belirleme İçin:
1. **gemini-2.5-flash-lite** - Basit sınıflandırma için yeterli
2. **gemini-2.5-flash** - Daha doğru sınıflandırma

## API Model İsimleri (Kod İçin)

```typescript
const GEMINI_MODELS = {
  // Gemini 3 Serisi (En Yeni)
  'gemini-3-pro-preview': {
    name: 'Gemini 3 Pro',
    description: 'En akıllı model - Multimodal anlama ve agentic görevler için',
    tier: 'premium',
    contextWindow: 1048576,
    outputTokens: 65536,
  },
  'gemini-3-flash-preview': {
    name: 'Gemini 3 Flash',
    description: 'Hız ve zeka dengesi - Ölçeklenebilir görevler için',
    tier: 'standard',
    contextWindow: 1048576,
    outputTokens: 65536,
  },
  
  // Gemini 2.5 Serisi
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    description: 'En iyi fiyat-performans - Genel kullanım için önerilen',
    tier: 'standard',
    contextWindow: 1048576,
    outputTokens: 8192,
  },
  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash-Lite',
    description: 'Ultra hızlı - Yüksek hacimli basit görevler için',
    tier: 'lite',
    contextWindow: 1048576,
    outputTokens: 8192,
  },
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    description: 'Gelişmiş düşünme - Karmaşık analiz ve muhakeme için',
    tier: 'premium',
    contextWindow: 1048576,
    outputTokens: 8192,
  },
  
  // Gemini 2.0 Serisi (Önceki Nesil)
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    description: 'Stabil workhorse - Güvenilir genel kullanım',
    tier: 'standard',
    contextWindow: 1000000,
    outputTokens: 8192,
  },
  'gemini-2.0-flash-lite': {
    name: 'Gemini 2.0 Flash-Lite',
    description: 'Hızlı ve ekonomik - Basit görevler için',
    tier: 'lite',
    contextWindow: 1000000,
    outputTokens: 8192,
  },
}
```

## Notlar

- Gemini 1.5 serisi artık deprecated olma yolunda
- Yeni projeler için Gemini 2.5 veya 3 serisi önerilir
- Preview modeller production'da kullanılabilir ama 2 hafta önceden deprecation bildirimi yapılır
- Experimental modeller sadece test için kullanılmalı
