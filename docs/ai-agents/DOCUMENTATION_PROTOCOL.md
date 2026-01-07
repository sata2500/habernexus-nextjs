# AI Agent Documentation Protocol

**Version:** 1.0  
**Last Updated:** 07 January 2026  
**Status:** Active

Bu protokol, AI ajanlarının geliştirme sürecinde dokümantasyon oluşturma ve güncelleme kurallarını tanımlar.

---

## 1. Dokümantasyon Yapısı

### Ana Dizin Dosyaları (Root)
| Dosya | Amaç | Güncelleme Zamanı |
|-------|------|-------------------|
| `README.md` | Proje tanıtımı | Büyük özellik eklendiğinde |
| `CONTRIBUTING.md` | Katkı rehberi | Süreç değişikliğinde |
| `CHANGELOG.md` | Değişiklik geçmişi | Her release'de |
| `ROADMAP.md` | Yol haritası | Özellik tamamlandığında |

### docs/ Klasör Yapısı
```
docs/
├── ai-agents/           # AI ajan protokolleri
│   ├── AI_DEVELOPMENT_GUIDE.md
│   ├── WORKFLOW.md
│   ├── QUALITY_CHECKLIST.md
│   ├── ONBOARDING.md
│   ├── COMMUNICATION_PROTOCOL.md
│   └── DOCUMENTATION_PROTOCOL.md (bu dosya)
├── ai-plans/            # Geliştirme planları
│   ├── active/          # Devam eden planlar
│   ├── completed/       # Tamamlanan planlar
│   └── templates/       # Şablonlar
├── ai-knowledge-base/   # Bilgi tabanı
│   ├── decisions/       # ADR'ler
│   ├── errors/          # Hata çözümleri
│   ├── learnings/       # Öğrenilen dersler
│   └── tech-stack/      # Teknoloji versiyonları
├── guides/              # Kullanıcı rehberleri
└── wiki/                # Ek wiki içeriği
```

### wiki/ Klasörü (GitHub Wiki Senkronizasyonu)
```
wiki/
├── Home.md                        # Wiki ana sayfası
├── Getting-Started.md             # Başlangıç rehberi
├── Project-Philosophy-&-Architecture.md
├── Development-&-Contribution.md
├── AI-Content-Engine.md
├── User-&-Role-System.md
├── Admin-Dashboard.md
└── Deployment.md
```

> **ÖNEMLİ:** `wiki/` klasöründeki dosyalar otomatik olarak GitHub Wiki'ye senkronize edilir.

---

## 2. Zorunlu Dokümantasyon Görevleri

### Her Geliştirme Görevinde

1. **Plan Dosyası Oluştur**
   - `docs/ai-plans/active/` klasöründe plan oluştur
   - Şablon: `docs/ai-plans/templates/PLAN_TEMPLATE.md`

2. **Hata Dokümantasyonu**
   - Yeni bir hata ile karşılaşıldığında `docs/ai-knowledge-base/errors/` klasörüne ekle
   - Şablon: `docs/ai-plans/templates/ERROR_TEMPLATE.md`

3. **Öğrenilen Dersler**
   - Önemli bir çözüm bulunduğunda `docs/ai-knowledge-base/learnings/` klasörüne ekle

### Özellik Tamamlandığında

1. **ROADMAP.md Güncelle**
   - Tamamlanan özelliği ✅ ile işaretle
   - İlerleme yüzdesini güncelle

2. **CHANGELOG.md Güncelle** (opsiyonel)
   - Büyük özellikler için değişiklik notu ekle

3. **Plan Dosyasını Taşı**
   - `docs/ai-plans/active/` → `docs/ai-plans/completed/`

4. **Wiki Güncelle** (gerekirse)
   - Kullanıcı-facing özellikler için `wiki/` klasöründeki ilgili dosyayı güncelle

---

## 3. Wiki Senkronizasyon Kuralları

### Otomatik Senkronizasyon
- `wiki/` klasöründeki değişiklikler `master` branch'e push edildiğinde otomatik olarak GitHub Wiki'ye senkronize edilir
- GitHub Action: `.github/workflows/wiki-sync.yml`

### Wiki Dosya İsimlendirme
- Boşluk yerine `-` kullan
- Özel karakterler için `&` kullanılabilir (GitHub Wiki uyumlu)
- Örnek: `Project-Philosophy-&-Architecture.md`

### Wiki Linkleri
Wiki içi linkler için:
```markdown
# Doğru (Wiki içi)
[Getting Started](Getting-Started)

# Doğru (Repo dosyasına)
[ROADMAP](https://github.com/sata2500/habernexus-nextjs/blob/main/ROADMAP.md)
```

---

## 4. Link Kuralları

### Repo İçi Linkler (Markdown dosyalarında)
```markdown
# Aynı klasörde
[Dosya](DOSYA.md)

# Alt klasörde
[Dosya](alt-klasor/DOSYA.md)

# Üst klasörde
[Dosya](../DOSYA.md)
```

### Wiki'den Repo'ya Linkler
```markdown
# Her zaman tam URL kullan
[ROADMAP](https://github.com/sata2500/habernexus-nextjs/blob/main/ROADMAP.md)
```

### Repo'dan Wiki'ye Linkler
```markdown
# GitHub Wiki URL'si
[Wiki](https://github.com/sata2500/habernexus-nextjs/wiki)
```

---

## 5. Dokümantasyon Kontrol Listesi

Her PR öncesi kontrol et:

- [ ] Yeni dosyalar için linkler doğru mu?
- [ ] ROADMAP.md güncellendi mi?
- [ ] Plan dosyası oluşturuldu/taşındı mı?
- [ ] Hata dokümantasyonu eklendi mi? (varsa)
- [ ] Wiki güncellemesi gerekiyor mu?

---

## 6. Şablonlar

### Yeni Özellik Wiki Sayfası
```markdown
# Özellik Adı

Kısa açıklama.

## Genel Bakış

Özelliğin ne yaptığı.

## Kullanım

Nasıl kullanılacağı.

## Yapılandırma

Ayarlar ve seçenekler.

## Sorun Giderme

Yaygın sorunlar ve çözümleri.
```

### Yeni Rehber Sayfası
```markdown
# Rehber Başlığı

## Ön Koşullar

Gerekli hazırlıklar.

## Adım 1: ...

Detaylı açıklama.

## Adım 2: ...

Detaylı açıklama.

## Doğrulama

Başarılı olduğunu nasıl anlarsınız.

## Sorun Giderme

Yaygın sorunlar.
```

---

## 7. Önemli Notlar

> ⚠️ **DİKKAT:** Dosya yollarını değiştirirken tüm referansları güncellemeyi unutma!

> 💡 **İPUCU:** `grep -rn "dosya-adi" .` komutu ile tüm referansları bulabilirsin.

> 📝 **NOT:** Wiki senkronizasyonu sadece `master` branch'e push edildiğinde çalışır.

---

**Son Güncelleme:** 07 Ocak 2026
