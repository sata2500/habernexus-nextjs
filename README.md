# HaberNexus

<p align="center">
  <a href="https://habernexus.com">
    <img src="https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/public/logo.png" alt="HaberNexus Logo" width="120" height="120">
  </a>
</p>

<h3 align="center">Yeni Nesil AI Destekli Haber Platformu</h3>

<p align="center">
  HaberNexus, yapay zeka destekli, tam otomatik bir haber agregasyon ve içerik üretim platformudur.
  <br />
  <a href="https://github.com/sata2500/habernexus-nextjs/wiki"><strong>Wiki'yi Keşfet »</strong></a>
  <br />
  <br />
  <a href="https://habernexus.com">Canlı Demo</a>
  ·
  <a href="https://github.com/sata2500/habernexus-nextjs/issues/new?template=bug_report.md">Hata Bildir</a>
  ·
  <a href="https://github.com/sata2500/habernexus-nextjs/issues/new?template=feature_request.md">Özellik İste</a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></a>
  <a href="https://github.com/sata2500/habernexus-nextjs/releases"><img src="https://img.shields.io/github/v/release/sata2500/habernexus-nextjs" alt="Release"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
  <a href="https://github.com/sata2500/habernexus-nextjs/stargazers"><img src="https://img.shields.io/github/stars/sata2500/habernexus-nextjs" alt="Stars"></a>
</p>

---

## 🎯 Proje Hakkında

HaberNexus, RSS kaynaklarından haberleri otomatik olarak toplayıp, Google Gemini AI ile özgün içerik üreterek yayınlayan, kendi sunucunuzda barındırabileceğiniz (self-hosted) bir platformdur.

### Neden HaberNexus?

*   **Tam Otomasyon:** İçerik akışını %100 otomatik hale getirerek manuel iş yükünü ortadan kaldırır.
*   **Veri Egemenliği:** Tüm verileriniz (veritabanı, medya dosyaları) kendi sunucunuzda kalır. Üçüncü parti servislere bağımlılık yoktur.
*   **Maliyet Etkin:** Vercel Postgres, S3 gibi pahalı bulut servislerine olan ihtiyacı ortadan kaldırır.
*   **Basit ve Güçlü Mimari:** Karmaşık mikroservisler yerine, bakımı kolay, iyi yapılandırılmış bir monolit mimari sunar.

---

## ✨ Temel Özellikler

- **AI İçerik Motoru:** RSS kaynaklarını tarar, AI ile özgün içerik ve görsel üretir.
- **3 Seviyeli Kullanıcı Sistemi:** Admin, Yazar ve Kullanıcı rolleri.
- **Gelişmiş Admin Paneli:** RSS yönetimi, kullanıcı yönetimi, AI model ayarları.
- **Modern UI/UX:** Açık/koyu tema, okuma listesi, popüler makaleler.
- **Basit Kurulum:** Docker'sız, sade Next.js + SQLite + PM2.

---

## 🛠️ Teknoloji Mimarisi

| Bileşen | Teknoloji | Neden? |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | Tek bir framework içinde tam yığın (frontend ve backend) deneyimi. |
| **Veritabanı** | [SQLite](https://www.sqlite.org/index.html) | Yönetimi ve yedeklemesi kolay, tek dosyalı veritabanı. |
| **ORM** | [Prisma](https://www.prisma.io/) | Modern, tip güvenli veritabanı araç kiti. |
| **Kimlik Doğrulama** | [Auth.js (NextAuth.js v5)](https://authjs.dev/) | Google OAuth entegrasyonunu basitleştiren açık kaynaklı çözüm. |
| **AI Entegrasyonu** | [Google Gemini API](https://ai.google.dev/) | İçerik analizi, üretimi ve görsel oluşturma için güçlü modeller. |
| **Deployment** | [PM2](https://pm2.keymetrics.io/) | Uygulamanın sürekli çalışmasını sağlayan production seviyesi process manager. |

---

## 🚀 Hızlı Başlangıç

### 🌟 Tek Satırlık Kurulum (Ubuntu 22.04/24.04)

Temiz bir Ubuntu sunucusunda aşağıdaki komutu çalıştırın:

```bash
curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash
```

Bu komut otomatik olarak:
- ✅ Node.js 22 kurulumu
- ✅ PM2 process manager kurulumu
- ✅ Caddy web sunucusu (otomatik SSL)
- ✅ Proje klonlama ve yapılandırma
- ✅ Veritabanı kurulumu
- ✅ Production build
- ✅ Servis olarak başlatma

**Kurulum yaklaşık 5-10 dakika sürer.**

### Yönetim Komutları

Kurulum sonrası `habernexus` komutu ile uygulamayı yönetebilirsiniz:

```bash
habernexus status    # Durum görüntüleme
habernexus logs      # Logları izleme
habernexus restart   # Yeniden başlatma
habernexus update    # Güncelleme
habernexus backup    # Yedekleme
```

---

### Manuel Kurulum (Geliştirme Ortamı)

Detaylı kurulum adımları için **[Getting Started](https://github.com/sata2500/habernexus-nextjs/wiki/Getting-Started)**, otomatik deployment için ise **[Otomatik Deployment (Webhook Sistemi)](https://github.com/sata2500/habernexus-nextjs/wiki/Auto-Deployment)** wiki sayfasını ziyaret edin.

#### Ön Koşullar

- **Node.js** v20.9.0 veya üzeri
- **npm** v10 veya üzeri

#### Kurulum Adımları

```bash
# 1. Projeyi klonlayın
git clone https://github.com/sata2500/habernexus-nextjs.git
cd habernexus-nextjs

# 2. Bağımlılıkları yükleyin (ÖNEMLİ!)
# Bu adım tüm gerekli paketleri (lucide-react, clsx, tailwind-merge vb.) indirir
npm install

# 3. .env dosyasını oluşturun
cp .env.example .env

# 4. Prisma client'ı oluşturun
npx prisma generate

# 5. Veritabanını oluşturun
npx prisma db push

# 6. Geliştirme sunucusunu başlatın
npm run dev
```

> ⚠️ **Önemli:** `npm install` komutu mutlaka çalıştırılmalıdır. Aksi takdirde "Module not found" hataları alırsınız.

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 🤝 Katkıda Bulunma: İnsanlar ve AI Ajanlar İçin

Bu proje, insanlar ve AI ajanlarının **birlikte** ve **uyum içinde** çalışması için tasarlanmıştır. Amacımız, tüm geliştiricilerin, kim olursa olsun, tek bir birleşik geliştirici gibi hareket etmesini sağlamaktır.

- **İnsan Geliştiriciler:** Lütfen [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.
- **AI Ajanları:** Geliştirmeye başlamadan önce [AI_DEVELOPMENT_GUIDE.md](docs/ai-agents/AI_DEVELOPMENT_GUIDE.md) dosyasını okuyarak "Birleşik Ajan" geliştirme çerçevesini ve `docs/ai-agents` klasöründeki tüm protokolleri anlamalısınız.

---

## 🗺️ Yol Haritası

Gelecek planlarımızı ve geliştirme hedeflerimizi görmek için **[ROADMAP.md](ROADMAP.md)** dosyasını inceleyin.

---

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👤 Geliştirici

**Salih TANRISEVEN**
- **GitHub:** [@sata2500](https://github.com/sata2500)
- **Email:** salihtanriseven25@gmail.com
- **Website:** [habernexus.com](https://habernexus.com)
