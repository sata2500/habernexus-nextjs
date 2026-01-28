# Google OAuth 2.0 Kurulumu - HaberNexus

**Tarih:** 28 Ocak 2026  
**Sürüm:** 1.0

Bu dokümanda, HaberNexus projesinde Google OAuth 2.0 kimlik doğrulamasını kurmanın adımları anlatılmaktadır.

---

## 1. Google Cloud Console Kurulumu

### Adım 1: Google Cloud Projesi Oluştur

1. https://console.cloud.google.com adresine git
2. Üst kısımda "Proje Seç" butonuna tıkla
3. "YENİ PROJE" butonuna tıkla
4. Proje adı: **HaberNexus**
5. "OLUŞTUR" butonuna tıkla
6. Proje oluşturulana kadar bekle (1-2 dakika)

### Adım 2: OAuth Consent Screen Yapılandır

1. Sol menüden "APIs & Services" → "OAuth consent screen" seç
2. "User Type" olarak **"External"** seç (test ortamı için)
3. "CREATE" butonuna tıkla
4. Aşağıdaki bilgileri doldur:

   **App Information:**
   - App name: `HaberNexus`
   - User support email: `salihtanriseven25@gmail.com`
   - App logo (opsiyonel): HaberNexus logosu

   **Developer Contact Information:**
   - Email addresses: `salihtanriseven25@gmail.com`

5. "SAVE AND CONTINUE" butonuna tıkla

### Adım 3: Scopes Ekle

1. "Scopes" sayfasında "ADD OR REMOVE SCOPES" butonuna tıkla
2. Aşağıdaki scopes'ları seç:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
3. "UPDATE" butonuna tıkla
4. "SAVE AND CONTINUE" butonuna tıkla

### Adım 4: Test Kullanıcıları Ekle

1. "Test users" sayfasında "ADD USERS" butonuna tıkla
2. Test etmek istediğin Google hesabını ekle:
   - `salihtanriseven25@gmail.com`
3. "ADD" butonuna tıkla

---

## 2. OAuth Credentials Oluştur

### Adım 1: Credentials Sayfasına Git

1. Sol menüden "APIs & Services" → "Credentials" seç
2. "CREATE CREDENTIALS" butonuna tıkla
3. "OAuth 2.0 Client ID" seç

### Adım 2: Uygulama Türü Seç

1. "Application type" olarak **"Web application"** seç
2. "Create" butonuna tıkla

### Adım 3: Authorized Redirect URIs Ekle

"Authorized redirect URIs" bölümünde aşağıdaki URL'leri ekle:

**Development Ortamı:**
```
http://localhost:3000/api/auth/callback/google
```

**Production Ortamı:**
```
https://habernexus.com/api/auth/callback/google
```

Daha sonra domain değişirse, buraya yeni URL'leri ekle.

### Adım 4: Credentials'ı Kopyala

1. "CREATE" butonuna tıkla
2. Açılan pencerede:
   - **Client ID** kopyala
   - **Client Secret** kopyala
3. Bu bilgileri güvenli bir yere kaydet

---

## 3. .env Dosyasını Güncelle

Proje kök dizinindeki `.env` dosyasını aç ve aşağıdaki satırları güncelle:

```env
# Google OAuth Credentials (Google Cloud Console'dan kopyala)
AUTH_GOOGLE_ID=<YOUR_CLIENT_ID>
AUTH_GOOGLE_SECRET=<YOUR_CLIENT_SECRET>

# Auth Configuration
AUTH_SECRET="dev-secret-key-for-testing-only-12345678901234567890"
AUTH_TRUST_HOST=true
AUTH_URL="http://localhost:3000"
```

**Örnek:**
```env
AUTH_GOOGLE_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-1234567890abcdefghijklmnopqr
```

---

## 4. Test Ortamında Giriş Yap

### Adım 1: Dev Server Başlat

```bash
npm run dev
```

### Adım 2: Giriş Sayfasına Git

1. Tarayıcıda http://localhost:3000/auth/signin adresine git
2. "Google ile Giriş Yap" butonuna tıkla

### Adım 3: Google Hesabı Seç

1. Test etmek istediğin Google hesabını seç
2. Gerekli izinleri ver
3. Giriş yap

### Adım 4: Admin Paneline Erişim

1. Giriş yaptıktan sonra http://localhost:3000/admin adresine git
2. Admin dashboard'ı görüntülenebilir mi kontrol et

---

## 5. Sorun Giderme

### Problem: "Redirect URI mismatch" Hatası

**Çözüm:**
1. Google Cloud Console'a git
2. Credentials sayfasında OAuth 2.0 Client ID'yi aç
3. "Authorized redirect URIs" bölümünde hata mesajında gösterilen URL'yi ekle
4. "SAVE" butonuna tıkla

### Problem: "Invalid client" Hatası

**Çözüm:**
1. `.env` dosyasındaki `AUTH_GOOGLE_ID` ve `AUTH_GOOGLE_SECRET` değerlerini kontrol et
2. Google Cloud Console'dan kopyaladığın değerlerin doğru olduğundan emin ol
3. Dev server'ı yeniden başlat: `npm run dev`

### Problem: "Access denied" Hatası

**Çözüm:**
1. Google Cloud Console'da OAuth consent screen'i kontrol et
2. Test kullanıcılarında kendi Google hesabının ekli olduğundan emin ol
3. Eğer "External" app ise, test kullanıcıları eklenmiş olmalı

### Problem: "Email not verified" Hatası

**Çözüm:**
1. Google hesabında e-posta doğrulamasının yapılmış olduğundan emin ol
2. Google Account Settings'e git: https://myaccount.google.com
3. "Security" sekmesinde e-posta doğrulamasını kontrol et

---

## 6. Production Ortamı Kurulumu

### Adım 1: Domain Adını Ekle

1. Google Cloud Console'da Credentials sayfasına git
2. OAuth 2.0 Client ID'yi aç
3. "Authorized redirect URIs" bölümüne production URL'sini ekle:
   ```
   https://habernexus.com/api/auth/callback/google
   ```
4. "SAVE" butonuna tıkla

### Adım 2: Production .env Dosyasını Güncelle

Production sunucusunda `.env` dosyasını güncelle:

```env
AUTH_GOOGLE_ID=<YOUR_CLIENT_ID>
AUTH_GOOGLE_SECRET=<YOUR_CLIENT_SECRET>
AUTH_URL="https://habernexus.com"
```

### Adım 3: SSL Sertifikası Kontrol Et

Production ortamında HTTPS kullanıldığından emin ol:
```bash
# SSL sertifikası kontrol et
curl -I https://habernexus.com
```

---

## 7. Güvenlik Önerileri

### ✅ Yapılması Gerekenler

- [ ] `.env` dosyasını `.gitignore`'a ekle
- [ ] Credentials'ı hiç commit etme
- [ ] Production credentials'ı güvenli bir yerde sakla
- [ ] Düzenli olarak unused credentials'ı sil
- [ ] OAuth consent screen'i güncel tut

### ❌ Yapılmaması Gerekenler

- [ ] Credentials'ı GitHub'a commit etme
- [ ] Credentials'ı e-posta ile gönderme
- [ ] Credentials'ı public ortamlarda paylaşma
- [ ] Eski credentials'ı silmeden yeni olanlar oluşturma

---

## 8. Referanslar

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Auth.js Google Provider](https://authjs.dev/getting-started/providers/google)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)

---

## 9. Destek

Sorularınız veya sorunlarınız varsa, lütfen aşağıdaki adreslerden iletişime geçin:

- **E-posta:** salihtanriseven25@gmail.com
- **GitHub Issues:** https://github.com/sata2500/habernexus-nextjs/issues
- **Dokümantasyon:** /docs/GOOGLE_OAUTH_SETUP.md
