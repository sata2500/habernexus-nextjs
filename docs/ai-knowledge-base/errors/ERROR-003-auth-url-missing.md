# ERROR-003: AUTH_URL Eksikliği - Google OAuth localhost Yönlendirmesi

**Tarih:** 7 Ocak 2026  
**Önem:** Kritik  
**Durum:** Çözüldü

## Hata Açıklaması

Production ortamında Google OAuth ile giriş yapılırken, kullanıcı `localhost:3000/auth/error` adresine yönlendiriliyor ve giriş başarısız oluyor.

## Hata Mesajı

```
This site can't be reached
localhost refused to connect.
ERR_CONNECTION_REFUSED
```

Veya:

```
https://localhost:3000/auth/error?error=Configuration
```

## Kök Neden

Auth.js v5, OAuth callback URL'ini belirlemek için `AUTH_URL` environment değişkenini kullanır. Bu değişken `.env` dosyasında tanımlanmadığında, Auth.js varsayılan olarak `localhost:3000` adresini kullanır.

## Etkilenen Dosyalar

- `/var/www/habernexus/.env`
- `scripts/install.sh`
- `.env.example`

## Çözüm

### 1. `.env` Dosyasına AUTH_URL Ekleme

```bash
# .env dosyasını düzenleyin
sudo nano /var/www/habernexus/.env

# Şu satırı ekleyin (domain adresinizi yazın)
AUTH_URL="https://habernexus.com"
```

### 2. Uygulamayı Yeniden Başlatma

```bash
# PM2'yi environment değişkenleriyle yeniden başlatın
sudo pm2 restart habernexus --update-env
```

### 3. Google Cloud Console Ayarları

Google Cloud Console'da OAuth 2.0 Client ayarlarında şunların doğru olduğundan emin olun:

**Authorized JavaScript origins:**
- `https://your-domain.com`
- `https://www.your-domain.com` (varsa)

**Authorized redirect URIs:**
- `https://your-domain.com/api/auth/callback/google`
- `https://www.your-domain.com/api/auth/callback/google` (varsa)

## Önleme

Bu hata, `scripts/install.sh` dosyasında `AUTH_URL` değişkeninin `.env` dosyasına otomatik olarak eklenmesiyle önlendi.

## İlgili Değişiklikler

- `scripts/install.sh`: `AUTH_URL` değişkeni `.env` oluşturma bölümüne eklendi
- `.env.example`: `AUTH_URL` değişkeni ve açıklaması eklendi

## Referanslar

- [Auth.js v5 Documentation](https://authjs.dev/getting-started/deployment)
- [NextAuth.js Environment Variables](https://authjs.dev/reference/core#environment-variables)
