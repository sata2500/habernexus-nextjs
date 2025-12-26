# Google OAuth Kurulum Rehberi

Bu rehber, HaberNexus için Google OAuth 2.0 kimlik doğrulamasını nasıl yapılandıracağınızı adım adım açıklar.

## Adım 1: Google Cloud Console'a Erişim

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Google hesabınızla giriş yapın

## Adım 2: Proje Oluşturma

1. Sol üst köşedeki proje seçiciye tıklayın
2. "NEW PROJECT" butonuna tıklayın
3. Proje adını girin (örn: "HaberNexus")
4. "CREATE" butonuna tıklayın

## Adım 3: OAuth Consent Screen Yapılandırması

1. Sol menüden "APIs & Services" > "OAuth consent screen" seçin
2. User Type olarak "External" seçin ve "CREATE" tıklayın
3. Gerekli bilgileri doldurun:
   - **App name:** HaberNexus
   - **User support email:** E-posta adresiniz
   - **Developer contact information:** E-posta adresiniz
4. "SAVE AND CONTINUE" tıklayın
5. Scopes ekranında "SAVE AND CONTINUE" tıklayın
6. Test users ekranında "SAVE AND CONTINUE" tıklayın

## Adım 4: OAuth 2.0 Credentials Oluşturma

1. Sol menüden "APIs & Services" > "Credentials" seçin
2. "+ CREATE CREDENTIALS" > "OAuth client ID" tıklayın
3. Application type olarak "Web application" seçin
4. Aşağıdaki bilgileri girin:
   - **Name:** HaberNexus Web Client
   - **Authorized JavaScript origins:**
     - `https://habernexus.com`
     - `http://localhost:3000` (geliştirme için)
   - **Authorized redirect URIs:**
     - `https://habernexus.com/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (geliştirme için)
5. "CREATE" butonuna tıklayın

## Adım 5: Credentials'ı Kaydetme

Oluşturma işlemi tamamlandığında bir popup açılacaktır:

1. **Client ID** ve **Client Secret** değerlerini kopyalayın
2. Bu değerleri `.env` dosyanıza ekleyin:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

## Adım 6: Uygulamayı Yayınlama (Production)

Test modunda sadece belirli kullanıcılar giriş yapabilir. Herkese açmak için:

1. "OAuth consent screen" sayfasına gidin
2. "PUBLISH APP" butonuna tıklayın
3. Onay verin

## Sorun Giderme

### "Error 400: redirect_uri_mismatch"

Bu hata, redirect URI'nin Google Console'da tanımlı olmadığını gösterir.

**Çözüm:**
1. Google Cloud Console'da Credentials sayfasına gidin
2. OAuth 2.0 Client ID'nizi düzenleyin
3. "Authorized redirect URIs" kısmına doğru URL'i ekleyin
4. URL'in tam olarak eşleştiğinden emin olun (http/https, trailing slash vb.)

### "Error 403: access_denied"

Bu hata genellikle uygulamanın henüz yayınlanmadığını gösterir.

**Çözüm:**
1. OAuth consent screen'de uygulamayı yayınlayın
2. Veya test kullanıcıları listesine e-posta adresinizi ekleyin

### "Error: invalid_client"

Client ID veya Client Secret yanlış olabilir.

**Çözüm:**
1. `.env` dosyasındaki değerleri kontrol edin
2. Değerlerin başında/sonunda boşluk olmadığından emin olun
3. Uygulamayı yeniden başlatın

## Güvenlik Önerileri

1. **Client Secret'ı gizli tutun** - Asla public repo'ya commit etmeyin
2. **Redirect URI'leri kısıtlayın** - Sadece gerekli domain'leri ekleyin
3. **Düzenli kontrol edin** - Kullanılmayan credentials'ları silin
4. **API kısıtlamaları ekleyin** - Mümkünse IP veya referrer kısıtlaması ekleyin
