# HaberNexus - Yeni Nesil AI Destekli Haber Platformu

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**HaberNexus**, yapay zeka destekli, tam otomatik bir haber agregasyon ve içerik üretim platformudur. RSS kaynaklarından haberleri otomatik olarak toplayıp, Google Gemini AI ile özgün içerik üreterek yayınlar.

## 🌟 Temel Özellikler

- **Tam Otomatik İçerik Üretimi:** RSS kaynaklarından haberleri tarar, AI ile özgün içerik ve görsel üretir
- **3 Seviyeli Kullanıcı Sistemi:** Admin, Yazar ve Kullanıcı rolleri
- **Gelişmiş Admin Paneli:** RSS yönetimi, yazar yönetimi, AI model ayarları
- **Akıllı Yazar Atama:** AI, kategoriye göre otomatik yazar atar
- **Modern UI/UX:** Açık/koyu tema, okuma listesi, popüler makaleler
- **Basit Mimari:** Docker'sız, sade Next.js + SQLite + PM2

## 🚀 Hızlı Başlangıç

### Gereksinimler

- **Node.js 20.9.0 veya üstü** (Next.js 16 gereksinimi)
- npm veya yarn
- PM2 (production için)

> **⚠️ Önemli:** Eğer Node.js versiyonunuz 20.9.0'dan düşükse, lütfen [NODE_JS_UPDATE_GUIDE.md](NODE_JS_UPDATE_GUIDE.md) dosyasını okuyun.

### Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/sata2500/habernexus-nextjs.git
cd habernexus-nextjs

# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun ve düzenleyin
cp .env.example .env
# .env dosyasını düzenleyip API anahtarlarını ekleyin
# Detaylı bilgi için: ENV_SETUP_GUIDE.md

# Veritabanını oluşturun
npx prisma migrate dev

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresini açın.

## 📚 Dokümantasyon

- **[Katkıda Bulunma Rehberi](CONTRIBUTING.md)** - Geliştirme kuralları ve süreçleri
- **[Yol Haritası](ROADMAP.md)** - Planlanan özellikler ve sürümler
- **[Node.js Güncelleme Rehberi](NODE_JS_UPDATE_GUIDE.md)** - Node.js versiyon yükseltme
- **[.env Kurulum Rehberi](ENV_SETUP_GUIDE.md)** - API anahtarlarını nasıl alırsınız
- **[GitHub Wiki](https://github.com/sata2500/habernexus-nextjs/wiki)** - Detaylı teknik dokümantasyon

## 🤝 Katkıda Bulunma

Bu proje hem insanlar hem de AI ajanları tarafından geliştirilmek üzere tasarlanmıştır.

- **İnsan Geliştiriciler:** Lütfen [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.
- **AI Ajanları:** Lütfen **öncelikle** [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) dosyasını okuyun. Bu sizin ana yönerge setinizdir.

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👤 Geliştirici

**Salih TANRISEVEN**
- Email: salihtanriseven25@gmail.com
- GitHub: [@sata2500](https://github.com/sata2500)
- Website: [habernexus.com](https://habernexus.com)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - ORM
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI modelleri
