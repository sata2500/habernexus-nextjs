# Environment Değişkenleri

Bu sayfa, HaberNexus projesinin tüm environment değişkenlerini ve yapılandırma seçeneklerini açıklar.

## Zorunlu Değişkenler

Aşağıdaki değişkenler, uygulamanın çalışması için mutlaka ayarlanmalıdır:

| Değişken | Açıklama | Örnek Değer |
|----------|----------|-------------|
| `DATABASE_URL` | SQLite veritabanı dosya yolu | `file:./data.db` |
| `AUTH_SECRET` | Auth.js session şifreleme anahtarı | `openssl rand -base64 32` ile oluşturun |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Google Cloud Console'dan alın |
| `GEMINI_API_KEY` | Google Gemini AI API anahtarı | Google AI Studio'dan alın |

## Opsiyonel Değişkenler

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `AUTH_TRUST_HOST` | Reverse proxy arkasında çalışırken `true` yapın | `false` |
| `NEXT_PUBLIC_SITE_URL` | Sitenin tam URL'i | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_NAME` | Site adı | `HaberNexus` |
| `NODE_ENV` | Çalışma ortamı | `development` |

## API Anahtarları Nasıl Alınır?

### Google OAuth Credentials

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) adresine gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. "OAuth 2.0 Client IDs" bölümünden yeni bir Web Application oluşturun
4. Authorized redirect URIs kısmına ekleyin:
   - `https://your-domain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (geliştirme için)
5. Client ID ve Client Secret'ı kopyalayın

### Gemini API Key

1. [Google AI Studio](https://aistudio.google.com/app/apikey) adresine gidin
2. "Create API Key" butonuna tıklayın
3. API anahtarını kopyalayın

### AUTH_SECRET Oluşturma

Terminal'de aşağıdaki komutu çalıştırın:

```bash
openssl rand -base64 32
```

## Örnek .env Dosyası

```env
# Database
DATABASE_URL="file:./data.db"

# Auth.js v5
AUTH_SECRET="your-generated-secret-here"
AUTH_TRUST_HOST=true

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Gemini AI API
GEMINI_API_KEY="your-gemini-api-key"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://habernexus.com"
NEXT_PUBLIC_SITE_NAME="HaberNexus"

# Node Environment
NODE_ENV="production"
```

## Güvenlik Notları

- `.env` dosyasını asla Git'e commit etmeyin (`.gitignore`'da zaten var)
- Production ortamında güçlü ve benzersiz `AUTH_SECRET` kullanın
- API anahtarlarını düzenli olarak rotate edin
- Minimum yetki prensibiyle API anahtarları oluşturun
