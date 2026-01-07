# HaberNexus Geliştirme Yol Haritası

Bu doküman, HaberNexus projesinin gelecek planlarını ve sürüm bazlı geliştirme hedeflerini içerir. Yol haritası, hem insan geliştiricilerin hem de AI ajanlarının katkılarını yönlendirmek için tasarlanmıştır.

## 🎯 Vizyon

HaberNexus'u, herkesin kendi akıllı, tam otomatik ve yönetilebilir haber platformunu kolayca kurabileceği bir çözüm haline getirmek.

---

## ⚡ Geliştirme Hızı Hakkında

Bu proje AI ajanları ile birlikte geliştirilmektedir. Bu sayede geleneksel geliştirme süreçlerine kıyasla çok daha hızlı ilerleme kaydedilmektedir. Aşağıdaki tahmini süreler AI destekli geliştirme hızını yansıtmaktadır.

---

## 📅 Sürüm Planı

### v1.0: MVP (Minimum Viable Product) ✅

**Durum:** Tamamlandı  
**Amaç:** Platformun tam otomatik içerik üreten temel işlevselliğini hayata geçirmek.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| ✅ | Sade Next.js mimarisi (Docker'sız) | Temeller atıldı. |
| ✅ | SQLite veritabanı + Prisma ORM | Veritabanı şeması hazır. |
| ✅ | 3 Seviyeli kullanıcı sistemi (Admin, Yazar, Kullanıcı) | Auth.js v5 ile rol tabanlı erişim kontrolü tamamlandı. |
| ✅ | Google OAuth ile kimlik doğrulama | Auth.js v5 entegrasyonu tamamlandı. |
| ✅ | Admin Dashboard | Gerçek verilerle dinamik dashboard tamamlandı. |
| ✅ | Tam otomatik içerik üretim motoru | Gemini API entegrasyonu ve RSS parsing tamamlandı. |
| ✅ | Temel kullanıcı arayüzü | Ana sayfa, makale detay, kategori sayfaları tamamlandı. |
| ✅ | İlk kullanıcı otomatik admin rolü | İlk kayıt olan kullanıcı otomatik ADMIN rolü alır. |
| ✅ | Google profil fotoğrafı desteği | next.config.js domain yapılandırması tamamlandı. |

---

### v1.1: Veri Entegrasyonu ve Temel İşlevsellik

**Durum:** Devam Ediyor  
**Tahmini Süre:** 1-2 gün  
**Amaç:** Demo verilerden gerçek veritabanı entegrasyonuna geçiş ve temel kullanıcı etkileşimlerini aktif hale getirmek.

| Durum | Özellik | Geliştirici Notu | Tahmini Süre |
|---|---|---|---|
| ⏳ | Haber detay sayfası veri entegrasyonu | Demo veri yerine veritabanından çekme. | ~2 saat |
| ⏳ | Kategori sayfası veri entegrasyonu | Demo veri yerine veritabanından çekme. Sayfalama desteği. | ~2 saat |
| ⏳ | Okuma listesi (Bookmark) API | UI bileşeni hazır, backend API eksik. | ~3 saat |
| ⏳ | Makale oylama API | UI bileşeni hazır, backend API eksik. | ~2 saat |
| ⏳ | Görüntülenme sayacı API | viewCount artırma mekanizması. | ~1 saat |

---

### v1.2: Admin Panel Tamamlama

**Durum:** Bekliyor  
**Tahmini Süre:** 2-3 gün  
**Amaç:** Admin panelindeki tüm sayfaları işlevsel hale getirmek.

| Durum | Özellik | Geliştirici Notu | Tahmini Süre |
|---|---|---|---|
| ⏳ | Admin Kullanıcı Yönetimi | `/admin/kullanicilar` - Rol değiştirme, silme. | ~4 saat |
| ⏳ | Admin Makale Yönetimi | `/admin/makaleler` - Düzenleme, silme, yayın durumu. | ~5 saat |
| ⏳ | Admin Ayarlar Sayfası | `/admin/ayarlar` - Sistem ayarları yönetimi. | ~3 saat |
| ⏳ | Admin Analitik Sayfası | `/admin/analitik` - Gerçek metrikler. | ~4 saat |

---

### v1.3: UX ve Arama İyileştirmeleri

**Durum:** Kısmen Tamamlandı  
**Tahmini Süre:** 1-2 gün  
**Amaç:** Kullanıcı deneyimini zenginleştirmek ve arama işlevselliğini eklemek.

| Durum | Özellik | Geliştirici Notu | Tahmini Süre |
|---|---|---|---|
| ✅ | Açık/Koyu tema desteği | Tailwind CSS dark mode entegrasyonu tamamlandı. | - |
| ✅ | İlgili makaleler bölümü | Haber detay sayfasında "İlgili Haberler" bölümü eklendi. | - |
| ✅ | Popüler makaleler bölümü | Ana sayfada "En Çok Okunanlar" bölümü eklendi. | - |
| ⏳ | Basit arama (Başlık ve içerik) | UI butonu hazır, arama fonksiyonu bekliyor. | ~3 saat |
| ✅ | Otomatik SEO iyileştirmeleri | Meta etiketleri, OpenGraph ve Twitter Card desteği eklendi. | - |
| ⏳ | AI Destekli Özetleme UI | Gemini API entegrasyonu tamamlandı, UI entegrasyonu bekliyor. | ~2 saat |

---

### v1.4: Topluluk ve İletişim

**Durum:** Kısmen Tamamlandı  
**Tahmini Süre:** 1 gün  
**Amaç:** Kullanıcılarla etkileşimi artırmak ve iletişim kanallarını açmak.

| Durum | Özellik | Geliştirici Notu | Tahmini Süre |
|---|---|---|---|
| ⏳ | Newsletter abonelik API | UI formu hazır, backend API eksik. | ~2 saat |
| ⏳ | Paylaşım butonları işlevselliği | UI butonları hazır, paylaşım fonksiyonu eksik. | ~1 saat |
| ✅ | Profesyonel Otomatik Kurulum Sistemi | Install script v2.0.2 tamamlandı. | - |

---

### v2.0: Genişleme ve Kişiselleştirme

**Durum:** Planlandı  
**Tahmini Süre:** 1-2 hafta  
**Amaç:** Platformu bir sonraki seviyeye taşıyarak daha akıllı ve kişiselleştirilmiş bir deneyim sunmak.

| Durum | Özellik | Geliştirici Notu |
|---|---|---|
| 🔲 | Kişiselleştirilebilir ana sayfa | Kullanıcıların ilgi alanlarına göre makaleler. |
| 🔲 | PWA (Progressive Web App) desteği | Mobil cihazlarda daha iyi bir deneyim. |
| 🔲 | Yorum sistemi (Moderasyonlu) | Kullanıcıların makalelere yorum yapabilmesi. |
| 🔲 | Duygu analizi (AI ile) | Makalelerin genel duygu tonunu belirleme. |

---

## 🔮 Gelecek Vizyonu

- **Gelişmiş AI Özellikleri:** Çoklu dil desteği, video özetleme, sesli haber okuma.
- **Monetizasyon:** Premium abonelik sistemi, reklam alanları, sponsorlu içerik.
- **Topluluk:** Kullanıcı profilleri, takip sistemi, bildirimler.

---

## 📊 Geliştirme İlerlemesi

### v1.0 MVP İlerlemesi
- **Tamamlanan:** 9/9 özellik (%100) ✅

### v1.1 Veri Entegrasyonu İlerlemesi
- **Tamamlanan:** 0/5 özellik (%0)
- **Tahmini Toplam Süre:** ~10 saat

### v1.2 Admin Panel İlerlemesi
- **Tamamlanan:** 0/4 özellik (%0)
- **Tahmini Toplam Süre:** ~16 saat

### v1.3 UX İyileştirmeleri İlerlemesi
- **Tamamlanan:** 4/6 özellik (%67)
- **Tahmini Kalan Süre:** ~5 saat

### v1.4 Topluluk İlerlemesi
- **Tamamlanan:** 1/3 özellik (%33)
- **Tahmini Kalan Süre:** ~3 saat

---

## 🎯 v1 Tam İşlevsellik Hedefi

**Tahmini Tamamlanma Süresi:** ~1 hafta (AI destekli geliştirme ile)

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
3. [CONTRIBUTING.md](CONTRIBUTING.md) ve [docs/ai-agents/AI_DEVELOPMENT_GUIDE.md](docs/ai-agents/AI_DEVELOPMENT_GUIDE.md) rehberlerini takip edin
4. `docs/ai-plans/active/` klasöründe kendi planınızı oluşturun

---

**Son Güncelleme:** 07 Ocak 2026
