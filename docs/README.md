# HaberNexus Dokümantasyon

Bu klasör, HaberNexus projesinin tüm dokümantasyonunu organize bir şekilde içerir.

## 📁 Klasör Yapısı

### [`guides/`](guides/)
**Kullanıcılar için kurulum ve kullanım rehberleri**

Projeyi kurmak ve çalıştırmak için gerekli tüm adım adım rehberler burada bulunur.

- [Node.js Güncelleme Rehberi](guides/NODE_JS_UPDATE_GUIDE.md)
- [.env Kurulum Rehberi](guides/ENV_SETUP_GUIDE.md)

---

### [`ai-plans/`](ai-plans/)
**AI ajanlarının geliştirme planları**

Her AI ajanı, bir özellik geliştirmeden önce detaylı bir plan oluşturur ve bu klasöre kaydeder. Bu, izlenebilirlik ve bilgi paylaşımı sağlar.

**Yapı:**
```
ai-plans/
└── issue-{N}/
    └── {plan-name}.md
```

---

### [`ai-knowledge-base/`](ai-knowledge-base/)
**AI ajanları için paylaşılan bilgi tabanı**

Tüm AI ajanlarının öğrendiği ve paylaştığı bilgiler burada saklanır. Bu, "Unified Agent" felsefesinin temelidir.

- [`decision_log.md`](ai-knowledge-base/decision_log.md) - Mimari kararlar (ADR formatı)
- [`known_errors.md`](ai-knowledge-base/known_errors.md) - Bilinen hatalar ve çözümleri

---

### [`archive/`](archive/)
**Eski ve kullanılmayan belgeler**

Artık aktif olmayan ancak tarihsel değeri olan belgeler burada saklanır.

---

## 🎯 Kimler İçin?

| Klasör | Hedef Kitle |
|--------|-------------|
| `guides/` | İnsan kullanıcılar ve geliştiriciler |
| `ai-plans/` | AI ajanları ve proje yöneticileri |
| `ai-knowledge-base/` | AI ajanları |
| `archive/` | Herkes (tarihsel referans) |

---

## 📖 Daha Fazla Bilgi

- Ana proje dokümantasyonu için [README.md](../README.md) dosyasına bakın
- Geliştirme kuralları için [CONTRIBUTING.md](../CONTRIBUTING.md) dosyasına bakın
- AI ajanları için [AI_DEVELOPMENT_GUIDE.md](../AI_DEVELOPMENT_GUIDE.md) dosyasına bakın
