# HaberNexus Geliştirme Yol Haritası

Bu doküman, HaberNexus projesinin gelecek planlarını ve sürüm bazlı geliştirme hedeflerini içerir. Yol haritası, hem insan geliştiricilerin hem de AI ajanlarının katkılarını yönlendirmek için tasarlanmıştır.

## 🎯 Vizyon

HaberNexus'u, herkesin kendi akıllı, tam otomatik ve yönetilebilir haber platformunu kolayca kurabileceği bir çözüm haline getirmek.

---

## 📅 Sürüm Planı

### v1.0: MVP (Minimum Viable Product) - Q1 2026

**Amaç:** Platformun tam otomatik içerik üreten temel işlevselliğini hayata geçirmek.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ✅ | Sade Next.js mimarisi (Docker'sız) | Temeller atıldı. |
| ✅ | SQLite veritabanı + Prisma ORM | Veritabanı şeması hazır. |
| ⏳ | 3 Seviyeli kullanıcı sistemi (Admin, Yazar, Kullanıcı) | Temel yapı hazır, rollerin yetkileri detaylandırılacak. |
| ⏳ | Google OAuth ile kimlik doğrulama | Auth.js v5 entegrasyonu yapılacak. |
| ⏳ | Admin Dashboard | Temel CRUD işlemleri (RSS, Kullanıcı). |
| ⏳ | Tam otomatik içerik üretim motoru | Gemini API entegrasyonu yapılacak. |
| ⏳ | Temel kullanıcı arayüzü | Ana sayfa, makale detay, kategori ve yazar sayfaları. |

---

### v1.1: UX ve AI İyileştirmeleri - Q2 2026

**Amaç:** Kullanıcı deneyimini zenginleştirmek ve AI yeteneklerini derinleştirmek.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| 🔲 | Açık/Koyu tema desteği | Kullanıcı arayüzü iyileştirmesi. |
| 🔲 | Okuma listesi (Yer işareti) | Kullanıcıların makaleleri kaydetmesini sağlar. |
| 🔲 | İlgili makaleler bölümü | AI destekli makale önerileri. |
| 🔲 | Popüler makaleler bölümü | Okunma sayılarına göre sıralama. |
| 🔲 | Basit arama (Başlık ve içerik) | Temel arama fonksiyonu. |
| 🔲 | Otomatik SEO iyileştirmeleri | Meta etiketleri, sitemap.xml, robots.txt. |
| 🔲 | AI Destekli Özetleme | Makaleler için kısa özetler oluşturma. |

---

### v1.2: Topluluk ve Analitik - Q2 2026

**Amaç:** Kullanıcılarla etkileşimi artırmak ve veri odaklı kararlar almak.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| 🔲 | E-posta bültenleri | Haftalık popüler haberler gönderimi. |
| 🔲 | Makale oylama (Faydalı / Değil) | Kullanıcı geri bildirimlerini toplama. |
| 🔲 | Sistem sağlığı paneli (Admin için) | Cron job durumu, AI API kullanımı. |
| 🔲 | Detaylı analitikler (Temel metrikler) | Ziyaretçi sayısı, en çok okunan makaleler. |

---

### v2.0: Genişleme ve Kişiselleştirme - Q3 2026

**Amaç:** Platformu bir sonraki seviyeye taşıyarak daha akıllı ve kişiselleştirilmiş bir deneyim sunmak.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| 🔲 | Kişiselleştirilebilir ana sayfa | Kullanıcıların ilgi alanlarına göre makaleler. |
| 🔲 | PWA (Progressive Web App) desteği | Mobil cihazlarda daha iyi bir deneyim. |
| 🔲 | Yorum sistemi (Moderasyonlu) | Kullanıcıların makalelere yorum yapabilmesi. |
| 🔲 | Duygu analizi (AI ile) | Makalelerin genel duygu tonunu belirleme. |

---

## 🔮 Gelecek Vizyonu (2027+)

- **Gelişmiş AI Özellikleri:** Çoklu dil desteği, video özetleme, sesli haber okuma.
- **Monetizasyon:** Premium abonelik sistemi, reklam alanları, sponsorlu içerik.
- **Topluluk:** Kullanıcı profilleri, takip sistemi, bildirimler.

---

## 🤝 Katkıda Bulunma

Bu yol haritasındaki özelliklere katkıda bulunmak isterseniz:

1. İlgili sürümün milestone'ına bakın.
2. Çalışmak istediğiniz bir issue seçin.
3. [CONTRIBUTING.md](CONTRIBUTING.md) rehberini takip edin.

---

**Son Güncelleme:** 26 Aralık 2025
