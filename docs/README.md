# HaberNexus Dokümantasyon

Bu klasör, HaberNexus projesinin tüm dokümantasyonunu organize bir şekilde içerir.

## 📁 Klasör Yapısı

### [`guides/`](guides/)
**Kullanıcılar için kurulum ve kullanım rehberleri**

Projeyi kurmak ve çalıştırmak için gerekli tüm adım adım rehberler burada bulunur.

- [Ubuntu 24.04 Kurulum Rehberi](guides/UBUNTU_24_04_KURULUM_REHBERI.md)
- [Node.js Güncelleme Rehberi](guides/NODE_JS_UPDATE_GUIDE.md)
- [.env Kurulum Rehberi](guides/ENV_SETUP_GUIDE.md)

---

### [`ai-agents/`](ai-agents/)
**AI ajanları için geliştirme protokolleri ve rehberler**

Tüm AI ajanlarının uyması gereken kurallar, iş akışları ve protokoller burada bulunur.

- [AI Development Guide](ai-agents/AI_DEVELOPMENT_GUIDE.md) - Ana geliştirme rehberi
- [Onboarding](ai-agents/ONBOARDING.md) - Yeni ajanlar için başlangıç
- [Workflow](ai-agents/WORKFLOW.md) - Geliştirme iş akışı
- [Quality Checklist](ai-agents/QUALITY_CHECKLIST.md) - Kalite kontrol listesi
- [Communication Protocol](ai-agents/COMMUNICATION_PROTOCOL.md) - İletişim protokolü

---

### [`ai-plans/`](ai-plans/)
**AI ajanlarının geliştirme planları**

Her AI ajanı, bir özellik geliştirmeden önce detaylı bir plan oluşturur ve bu klasöre kaydeder.

**Yapı:**
```
ai-plans/
├── active/      # Devam eden planlar
├── completed/   # Tamamlanan planlar
└── templates/   # Plan şablonları
```

---

### [`ai-knowledge-base/`](ai-knowledge-base/)
**AI ajanları için paylaşılan bilgi tabanı**

Tüm AI ajanlarının öğrendiği ve paylaştığı bilgiler burada saklanır.

- [`decisions/`](ai-knowledge-base/decisions/) - Mimari kararlar (ADR formatı)
- [`errors/`](ai-knowledge-base/errors/) - Bilinen hatalar ve çözümleri
- [`learnings/`](ai-knowledge-base/learnings/) - Öğrenilen dersler
- [`tech-stack/`](ai-knowledge-base/tech-stack/) - Teknoloji versiyonları

---

### [`archive/`](archive/)
**Eski ve kullanılmayan belgeler**

Artık aktif olmayan ancak tarihsel değeri olan belgeler burada saklanır.

---

## 🎯 Kimler İçin?

| Klasör | Hedef Kitle |
|--------|-------------|
| `guides/` | İnsan kullanıcılar ve geliştiriciler |
| `ai-agents/` | AI ajanları |
| `ai-plans/` | AI ajanları ve proje yöneticileri |
| `ai-knowledge-base/` | AI ajanları |
| `archive/` | Herkes (tarihsel referans) |

---

## 📖 Daha Fazla Bilgi

- Ana proje dokümantasyonu için [README.md](../README.md) dosyasına bakın
- Geliştirme kuralları için [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasına bakın
- Yol haritası için [ROADMAP.md](../ROADMAP.md) dosyasına bakın
