# İçerik Oluşturma Sistemi Araştırma Bulguları

**Tarih:** 20 Ocak 2026
**Konu:** Gelişmiş İçerik Oluşturma Sistemi Tasarımı

---

## 1. Mevcut Sistem Analizi

### Mevcut Mimari
- RSS kaynaklarından haber başlıkları çekiliyor
- Her RSS öğesi doğrudan AI'a gönderiliyor
- Gemini API ile içerik üretiliyor
- Görsel üretimi veya RSS'den görsel alınıyor

### Mevcut Sorunlar
1. RSS içeriği doğrudan kullanılıyor - araştırma yapılmıyor
2. Konu seçimi akıllı değil - tüm RSS öğeleri işleniyor
3. İçerik tek kaynağa dayalı - derinlik yok
4. Doğrulama mekanizması yok

---

## 2. Anthropic Multi-Agent Research System Öğrenilenleri

### Temel Mimari: Orchestrator-Worker Pattern
- **Lead Agent (Orkestratör):** Sorguyu analiz eder, strateji geliştirir, alt ajanları yönetir
- **Subagents (İşçiler):** Paralel olarak farklı kaynakları araştırır
- **Citation Agent:** Kaynakları doğrular ve atıfları ekler

### Önemli Prensipler
1. **Paralel Araştırma:** Alt ajanlar aynı anda farklı kaynakları tarar
2. **Dinamik Adaptasyon:** Bulunan bilgilere göre strateji güncellenir
3. **Sıkıştırma:** Her alt ajan kendi bağlam penceresinde çalışır, sonra özetler
4. **Kaynak Kalitesi:** Birincil kaynaklar tercih edilir

### Prompt Engineering İpuçları
- Orkestratöre nasıl delege edeceğini öğret
- Çabayı sorgu karmaşıklığına göre ölçekle
- Araç seçimi kritik - doğru aracı kullan
- Geniş başla, sonra daralt
- Düşünme sürecini yönlendir

---

## 3. Web Araştırma API'leri

### Tavily API
- AI ajanları için özel tasarlanmış
- Real-time arama, extraction, crawling
- 180ms p50 latency
- OpenAI, Anthropic entegrasyonu
- 1M+ geliştirici kullanıyor

### Serper API
- Google Search API
- Düşük maliyet ($0.30/1000 sorgu)
- LangChain entegrasyonu
- Hızlı sonuçlar (1-2 saniye)

### NewsAPI
- 150,000+ haber kaynağı
- Gerçek zamanlı ve arşiv erişimi
- JSON formatında yapılandırılmış veri

### Exa AI
- Semantik arama
- Web crawling
- Deep research API

---

## 4. Önerilen Yeni Mimari

### Aşama 1: Akıllı Konu Seçimi
```
RSS Feeds → Topic Analyzer Agent → Ranked Topics
```
- Tüm RSS kaynaklarından başlıklar toplanır
- AI ile en ilgi çekici, güncel ve değerli konular seçilir
- Trend analizi yapılır
- Duplicate/benzer konular filtrelenir

### Aşama 2: Derinlemesine Araştırma
```
Selected Topic → Research Orchestrator → Multiple Research Agents
                                      → Web Search Agent
                                      → News API Agent
                                      → Source Verification Agent
```
- Her konu için paralel araştırma ajanları
- Farklı kaynaklardan bilgi toplama
- Kaynak doğrulama ve çapraz kontrol

### Aşama 3: İçerik Sentezi
```
Research Results → Content Synthesizer → Final Article
                                      → Citations
                                      → Fact Check Results
```
- Toplanan bilgilerin sentezi
- Özgün içerik üretimi
- Kaynak atıfları ekleme
- Doğruluk kontrolü

---

## 5. Teknik Gereksinimler

### Yeni Modüller
1. `lib/topic-selector.ts` - Akıllı konu seçimi
2. `lib/research-agent.ts` - Web araştırma ajanı
3. `lib/source-verifier.ts` - Kaynak doğrulama
4. `lib/content-synthesizer.ts` - İçerik sentezleme

### API Entegrasyonları
- Google Custom Search API (mevcut Gemini ile)
- Opsiyonel: Tavily, Serper, NewsAPI

### Veritabanı Değişiklikleri
- `ResearchSource` modeli - araştırma kaynakları
- `TopicQueue` modeli - konu kuyruğu
- Article modeline `sources` ve `researchData` alanları

---

## 6. Uygulama Planı

### Faz 1: Temel Altyapı
- Topic selector modülü
- Research agent temel yapısı
- Veritabanı şeması güncellemeleri

### Faz 2: Araştırma Sistemi
- Web arama entegrasyonu
- Paralel araştırma mekanizması
- Kaynak toplama ve saklama

### Faz 3: İçerik Üretimi
- Gelişmiş içerik sentezleme
- Kaynak atıfları
- Kalite kontrol

### Faz 4: Entegrasyon
- Mevcut content-engine ile entegrasyon
- Admin panel güncellemeleri
- Test ve optimizasyon
