# HaberNexus Geliştirme Yol Haritası

Bu doküman, HaberNexus projesinin gelecek planlarını ve sürüm bazlı geliştirme hedeflerini içerir.

## 🎯 Vizyon

HaberNexus'u, herkesin kendi akıllı, tam otomatik ve yönetilebilir haber platformunu kolayca kurabileceği bir çözüm haline getirmek.

---

## 📅 Sürüm Planı

### v1.0: MVP (Minimum Viable Product) - Q1 2026

**Amaç:** Platformun tam otomatik içerik üreten temel işlevselliğini hayata geçirmek.

**Özellikler:**

- ✅ Sade Next.js mimarisi (Docker'sız)
- ✅ SQLite veritabanı + Prisma ORM
- ✅ 3 Seviyeli kullanıcı sistemi (Admin, Yazar, Kullanıcı)
- ✅ Google OAuth ile kimlik doğrulama
- ✅ Admin Dashboard
  - RSS kaynak yönetimi
  - Yazar yönetimi
  - Sistem ayarları (Cron, AI modelleri)
- ✅ Tam otomatik içerik üretim motoru
  - RSS tarama
  - AI ile içerik/başlık üretimi
  - AI ile görsel üretimi
  - Kategoriye göre yazar atama
- ✅ Temel kullanıcı arayüzü
  - Ana sayfa
  - Makale detay sayfası
  - Kategori ve yazar sayfaları

**Tahmini Süre:** 3-4 hafta

---

### v1.1: UX İyileştirmeleri - Q2 2026

**Amaç:** Kullanıcı deneyimini zenginleştirmek ve sitede kalma süresini artırmak.

**Özellikler:**

- [ ] Açık/Koyu tema desteği
- [ ] Okuma listesi (Yer işareti)
- [ ] Okuma süresi göstergesi
- [ ] İlgili makaleler bölümü
- [ ] Popüler makaleler bölümü
- [ ] Basit arama (Başlık ve içerik)
- [ ] Otomatik SEO iyileştirmeleri
- [ ] Sosyal medya paylaşım butonları

**Tahmini Süre:** 1-2 hafta

---

### v1.2: Topluluk ve Bülten - Q2 2026

**Amaç:** Kullanıcılarla düzenli bir bağ kurmak ve topluluk oluşturmaya başlamak.

**Özellikler:**

- [ ] E-posta bültenleri
  - Abone olma sistemi
  - Haftalık popüler haberler gönderimi
- [ ] Makale oylama (Faydalı / Değil)
- [ ] Sistem sağlığı paneli (Admin için)
- [ ] Detaylı analitikler (Temel metrikler)

**Tahmini Süre:** 1-2 hafta

---

### v2.0: Genişleme ve Kişiselleştirme - Q3 2026

**Amaç:** Platformu bir sonraki seviyeye taşıyarak daha akıllı ve kişiselleştirilmiş bir deneyim sunmak.

**Özellikler:**

- [ ] Kişiselleştirilebilir ana sayfa
- [ ] PWA (Progressive Web App) desteği
- [ ] Yorum sistemi (Moderasyonlu)
- [ ] Duygu analizi (AI ile)
- [ ] Detaylı analitikler (Grafikler ve raporlar)
- [ ] Manuel makale yönetimi

**Tahmini Süre:** 3-4 hafta

---

### v2.1: Gelişmiş AI ve Teknik Mükemmellik - Q4 2026

**Amaç:** Arka planı güçlendirerek platformu daha hızlı, daha akıllı ve daha kararlı hale getirmek.

**Özellikler:**

- [ ] Konu/Trend analizi ("Gündem" sayfası)
- [ ] Gelişmiş görsel optimizasyonu (WebP/AVIF)
- [ ] Gelişmiş önbellekleme (Redis ile)
- [ ] Kaynak güvenilirlik skoru

**Tahmini Süre:** 2-3 hafta

---

## 🔮 Gelecek Vizyonu (2027+)

**Gelişmiş AI Özellikleri:**

- Çoklu dil desteği
- Video özetleme
- Sesli haber okuma

**Monetizasyon:**

- Premium abonelik sistemi
- Reklam alanları
- Sponsorlu içerik

**Topluluk:**

- Kullanıcı profilleri
- Takip sistemi
- Bildirimler

---

## 📊 İlerleme Takibi

Her sürümün ilerlemesi GitHub Projects üzerinden takip edilir. Milestone'lar ve issue'lar ile detaylı görev yönetimi yapılır.

**Güncel Durum:** v1.0 geliştirme aşamasında

---

## 🤝 Katkıda Bulunma

Bu yol haritasındaki özelliklere katkıda bulunmak isterseniz:

1. İlgili sürümün milestone'ına bakın
2. Çalışmak istediğiniz bir issue seçin
3. [CONTRIBUTING.md](CONTRIBUTING.md) rehberini takip edin

---

**Son Güncelleme:** 25 Aralık 2025
