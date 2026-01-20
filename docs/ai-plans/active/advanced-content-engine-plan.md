# Development Plan: Advanced Content Generation System

- **Issue:** N/A (Feature Enhancement)
- **Agent:** Manus AI
- **Status:** In Progress
- **Date:** 20 January 2026

---

## 1. Objective

RSS kaynaklarından akıllı konu seçimi yapan, seçilen konular için derinlemesine web araştırması gerçekleştiren ve toplanan bilgilerden özgün, değerli haber içerikleri üreten gelişmiş bir içerik oluşturma sistemi geliştirmek.

## 2. Research & Findings

### Multi-Agent Research Systems (Anthropic)
- Orchestrator-worker pattern en etkili mimari
- Paralel araştırma performansı %90+ artırıyor
- Token kullanımı performansın %80'ini açıklıyor
- Alt ajanlar bağımsız bağlam pencerelerinde çalışmalı

### Web Search APIs
- **Tavily:** AI ajanları için optimize edilmiş, 180ms latency
- **Serper:** Google Search API, düşük maliyet
- **Google Custom Search:** Gemini ile entegre çalışabilir

### Best Practices
- Geniş aramalarla başla, sonra daralt
- Kaynak kalitesini değerlendir
- Çapraz doğrulama yap
- Düşünme sürecini yönlendir

## 3. Step-by-Step Implementation

### Micro-Step 1: Topic Selector Module (lib/topic-selector.ts)
**Files:** 1 file
**Verification:** tsc + lint + build

1. RSS'den tüm başlıkları toplayan fonksiyon
2. AI ile konu değerlendirme ve puanlama
3. En iyi konuları seçme algoritması
4. Duplicate filtreleme

### Micro-Step 2: Research Agent Module (lib/research-agent.ts)
**Files:** 1 file
**Verification:** tsc + lint + build

1. Web arama fonksiyonu (Gemini grounding ile)
2. Kaynak içerik çıkarma
3. Bilgi toplama ve yapılandırma
4. Araştırma sonuçları formatı

### Micro-Step 3: Source Verifier Module (lib/source-verifier.ts)
**Files:** 1 file
**Verification:** tsc + lint + build

1. Kaynak güvenilirlik değerlendirmesi
2. Bilgi çapraz kontrolü
3. Çelişki tespiti
4. Güvenilirlik skoru hesaplama

### Micro-Step 4: Content Synthesizer Module (lib/content-synthesizer.ts)
**Files:** 1 file
**Verification:** tsc + lint + build

1. Araştırma sonuçlarını birleştirme
2. Özgün içerik üretimi
3. Kaynak atıfları ekleme
4. SEO optimizasyonu

### Micro-Step 5: Database Schema Updates (prisma/schema.prisma)
**Files:** 1 file
**Verification:** prisma generate + db push

1. ResearchSource modeli
2. TopicQueue modeli
3. Article modeline yeni alanlar

### Micro-Step 6: Advanced Content Engine (lib/advanced-content-engine.ts)
**Files:** 1 file
**Verification:** tsc + lint + build

1. Tüm modülleri entegre eden ana motor
2. Pipeline yönetimi
3. Hata yönetimi
4. Loglama

### Micro-Step 7: API Endpoint Updates
**Files:** 2 files (route.ts dosyaları)
**Verification:** tsc + lint + build

1. /api/admin/content-engine güncelleme
2. Yeni endpoint'ler ekleme

### Micro-Step 8: Admin Panel Updates
**Files:** 2-3 files
**Verification:** tsc + lint + build

1. Gelişmiş içerik motoru ayarları
2. Araştırma sonuçları görüntüleme
3. Konu seçimi önizleme

## 4. Testing Strategy

- **Unit Test 1:** Topic selector'ın doğru konu seçimi yapması
- **Unit Test 2:** Research agent'ın web araması yapabilmesi
- **Integration Test 1:** Tam pipeline'ın çalışması
- **Manual Test 1:** Admin panelden içerik üretimi tetikleme

## 5. Test Results

(Uygulama sonrası doldurulacak)

## 6. Documentation Impact

- [ ] `README.md` - Gelişmiş içerik motoru açıklaması
- [ ] `wiki/AI-Content-Engine.md` - Detaylı dokümantasyon
- [ ] `ROADMAP.md` - Özellik tamamlandı işareti
- [ ] `docs/ai-knowledge-base/learnings/` - Öğrenilen dersler

## 7. Error Log

(Uygulama sırasında doldurulacak)
