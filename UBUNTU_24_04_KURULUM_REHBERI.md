# HaberNexus Kurulum Rehberi: Ubuntu 24.04 LTS

**Yazar:** Manus AI (Salih TANRISEVEN adına)
**Tarih:** 29 Aralık 2025
**Sürüm:** 1.0

Bu rehber, HaberNexus projesini sıfırdan bir **Ubuntu 24.04 LTS** sunucusuna nasıl kuracağınızı, yapılandıracağınızı ve yayına alacağınızı adım adım açıklamaktadır. Projenin V1.0 üretim sürümü tamamlanmış ve test edilmiştir.

---

## 🎯 Genel Bakış

Kurulum süreci 5 ana adımdan oluşmaktadır:

1.  **Sunucu Hazırlığı:** Ubuntu 24.04 sunucusunun güncellenmesi ve temel paketlerin kurulumu.
2.  **Gerekli Yazılımların Kurulumu:** Node.js, PM2 ve Nginx gibi bağımlılıkların kurulumu.
3.  **Proje Kurulumu:** HaberNexus kodunun sunucuya indirilmesi ve yapılandırılması.
4.  **Servis Olarak Çalıştırma:** PM2 ile uygulamanın sürekli çalışmasının sağlanması.
5.  **Reverse Proxy ve SSL:** Nginx ile alan adının yönlendirilmesi ve Let's Encrypt ile SSL sertifikası kurulumu.

---

## 1. Sunucu Hazırlığı (Ubuntu 24.04 LTS)

Bu adımlar, SSH ile bağlandığınız temiz bir Ubuntu 24.04 sunucusunda root veya sudo yetkilerine sahip bir kullanıcı ile yapılmalıdır.

### Adım 1.1: Sistemi Güncelleme

İlk olarak, sunucunuzun paket listesini ve mevcut paketleri güncelleyin:

```bash
sudo apt update && sudo apt upgrade -y
```

### Adım 1.2: Gerekli Temel Paketleri Yükleme

Kurulum için `git` (versiyon kontrolü) ve `curl` (dosya indirme) gibi araçlar gereklidir.

```bash
sudo apt install -y git curl wget unzip
```

---

## 2. Gerekli Yazılımların Kurulumu

HaberNexus, Node.js üzerinde çalışır, PM2 ile yönetilir ve Nginx ile sunulur.

### Adım 2.1: Node.js v22.x Kurulumu

Proje, Node.js v20.9.0 veya üzerini gerektirir. En güncel LTS (Uzun Süreli Destek) sürümü olan Node.js 22'yi kuracağız. `nodesource` deposunu kullanarak kurulumu yapın:

```bash
# Nodesource deposunu sisteme ekleyin
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Node.js'i kurun
sudo apt-get install -y nodejs
```

Kurulumu doğrulamak için versiyonları kontrol edin:

```bash
node -v # Çıktı v22.x.x gibi olmalı
npm -v  # Çıktı 10.x.x gibi olmalı
```

### Adım 2.2: PM2 Process Manager Kurulumu

PM2, Node.js uygulamalarını üretim ortamında canlı tutmak ve yönetmek için kullanılır. Global olarak `npm` ile kurun:

```bash
sudo npm install -g pm2
```

### Adım 2.3: Nginx Web Sunucusu Kurulumu

Nginx, gelen istekleri Next.js uygulamasına yönlendirmek (reverse proxy) ve SSL sonlandırması yapmak için kullanılacaktır.

```bash
sudo apt install -y nginx
```

Kurulum sonrası Nginx'in çalıştığından emin olun:

```bash
sudo systemctl status nginx
# Çıktıda "active (running)" ifadesini görmelisiniz.
```

---

## 3. Proje Kurulumu

Artık sunucumuz hazır olduğuna göre, HaberNexus projesini kurabiliriz.

### Adım 3.1: Projeyi Klonlama

Uygulamayı `git` ile GitHub deposundan klonlayın. Genellikle web projeleri `/var/www` dizini altına kurulur.

```bash
# Proje için bir dizin oluşturun ve sahipliğini kullanıcıya verin
sudo mkdir -p /var/www/habernexus
sudo chown -R $USER:$USER /var/www/habernexus

# Projeyi klonlayın
git clone https://github.com/sata2500/habernexus-nextjs.git /var/www/habernexus

# Proje dizinine geçin
cd /var/www/habernexus
```

### Adım 3.2: Bağımlılıkları Yükleme

Projenin ihtiyaç duyduğu tüm `npm` paketlerini yükleyin:

```bash
npm install
```

> **Not:** Bu komut, `package.json` dosyasında listelenen tüm bağımlılıkları `node_modules` klasörüne yükleyecektir.

### Adım 3.3: Ortam Değişkenlerini Yapılandırma (`.env`)

`.env.example` dosyasını kopyalayarak kendi yapılandırma dosyanızı oluşturun ve gerekli bilgileri doldurun.

```bash
cp .env.example .env
```

Şimdi dosyayı düzenleyin:

```bash
nano .env
```

Aşağıdaki değişkenleri kendi bilgilerinizle doldurun:

```env
# Veritabanı (SQLite - Değiştirmenize gerek yok)
DATABASE_URL="file:./data.db"

# Auth.js v5 Güvenlik Anahtarı
# Aşağıdaki komutla güvenli bir anahtar oluşturup yapıştırın:
# openssl rand -base64 32
AUTH_SECRET="BURAYA_GÜVENLİ_ANAHTARINIZI_YAPIŞTIRIN"
AUTH_TRUST_HOST=true

# Google OAuth 2.0 Bilgileri
# Google Cloud Console'dan alınmalıdır.
GOOGLE_CLIENT_ID="BURAYA_GOOGLE_CLIENT_ID_YAPIŞTIRIN"
GOOGLE_CLIENT_SECRET="BURAYA_GOOGLE_CLIENT_SECRET_YAPIŞTIRIN"

# Gemini AI API Anahtarı
# Google AI Studio'dan alınmalıdır.
GEMINI_API_KEY="BURAYA_GEMINI_API_KEY_YAPIŞTIRIN"

# Site Yapılandırması
NEXT_PUBLIC_SITE_URL="https://habernexus.com"
NEXT_PUBLIC_SITE_NAME="HaberNexus"

# Node Ortamı
NODE_ENV="production"
```

> **ÖNEMLİ:** `AUTH_SECRET` için `openssl rand -base64 32` komutunu çalıştırıp çıktısını yapıştırmalısınız. Alan adınız farklıysa `NEXT_PUBLIC_SITE_URL` değişkenini güncelleyin.

### Adım 3.4: Veritabanı ve Üretim Build'i

Prisma ile SQLite veritabanını oluşturun ve Next.js projesini üretim için derleyin (`build` alın).

```bash
# Prisma Client'ı oluşturun
npx prisma generate

# Veritabanı şemasını veritabanına yazın
npx prisma db push

# Projeyi build edin
npm run build
```

---

## 4. Servis Olarak Çalıştırma (PM2)

Uygulamanın sunucu yeniden başlasa bile çalışmaya devam etmesi için PM2 ile bir servis oluşturacağız.

### Adım 4.1: Uygulamayı PM2 ile Başlatma

```bash
pm2 start npm --name "habernexus" -- start
```

### Adım 4.2: PM2 Servisini Kaydetme

Sunucu yeniden başladığında PM2'nin otomatik olarak başlaması için:

```bash
pm2 startup
```

Bu komut size bir çıktı verecektir. Çıktıdaki komutu kopyalayıp çalıştırın. Genellikle şuna benzer:
`sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u <kullanici_adi> --hp /home/<kullanici_adi>`

Son olarak, mevcut PM2 sürecini kaydedin:

```bash
pm2 save
```

Artık uygulamanız `http://localhost:3000` adresinde çalışıyor.

---

## 5. Reverse Proxy ve SSL (Nginx & Certbot)

Son adım, alan adınızı (`habernexus.com`) uygulamaya yönlendirmek ve HTTPS için SSL sertifikası kurmaktır.

### Adım 5.1: Nginx Yapılandırması

Alan adınız için yeni bir Nginx yapılandırma dosyası oluşturun:

```bash
sudo nano /etc/nginx/sites-available/habernexus.com
```

Dosyanın içine aşağıdaki yapılandırmayı yapıştırın. `habernexus.com` ve `www.habernexus.com` kısımlarını kendi alan adınızla değiştirin.

```nginx
server {
    listen 80;
    server_name habernexus.com www.habernexus.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Adım 5.2: Siteyi Etkinleştirme

Oluşturduğunuz yapılandırmayı etkinleştirin ve Nginx'i yeniden başlatın:

```bash
# Sembolik link oluşturarak siteyi etkinleştirin
sudo ln -s /etc/nginx/sites-available/habernexus.com /etc/nginx/sites-enabled/

# Nginx yapılandırmasını test edin
sudo nginx -t
# Çıktıda "syntax is ok" ve "test is successful" görmelisiniz.

# Nginx'i yeniden başlatın
sudo systemctl restart nginx
```

### Adım 5.3: SSL Sertifikası Kurulumu (Certbot)

Let's Encrypt ile ücretsiz SSL sertifikası kurmak için Certbot'u kullanacağız.

```bash
# Certbot ve Nginx eklentisini kurun
sudo apt install -y certbot python3-certbot-nginx

# Certbot'u çalıştırarak SSL sertifikasını alın ve Nginx'i otomatik yapılandırın
sudo certbot --nginx -d habernexus.com -d www.habernexus.com
```

> **Not:** Certbot size e-posta adresinizi soracak ve HTTP trafiğini otomatik olarak HTTPS'ye yönlendirmeyi teklif edecektir. Bu seçeneği kabul etmeniz önerilir.

---

## ✅ Kurulum Tamamlandı!

Tebrikler! HaberNexus projesini başarıyla kurdunuz. Artık `https://habernexus.com` adresinden sitenize erişebilirsiniz.

### Sonraki Adımlar

1.  **Google OAuth Yönlendirme URL'si:** Google Cloud Console'da, OAuth istemcinizin "Yetkilendirilmiş yönlendirme URI'leri" bölümüne `https://habernexus.com/api/auth/callback/google` adresini eklediğinizden emin olun.
2.  **Admin Paneli:** `https://habernexus.com/admin` adresine giderek Google hesabınızla giriş yapın. İlk giriş yapan kullanıcı otomatik olarak **ADMIN** rolünü alacaktır.
3.  **RSS Kaynakları Ekleyin:** Admin panelinden RSS kaynakları ekleyerek AI içerik motorunun çalışmasını sağlayın.

### Faydalı PM2 Komutları

-   **Durumu Görüntüle:** `pm2 status`
-   **Logları İzle:** `pm2 logs habernexus`
-   **Yeniden Başlat:** `pm2 restart habernexus`
-   **Durdur:** `pm2 stop habernexus`
