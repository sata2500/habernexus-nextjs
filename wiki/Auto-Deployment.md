# Otomatik Deployment (CI/CD)

Bu rehber, HaberNexus projesini GitHub'a her push yapıldığında otomatik olarak güncelleyecek bir CI/CD (Sürekli Entegrasyon/Sürekli Dağıtım) sisteminin nasıl kurulacağını açıklar.

---

## 1. Genel Bakış

Otomatik deployment sistemi, aşağıdaki bileşenlerden oluşur:

| Bileşen | Teknoloji | Amaç |
|---|---|---|
| **GitHub Actions** | YAML | Kodu test eder, build eder ve webhook'u tetikler. |
| **Webhook Sunucusu** | Node.js | Sunucuda çalışır, GitHub'dan gelen istekleri dinler. |
| **Deployment Scripti** | Bash | Uygulamayı günceller, bağımlılıkları kurar ve yeniden başlatır. |
| **PM2** | Process Manager | Webhook sunucusunun ve ana uygulamanın sürekli çalışmasını sağlar. |

### İş Akışı

1.  Geliştirici, `master` branch'ine kod push eder.
2.  GitHub Actions'daki `deploy.yml` workflow'u tetiklenir.
3.  Workflow, kodu test eder ve build alır.
4.  Build başarılı olursa, sunucudaki webhook URL'sine bir POST isteği gönderir.
5.  Sunucudaki `webhook-server.js` isteği alır, imzayı doğrular ve `auto-deploy.sh` scriptini çalıştırır.
6.  `auto-deploy.sh` scripti:
    *   Uygulama kodunu `git pull` ile günceller.
    *   `npm install` ile bağımlılıkları kurar.
    *   `prisma db push` ile veritabanını günceller.
    *   `npm run build` ile projeyi yeniden build eder.
    *   `pm2 restart` ile uygulamayı yeniden başlatır.

---

## 2. Kurulum

Otomatik deployment sistemini kurmak için sunucunuzda aşağıdaki komutu çalıştırmanız yeterlidir.

> ⚠️ **Önemli:** Bu komutu çalıştırmadan önce [ana kurulumu](https://github.com/sata2500/habernexus-nextjs/wiki/Deployment) tamamladığınızdan emin olun.

### Tek Satırlık Kurulum

```bash
curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/setup-auto-deploy.sh | bash
```

Bu script otomatik olarak:

- ✅ Gerekli ön koşulları kontrol eder.
- ✅ Güvenli bir webhook secret anahtarı oluşturur.
- ✅ Webhook sunucusunu PM2 ile başlatır.
- ✅ Güvenlik duvarında (UFW) webhook portuna izin verir.
- ✅ Gerekli GitHub ayarları için size bilgi verir.

### Kurulum Sonrası

Script tamamlandığında, size **Webhook URL** ve **Webhook Secret** bilgilerini verecektir. Bu bilgileri GitHub repository ayarlarınıza eklemeniz gerekmektedir.

1.  **GitHub Repository Ayarlarına Gidin:**
    *   Projenizin GitHub sayfasına gidin: `https://github.com/kullanici-adiniz/repo-adiniz`
    *   Sağ üstteki **Settings** sekmesine tıklayın.

2.  **Actions Secrets Menüsünü Bulun:**
    *   Sol menüdeki **Security** başlığı altında, **Secrets and variables** seçeneğine tıklayın.
    *   Açılan alt menüden **Actions** seçeneğine tıklayın.

3.  **Yeni Secret'lar Ekleyin:**
    *   **New repository secret** butonuna tıklayarak aşağıdaki iki secret'ı oluşturun:

    *   **`DEPLOY_WEBHOOK_URL`**
        *   Değer: Kurulum scriptinin size verdiği `Webhook URL`.

    *   **`DEPLOY_WEBHOOK_SECRET`**
        *   Değer: Kurulum scriptinin size verdiği `Webhook Secret`.

Bu adımları tamamladıktan sonra, `master` branch'ine yapılan her push, uygulamanızın otomatik olarak güncellenmesini tetikleyecektir.

---

## 3. Yönetim

Webhook sunucusunu yönetmek için aşağıdaki komutları kullanabilirsiniz:

```bash
# Durumu görüntüle
habernexus-webhook status

# Logları izle
habernexus-webhook logs

# Yeniden başlat
habernexus-webhook restart

# Durdur
habernexus-webhook stop

# Başlat
habernexus-webhook start

# Health check testi
habernexus-webhook test
```

Log dosyaları `/var/log/habernexus/` dizininde saklanır:

- `webhook.log`: Webhook sunucusunun logları.
- `auto-deploy-*.log`: Her deployment işleminin detaylı logları.

---

## 4. Sorun Giderme

- **Deployment başlamıyor:**
    - GitHub Actions loglarını kontrol edin. `Deploy` adımında hata var mı?
    - `habernexus-webhook logs` komutu ile webhook sunucusu loglarını kontrol edin. GitHub'dan istek geliyor mu?
    - GitHub repository secret'larının doğru ayarlandığından emin olun.

- **Deployment başarısız oluyor:**
    - `/var/log/habernexus/` dizinindeki en son `auto-deploy-*.log` dosyasını inceleyin. Hatanın hangi adımda olduğunu tespit edebilirsiniz.
