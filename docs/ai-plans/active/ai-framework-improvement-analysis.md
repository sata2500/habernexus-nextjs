# AI Framework İyileştirme Analizi

**Tarih:** 26 Aralık 2025
**Amaç:** Mevcut AI ajan altyapısını analiz etmek ve "Birleşik Ajan" felsefesini güçlendirmek

## 1. Mevcut Durum Analizi

### 1.1 Mevcut Dosya Yapısı

```
/
├── AI_DEVELOPMENT_GUIDE.md      # Ana AI rehberi
├── CONTRIBUTING.md              # İnsan katkı rehberi
├── README.md                    # Proje tanıtımı
├── ROADMAP.md                   # Yol haritası
├── docs/
│   ├── ai-knowledge-base/
│   │   ├── decision_log.md      # Mimari kararlar
│   │   └── known_errors.md      # Bilinen hatalar
│   ├── ai-plans/                # AI geliştirme planları (boş)
│   ├── ai_ajan_briefing.md      # Devir teslim belgesi
│   ├── archive/                 # Arşiv (boş)
│   ├── guides/                  # Kullanıcı rehberleri
│   └── proje_durum_raporu.md    # Durum raporu
└── wiki/                        # Wiki içerikleri
```

### 1.2 Mevcut Güçlü Yönler

1. ✅ 6 adımlı geliştirme döngüsü tanımlı
2. ✅ Karar günlüğü (decision_log.md) mevcut
3. ✅ Bilinen hatalar (known_errors.md) mevcut
4. ✅ Devir teslim belgesi mevcut
5. ✅ Proje yapısı açıkça tanımlı

### 1.3 Tespit Edilen Eksiklikler

| Eksiklik | Açıklama | Öncelik |
|----------|----------|---------|
| Web araştırma adımı eksik | AI ajanların güncel best practice'leri araştırması zorunlu değil | Yüksek |
| Test doğrulama mekanizması yok | Kodun çalıştığını doğrulama adımları belirsiz | Yüksek |
| Şablon dosyaları eksik | Plan, PR, commit için standart şablonlar yok | Yüksek |
| Arşivleme politikası belirsiz | Eski belgelerin nasıl arşivleneceği tanımlı değil | Orta |
| Onboarding kontrol listesi eksik | AI ajanın okuması gereken dosyalar için checklist yok | Orta |
| Kod kalitesi kontrolleri eksik | Lint, test, build kontrolleri tanımlı değil | Yüksek |
| Versiyon uyumu kontrolü yok | Teknoloji versiyonlarının kontrolü tanımlı değil | Orta |
| İletişim protokolü eksik | AI ajanların ne zaman kullanıcıya danışacağı belirsiz | Orta |

## 2. Kullanıcı Gereksinimleri (Özet)

1. **Keşif Aşaması:** README → CONTRIBUTING → Proje yapısı → Teknolojiler
2. **Araştırma Aşaması:** Web'den güncel best practice'leri araştırma
3. **Planlama Aşaması:** Detaylı geliştirme planı oluşturma
4. **Geliştirme Aşaması:** Kod yazma
5. **Doğrulama Aşaması:** Sıkı test ve hata kontrolü
6. **Yayınlama Aşaması:** GitHub'a yükleme
7. **Dokümantasyon Aşaması:** Belgeleri güncelleme
8. **Temizlik Aşaması:** Gereksiz dosyaları temizleme/arşivleme

## 3. Önerilen Yeni Yapı

### 3.1 Yeni Klasör Yapısı

```
/docs/
├── ai-agents/                    # AI Ajan Merkezi (YENİ)
│   ├── ONBOARDING.md            # Başlangıç kontrol listesi
│   ├── WORKFLOW.md              # Detaylı iş akışı
│   ├── QUALITY_CHECKLIST.md     # Kalite kontrol listesi
│   └── COMMUNICATION_PROTOCOL.md # İletişim kuralları
├── ai-knowledge-base/            # Bilgi Tabanı (GENİŞLETİLMİŞ)
│   ├── decisions/               # Karar günlükleri (kategorize)
│   ├── errors/                  # Hata günlükleri (kategorize)
│   ├── learnings/               # Öğrenilen dersler (YENİ)
│   └── tech-stack/              # Teknoloji referansları (YENİ)
├── ai-plans/                     # Geliştirme Planları
│   ├── active/                  # Aktif planlar
│   ├── completed/               # Tamamlanan planlar
│   └── templates/               # Plan şablonları (YENİ)
├── archive/                      # Arşiv (DÜZENLENECEK)
│   ├── deprecated-docs/         # Geçersiz belgeler
│   └── old-plans/               # Eski planlar
└── guides/                       # Kullanıcı rehberleri
```

### 3.2 Yeni/Güncellenecek Dosyalar

| Dosya | Durum | Açıklama |
|-------|-------|----------|
| `AI_DEVELOPMENT_GUIDE.md` | Güncelle | Ana rehber - daha detaylı |
| `docs/ai-agents/ONBOARDING.md` | Yeni | Başlangıç kontrol listesi |
| `docs/ai-agents/WORKFLOW.md` | Yeni | Adım adım iş akışı |
| `docs/ai-agents/QUALITY_CHECKLIST.md` | Yeni | Kalite kontrol listesi |
| `docs/ai-agents/COMMUNICATION_PROTOCOL.md` | Yeni | İletişim kuralları |
| `docs/ai-plans/templates/PLAN_TEMPLATE.md` | Yeni | Plan şablonu |
| `docs/ai-plans/templates/ERROR_TEMPLATE.md` | Yeni | Hata raporu şablonu |
| `docs/ai-plans/templates/DECISION_TEMPLATE.md` | Yeni | Karar şablonu |
| `docs/ai-knowledge-base/tech-stack/TECH_VERSIONS.md` | Yeni | Teknoloji versiyonları |

## 4. Yeni AI Geliştirme Döngüsü (8 Adım)

### Faz 1: Senkronizasyon (Onboarding)
- [ ] README.md oku
- [ ] CONTRIBUTING.md oku
- [ ] AI_DEVELOPMENT_GUIDE.md oku
- [ ] ROADMAP.md oku
- [ ] Bilgi tabanını incele
- [ ] Proje yapısını keşfet

### Faz 2: Araştırma (Research)
- [ ] Kullanılacak teknolojileri belirle
- [ ] Web'den güncel best practice'leri araştır
- [ ] Mevcut implementasyonları incele
- [ ] Potansiyel riskleri belirle

### Faz 3: Planlama (Planning)
- [ ] GitHub Issue oluştur/seç
- [ ] Detaylı plan yaz (şablon kullan)
- [ ] Test stratejisi belirle
- [ ] Dokümantasyon etkisini belirle

### Faz 4: Geliştirme (Implementation)
- [ ] Branch oluştur
- [ ] Kod yaz
- [ ] Commit mesajları standartlara uygun
- [ ] Hataları logla

### Faz 5: Doğrulama (Verification)
- [ ] Lint kontrolü
- [ ] Build kontrolü
- [ ] Manuel/otomatik testler
- [ ] Kod review (self-review)

### Faz 6: Yayınlama (Publishing)
- [ ] PR oluştur
- [ ] PR şablonunu doldur
- [ ] CI/CD kontrollerini bekle

### Faz 7: Dokümantasyon (Documentation)
- [ ] README güncelle (gerekirse)
- [ ] Wiki güncelle (gerekirse)
- [ ] Karar günlüğü güncelle
- [ ] Hata günlüğü güncelle

### Faz 8: Temizlik (Cleanup)
- [ ] Geçici dosyaları sil
- [ ] Planı "completed" klasörüne taşı
- [ ] Eski belgeleri arşivle
- [ ] Durum raporunu güncelle

## 5. Uygulama Planı

1. Yeni klasör yapısını oluştur
2. AI_DEVELOPMENT_GUIDE.md'yi yeniden yaz
3. Yeni şablon dosyalarını oluştur
4. Bilgi tabanı yapısını genişlet
5. Mevcut belgeleri güncelle
6. GitHub'a commit et
