# HaberNexus: .env Dosyası Kurulum Rehberi

Bu rehber, projenin çalışması için gerekli olan `.env` dosyasındaki çevre değişkenlerini (API anahtarları ve gizli anahtarlar) nasıl alacağınızı adım adım açıklar.

---

## `.env` Dosyası Nedir?

`.env` dosyası, projenizin gizli bilgilerini (API anahtarları, veritabanı şifreleri vb.) kodunuzun dışında güvenli bir şekilde saklamanızı sağlar. Bu dosya **asla** GitHub'a yüklenmez.

Önce `.env.example` dosyasını kopyalayarak `.env` dosyasını oluşturun:

```bash
cp .env.example .env
```

Şimdi bu dosyanın içindeki değişkenleri dolduralım.

---

### 1. `NEXTAUTH_SECRET`

**Ne işe yarar?** Kullanıcı oturumlarının (session) güvenliğini sağlamak için kullanılır. Rastgele ve tahmin edilemez bir metin olmalıdır.

**Nasıl oluşturulur?**

Terminalinize aşağıdaki komutu yazarak kolayca bir anahtar oluşturabilirsiniz:

```bash
openssl rand -base64 32
```

Çıkan sonucu kopyalayıp `.env` dosyanıza yapıştırın.

**Örnek:**
```
NEXTAUTH_SECRET="buraya-cikan-rastgele-sonucu-yapistirin"
```

---

### 2. `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET`

**Ne işe yarar?** Kullanıcıların "Google ile Giriş Yap" özelliğini kullanabilmesi için gereklidir.

**Nasıl alınır?**

1.  **Google Cloud Console'a Gidin:** [https://console.cloud.google.com/](https://console.cloud.google.com/) adresine gidin ve Google hesabınızla giriş yapın.

2.  **Yeni Proje Oluşturun:**
    *   Sayfanın üst kısmındaki proje seçim menüsüne tıklayın ve "Yeni Proje" deyin.
    *   Proje adı olarak `HaberNexus` veya istediğiniz bir ismi verin ve "Oluştur"a tıklayın.

3.  **OAuth İzin Ekranını Yapılandırın:**
    *   Sol menüden **API'ler ve Hizmetler > OAuth izin ekranı**'na gidin.
    *   **Harici**'yi seçin ve "Oluştur"a tıklayın.
    *   Uygulama adı olarak `HaberNexus` yazın.
    *   Kullanıcı destek e-postası olarak kendi e-posta adresinizi seçin.
    *   Sayfanın en altına inip geliştirici iletişim bilgileri kısmına kendi e-posta adresinizi yazın ve "Kaydet ve Devam Et"e tıklayın.
    *   Kapsamlar ekranında hiçbir şey yapmadan "Kaydet ve Devam Et"e tıklayın.
    *   Test kullanıcıları ekranında "Kaydet ve Devam Et"e tıklayın.

4.  **Kimlik Bilgileri Oluşturun:**
    *   Sol menüden **API'ler ve Hizmetler > Kimlik Bilgileri**'ne gidin.
    *   Yukarıdaki **+ KİMLİK BİLGİSİ OLUŞTUR** butonuna tıklayın ve **OAuth istemci kimliği**'ni seçin.
    *   Uygulama türü olarak **Web uygulaması**'nı seçin.
    *   Ad olarak `HaberNexus Web Client` yazın.

5.  **URI'ları Ayarlayın (En Önemli Adım):**
    *   **Yetkilendirilmiş JavaScript kaynakları** bölümüne şunu ekleyin:
        ```
        http://localhost:3000
        ```
    *   **Yetkilendirilmiş yönlendirme URI'ları** bölümüne şunu ekleyin:
        ```
        http://localhost:3000/api/auth/callback/google
        ```
    *   "Oluştur"a tıklayın.

6.  **Anahtarları Kopyalayın:**
    *   Açılan pencerede **İstemci Kimliğiniz** (`GOOGLE_CLIENT_ID`) ve **İstemci Gizli Anahtarınız** (`GOOGLE_CLIENT_SECRET`) görünecektir. Bu değerleri kopyalayıp `.env` dosyanıza yapıştırın.

---

### 3. `GEMINI_API_KEY`

**Ne işe yarar?** Projenin içerik ve görsel üretmesini sağlayan yapay zeka modeline erişim için gereklidir.

**Nasıl alınır?**

1.  **Google AI Studio'ya Gidin:** [https://aistudio.google.com/](https://aistudio.google.com/) adresine gidin ve Google hesabınızla giriş yapın.

2.  **API Anahtarı Alın:**
    *   Sol menüden **Get API key** (API anahtarı al) seçeneğine tıklayın.
    *   Açılan ekranda **Create API key in new project** (Yeni projede API anahtarı oluştur) butonuna tıklayın.

3.  **Anahtarı Kopyalayın:**
    *   Oluşturulan API anahtarını kopyalayın ve `.env` dosyanızdaki `GEMINI_API_KEY` değişkenine yapıştırın.

---

### 4. Diğer Değişkenler

Bu değişkenleri genellikle değiştirmenize gerek yoktur:

-   `DATABASE_URL`: Veritabanı dosyasının yolunu belirtir. Varsayılan ayar doğrudur.
-   `NEXTAUTH_URL`: Uygulamanızın çalıştığı adresi belirtir. Yerel geliştirme için `http://localhost:3000` doğrudur.
-   `NODE_ENV`: Geliştirme ortamında olduğumuzu belirtir.

---

## ✅ Sonuç

`.env` dosyanızın son hali şuna benzer olmalıdır (değerler size özel olacaktır):

```env
# Database
DATABASE_URL="file:./prisma/data.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="GENERATED_RANDOM_STRING_HERE"

# Google OAuth
GOOGLE_CLIENT_ID="1234567890-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Google Gemini AI
GEMINI_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Node Environment
NODE_ENV="development"
```

