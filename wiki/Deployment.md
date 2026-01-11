# Deployment

This guide provides detailed instructions on how to deploy the HaberNexus application to a production server using PM2.

## 1. Prerequisites

- A server running Ubuntu 22.04 or later.
- Node.js version 20.9.0 or higher installed on the server.
- PM2 installed globally on the server.

---

## Otomatik Kurulum (Tavsiye Edilen)

HaberNexus'u tek komutla kurabilirsiniz. Bu yöntem tüm bağımlılıkları, web sunucusunu ve SSL sertifikasını otomatik olarak yapılandırır.

```bash
curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash
```

### Kurulum Sırasında Sorulacak Bilgiler

| Bilgi | Açıklama | Örnek |
|-------|----------|-------|
| Domain | Sitenizin domain adı | `habernexus.com` |
| Web Sunucusu | Caddy (otomatik SSL) veya Nginx | `1` (Caddy) |
| Google Client ID | Google OAuth için | `xxx.apps.googleusercontent.com` |
| Google Client Secret | Google OAuth için | `GOCSPX-xxx` |
| Gemini API Key | AI içerik üretimi için | `AIzaSy...` |
| E-posta | SSL sertifikası bildirimleri için | `admin@example.com` |
| Otomatik Güncelleme | GitHub'a push yapıldığında otomatik güncelleme | `e` veya `h` |

### Otomatik Güncelleme (Auto-Deploy) Özelliği

Kurulum sırasında "Otomatik güncellemeyi etkinleştirmek istiyor musunuz?" sorusuna `e` cevabı verirseniz:

1. Webhook sunucusu otomatik olarak kurulur ve başlatılır
2. Web sunucusu (Caddy/Nginx) webhook proxy olarak yapılandırılır
3. Firewall kuralları otomatik güncellenir
4. Kurulum sonunda size **detaylı talimatlar** verilir. Bu talimatlar, webhook URL ve secret'ını GitHub repository'nize nasıl ekleyeceğinizi adım adım gösterir.

Detaylı bilgi için: **[Otomatik Deployment (CI/CD)](Auto-Deployment)**

---

## 2. Manuel Kurulum

### Install PM2

```bash
npm install pm2 -g
```

### Clone the Repository

```bash
git clone https://github.com/sata2500/habernexus-nextjs.git
cd habernexus-nextjs
```

### Install Dependencies

```bash
npm install
```

### Create the `.env` File

```bash
cp .env.example .env
```

Fill in the required API keys in the `.env` file.

### Build the Application

```bash
npm run build
```

## 3. Deployment

### Start the Application with PM2

```bash
pm2 start npm --name "habernexus" -- start
```

### Configure PM2 to Start on Boot

```bash
pm2 startup
pm2 save
```

## 4. Nginx Reverse Proxy (Optional)

It is recommended to use Nginx as a reverse proxy to expose the application to the internet.

### Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

### Configure Nginx

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/habernexus
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your_domain.com;

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

Enable the new configuration:

```bash
sudo ln -s /etc/nginx/sites-available/habernexus /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## 5. SSL Certificate (Optional)

It is recommended to use a free SSL certificate from Let's Encrypt to secure the application.

### Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### Obtain an SSL Certificate

```bash
sudo certbot --nginx -d your_domain.com
```


---

## 6. Otomatik Deployment (CI/CD)

Manuel olarak `habernexus update` komutunu çalıştırmak yerine, GitHub'a her kod gönderdiğinizde projenin otomatik olarak güncellenmesini sağlayabilirsiniz.

Bu CI/CD (Sürekli Entegrasyon/Sürekli Dağıtım) sistemi, geliştirme sürecinizi hızlandırır ve hataları azaltır.

Detaylı kurulum ve yapılandırma adımları için **[Otomatik Deployment (CI/CD)](Auto-Deployment)** rehberini inceleyin.
