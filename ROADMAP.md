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
| ✅ | 3 Seviyeli kullanıcı sistemi (Admin, Yazar, Kullanıcı) | Auth.js v5 ile rol tabanlı erişim kontrolü tamamlandı (26 Ara 2025). |
| ✅ | Google OAuth ile kimlik doğrulama | Auth.js v5 entegrasyonu tamamlandı (26 Ara 2025). |
| ✅ | Admin Dashboard | Gerçek verilerle dinamik dashboard tamamlandı (26 Ara 2025). |
| ✅ | Tam otomatik içerik üretim motoru | Gemini API entegrasyonu ve RSS parsing tamamlandı (26 Ara 2025). |
| ✅ | Temel kullanıcı arayüzü | Ana sayfa, makale detay, kategori sayfaları tamamlandı (26 Ara 2025). |

---

### v1.1: UX ve AI İyileştirmeleri - Q2 2026

**Amaç:** Kullanıcı deneyimini zenginleştirmek ve AI yeteneklerini derinleştirmek.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ✅ | Açık/Koyu tema desteği | Tailwind CSS dark mode entegrasyonu tamamlandı (26 Ara 2025). |
| ⏳ | Okuma listesi (Yer işareti) | UI bileşeni hazır, backend API bekliyor. |
| ✅ | İlgili makaleler bölümü | Haber detay sayfasında "İlgili Haberler" bölümü eklendi (26 Ara 2025). |
| ✅ | Popüler makaleler bölümü | Ana sayfada "En Çok Okunanlar" bölümü eklendi (26 Ara 2025). |
| ⏳ | Basit arama (Başlık ve içerik) | UI butonu hazır, arama fonksiyonu bekliyor. |
| ✅ | Otomatik SEO iyileştirmeleri | Meta etiketleri, OpenGraph ve Twitter Card desteği eklendi (26 Ara 2025). |
| ⏳ | AI Destekli Özetleme | Gemini API entegrasyonu tamamlandı, UI entegrasyonu bekliyor. |

---

### v1.2: Topluluk ve Analitik - Q2 2026

**Amaç:** Kullanıcılarla etkileşimi artırmak ve veri odaklı kararlar almak.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ✅ | E-posta bültenleri | Newsletter abonelik formu UI'ı tamamlandı (26 Ara 2025). Backend bekliyor. |
| ⏳ | Makale oylama (Faydalı / Değil) | UI bileşeni hazır, backend API bekliyor. |
| ✅ | Sistem sağlığı paneli (Admin için) | Admin Dashboard'da sistem durumu bölümü eklendi (26 Ara 2025). |
| ⏳ | Detaylı analitikler (Temel metrikler) | Demo veriler mevcut, gerçek veri entegrasyonu bekliyor. |
| ✅ | Profesyonel Otomatik Kurulum Sistemi | Install script v2.0.2 tamamlandı (29 Ara 2025). curl \| bash desteği. |

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

## 📊 Geliştirme İlerlemesi

### v1.0 MVP İlerlemesi
- **Tamamlanan:** 7/7 özellik (%100) ✅
- **Devam Eden:** 0/7 özellik

### v1.1 UX İyileştirmeleri İlerlemesi
- **Tamamlanan:** 4/7 özellik (%57)
- **Devam Eden:** 3/7 özellik

### v1.2 Topluluk ve Analitik İlerlemesi
- **Tamamlanan:** 3/5 özellik (%60)
- **Devam Eden:** 2/5 özellik

---

## 🤝 Katkıda Bulunma

Bu yol haritasındaki özelliklere katkıda bulunmak isterseniz:

1. İlgili sürümün milestone'ına bakın.
2. Çalışmak istediğiniz bir issue seçin.
3. [CONTRIBUTING.md](CONTRIBUTING.md) rehberini takip edin.

---

**Son Güncelleme:** 29 Aralık 2025
