# HaberNexus Kullanıcı Rehberleri

Bu klasör, HaberNexus projesini kurmak ve kullanmak için gerekli tüm kullanıcı rehberlerini içerir.

## 📚 Mevcut Rehberler

### [Node.js Güncelleme Rehberi](NODE_JS_UPDATE_GUIDE.md)

Projenin gerektirdiği Node.js versiyonunu (20.9.0+) nasıl yükleyeceğinizi ve `nvm` (Node Version Manager) kullanımını açıklar.

**Ne zaman kullanmalısınız:**
- `npm run dev` çalıştırdığınızda Node.js versiyon hatası alıyorsanız
- Sisteminizde Node.js 18.x veya daha eski bir versiyon varsa

---

### [.env Kurulum Rehberi](ENV_SETUP_GUIDE.md)

Projenin çalışması için gerekli olan API anahtarlarını ve gizli anahtarları nasıl alacağınızı adım adım açıklar.

**İçerik:**
- `NEXTAUTH_SECRET` oluşturma
- Google OAuth (Client ID ve Secret) alma
- Google Gemini AI API anahtarı alma

**Ne zaman kullanmalısınız:**
- İlk kez projeyi kuruyorsanız
- `.env` dosyasını doldurmak için API anahtarlarına ihtiyacınız varsa

---

## 🗂️ Klasör Yapısı

```
docs/
├── guides/              ← Kullanıcı rehberleri (burası)
├── ai-plans/            ← AI ajanlarının geliştirme planları
├── ai-knowledge-base/   ← AI ajanları için paylaşılan bilgi tabanı
└── archive/             ← Eski belgeler
```

---

## 💡 İpucu

Eğer bir sorunla karşılaşırsanız, önce bu rehberlere göz atın. Çoğu yaygın kurulum sorunu burada çözümlenmiştir.
