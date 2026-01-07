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
| ✅ | İlk kullanıcı otomatik admin rolü | İlk kayıt olan kullanıcı otomatik ADMIN rolü alır (07 Oca 2026). |
| ✅ | Google profil fotoğrafı desteği | next.config.js domain yapılandırması tamamlandı (07 Oca 2026). |

---

### v1.1: Veri Entegrasyonu ve Temel İşlevsellik - Q1 2026

**Amaç:** Demo verilerden gerçek veritabanı entegrasyonuna geçiş ve temel kullanıcı etkileşimlerini aktif hale getirmek.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ⏳ | Haber detay sayfası veri entegrasyonu | Demo veri yerine veritabanından çekme. `app/haber/[slug]/page.tsx` dosyası güncellenmeli. |
| ⏳ | Kategori sayfası veri entegrasyonu | Demo veri yerine veritabanından çekme. Sayfalama desteği eklenmeli. |
| ⏳ | Okuma listesi (Bookmark) API | UI bileşeni hazır, backend API eksik. Prisma'da `Bookmark` modeli mevcut. |
| ⏳ | Makale oylama API | UI bileşeni hazır, backend API eksik. Prisma'da `ArticleVote` modeli mevcut. |
| ⏳ | Görüntülenme sayacı API | `viewCount` artırma mekanizması. Duplicate prevention gerekli. |

---

### v1.2: Admin Panel Tamamlama - Q1 2026

**Amaç:** Admin panelindeki tüm sayfaları işlevsel hale getirmek.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ⏳ | Admin Kullanıcı Yönetimi | `/admin/kullanicilar` sayfası eksik. Rol değiştirme, kullanıcı silme özellikleri. |
| ⏳ | Admin Makale Yönetimi | `/admin/makaleler` sayfası eksik. Düzenleme, silme, yayın durumu yönetimi. |
| ⏳ | Admin Ayarlar Sayfası | `/admin/ayarlar` sayfası eksik. `SystemSetting` modeli mevcut. |
| ⏳ | Admin Analitik Sayfası | `/admin/analitik` sayfası eksik. Gerçek metrikler ile dashboard. |

---

### v1.3: UX ve Arama İyileştirmeleri - Q2 2026

**Amaç:** Kullanıcı deneyimini zenginleştirmek ve arama işlevselliğini eklemek.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ✅ | Açık/Koyu tema desteği | Tailwind CSS dark mode entegrasyonu tamamlandı (26 Ara 2025). |
| ✅ | İlgili makaleler bölümü | Haber detay sayfasında "İlgili Haberler" bölümü eklendi (26 Ara 2025). |
| ✅ | Popüler makaleler bölümü | Ana sayfada "En Çok Okunanlar" bölümü eklendi (26 Ara 2025). |
| ⏳ | Basit arama (Başlık ve içerik) | UI butonu hazır, arama fonksiyonu bekliyor. |
| ✅ | Otomatik SEO iyileştirmeleri | Meta etiketleri, OpenGraph ve Twitter Card desteği eklendi (26 Ara 2025). |
| ⏳ | AI Destekli Özetleme UI | Gemini API entegrasyonu tamamlandı, UI entegrasyonu bekliyor. |

---

### v1.4: Topluluk ve İletişim - Q2 2026

**Amaç:** Kullanıcılarla etkileşimi artırmak ve iletişim kanallarını açmak.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ⏳ | Newsletter abonelik API | UI formu hazır, backend API eksik. `NewsletterSubscription` modeli mevcut. |
| ⏳ | Paylaşım butonları işlevselliği | UI butonları hazır, paylaşım fonksiyonu eksik. |
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
- **Tamamlanan:** 9/9 özellik (%100) ✅
- **Devam Eden:** 0/9 özellik

### v1.1 Veri Entegrasyonu İlerlemesi
- **Tamamlanan:** 0/5 özellik (%0)
- **Devam Eden:** 5/5 özellik

### v1.2 Admin Panel İlerlemesi
- **Tamamlanan:** 0/4 özellik (%0)
- **Devam Eden:** 4/4 özellik

### v1.3 UX İyileştirmeleri İlerlemesi
- **Tamamlanan:** 4/6 özellik (%67)
- **Devam Eden:** 2/6 özellik

### v1.4 Topluluk İlerlemesi
- **Tamamlanan:** 1/3 özellik (%33)
- **Devam Eden:** 2/3 özellik

---

## 🎯 v1 Tam İşlevsellik Hedefi

v1'in tam işlevsel kabul edilmesi için aşağıdaki kriterlerin karşılanması gerekmektedir:

### Zorunlu Kriterler (Must Have)
- [ ] Tüm sayfalar gerçek veritabanı verisi kullanmalı (demo veri olmamalı)
- [ ] Admin panelindeki tüm sayfalar işlevsel olmalı
- [ ] Bookmark ve oylama sistemleri çalışır durumda olmalı
- [ ] Arama fonksiyonu aktif olmalı

### İsteğe Bağlı Kriterler (Nice to Have)
- [ ] Newsletter sistemi aktif
- [ ] AI özetleme UI entegrasyonu
- [ ] Detaylı analitikler

---

## 🤝 Katkıda Bulunma

Bu yol haritasındaki özelliklere katkıda bulunmak isterseniz:

1. İlgili sürümün özelliklerinden birini seçin
2. GitHub'da ilgili issue'yu oluşturun veya mevcut bir issue'yu alın
3. [CONTRIBUTING.md](CONTRIBUTING.md) ve [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) rehberlerini takip edin
4. `docs/ai-plans/active/` klasöründe kendi planınızı oluşturun

---

**Son Güncelleme:** 07 Ocak 2026
