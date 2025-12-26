# HaberNexus Deployment Rehberi

**Yazar:** Manus AI
**Tarih:** 26 Aralık 2025

Bu rehber, HaberNexus projesini SSH ile erişilen bir Ubuntu sunucusuna nasıl kuracağınızı ve yayına alacağınızı adım adım açıklar.

## 1. Ön Gereksinimler

Kuruluma başlamadan önce sunucunuzda aşağıdaki yazılımların yüklü olduğundan emin olun:

- **Ubuntu 22.04 LTS** veya üstü
- **Node.js 22.x** veya üstü
- **Git**
- **Nginx** (veya başka bir reverse proxy)

### 1.1. Node.js Kurulumu

Eğer Node.js yüklü değilse, aşağıdaki komutlarla kurabilirsiniz:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 2. Kurulum Adımları

### Adım 1: Projeyi Klonlama

Projeyi GitHub reposundan sunucunuza klonlayın:

```bash
git clone https://github.com/sata2500/habernexus-nextjs.git
cd habernexus-nextjs
```

### Adım 2: Bağımlılıkları Yükleme

Proje bağımlılıklarını `npm` ile yükleyin:

```bash
npm ci
```

### Adım 3: Environment Dosyasını Yapılandırma

`.env.example` dosyasını kopyalayarak `.env` dosyasını oluşturun ve gerekli değişkenleri doldurun:

```bash
cp .env.example .env
nano .env
```

`.env` dosyasının içeriği aşağıdaki gibi olmalıdır:

```env
# Database
DATABASE_URL="file:./data.db"

# Auth.js v5
AUTH_SECRET="your-auth-secret-here" # openssl rand -base64 32 ile oluşturun
AUTH_TRUST_HOST=true

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini AI API
GEMINI_API_KEY="your-gemini-api-key"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://habernexus.com"
NEXT_PUBLIC_SITE_NAME="HaberNexus"

# Node Environment
NODE_ENV="production"
```

### Adım 4: Veritabanını Hazırlama ve Build Alma

Prisma ile veritabanını oluşturun ve Next.js projesini build edin:

```bash
npx prisma generate
npx prisma db push
npm run build
```

## 3. Servis Olarak Çalıştırma (PM2)

Uygulamanın sürekli çalışmasını sağlamak için `PM2` process manager kullanılması önerilir.

### Adım 1: PM2 Kurulumu

```bash
sudo npm install -g pm2
```

### Adım 2: Uygulamayı Başlatma

```bash
pm2 start npm --name "habernexus" -- start
```

### Adım 3: PM2 Servisini Etkinleştirme

Sunucu yeniden başladığında uygulamanın otomatik olarak başlaması için:

```bash
pm2 startup
# Çıktıdaki komutu kopyalayıp çalıştırın
pm2 save
```

## 4. Reverse Proxy (Nginx)

Uygulamayı dış dünyaya açmak ve SSL sertifikası eklemek için Nginx kullanabilirsiniz.

### Adım 1: Nginx Yapılandırma Dosyası Oluşturma

```bash
sudo nano /etc/nginx/sites-available/habernexus.com
```

Dosya içeriğini aşağıdaki gibi düzenleyin:

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
    }
}
```

### Adım 2: Siteyi Etkinleştirme ve Nginx'i Yeniden Başlatma

```bash
sudo ln -s /etc/nginx/sites-available/habernexus.com /etc/nginx/sites-enabled/
sudo nginx -t # Yapılandırmayı test et
sudo systemctl restart nginx
```

### Adım 3: SSL Sertifikası (Certbot)

Let's Encrypt ile ücretsiz SSL sertifikası kurmak için Certbot kullanın:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d habernexus.com -d www.habernexus.com
```

## 5. Tek Komutla Kurulum

Yukarıdaki adımları otomatikleştirmek için aşağıdaki script'i kullanabilirsiniz. Bu script, interaktif olarak sizden gerekli bilgileri isteyecek ve kurulumu yapacaktır.

Script'i indirin ve çalıştırın:

```bash
wget -O install.sh https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh
chmod +x install.sh
./install.sh
```

---

**Not:** Bu rehber, temel bir kurulumu kapsamaktadır. Güvenlik ve performans için ek yapılandırmalar gerekebilir.
