# Otomatik Deployment (Webhook Sistemi)

Bu rehber, HaberNexus projesini GitHub'a her push yapıldığında otomatik olarak güncelleyecek webhook sisteminin nasıl kurulacağını açıklar.

---

## 1. Genel Bakış

Otomatik deployment sistemi, aşağıdaki bileşenlerden oluşur:

| Bileşen | Teknoloji | Amaç |
|---|---|---|
| **GitHub Webhook** | GitHub API | GitHub'dan doğrudan push olayları gönderir. |
| **Webhook Sunucusu** | Node.js | Sunucuda çalışır, GitHub'dan gelen istekleri dinler. |
| **Deployment Scripti** | Bash | Uygulamayı günceller, bağımlılıkları kurar ve yeniden başlatır. |
| **PM2** | Process Manager | Webhook sunucusunun ve ana uygulamanın sürekli çalışmasını sağlar. |

### İş Akışı

1.  Geliştirici, `master` branch'ine kod push eder.
2.  GitHub, doğrudan webhook isteği gönderir (GitHub Actions'a ihtiyaç yok).
3.  Sunucudaki `webhook-server.js` isteği alır, imzayı doğrular ve `auto-deploy.sh` scriptini çalıştırır.
4.  `auto-deploy.sh` scripti:
    *   Uygulama kodunu `git pull` ile günceller.
    *   `npm install` ile bağımlılıkları kurar.
    *   `prisma db push` ile veritabanını günceller.
    *   `npm run build` ile projeyi yeniden build eder.
    *   `pm2 restart` ile uygulamayı yeniden başlatır.

---

## 2. Kurulum

### Yeni VM'e Kurulum

Yeni bir sunucuya kurulum yapmak için aşağıdaki komutu çalıştırın:

```bash
curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/install.sh | bash
```

Kurulum sırasında:

1.  **Otomatik deployment'ı etkinleştir:** `yes` seçeneğini seçin.
2.  **Webhook secret'ı not edin:** Kurulum sonunda size verilecek webhook secret'ı kaydedin.

### Webhook'u GitHub'da Yapılandır

Kurulum tamamlandıktan sonra, GitHub repository'nize webhook ekleyin:

1.  **GitHub Repository Ayarlarına Gidin:**
    *   Projenizin GitHub sayfasına gidin.
    *   Sağ üstteki **Settings** sekmesine tıklayın.

2.  **Webhooks Menüsünü Bulun:**
    *   Sol menüdeki **Code and automation** başlığı altında, **Webhooks** seçeneğine tıklayın.

3.  **Yeni Webhook Ekleyin:**
    *   **Add webhook** butonuna tıklayın.

4.  **Webhook Bilgilerini Girin:**

    | Alan | Değer |
    |------|-------|
    | **Payload URL** | `http://<SUNUCU_IP>:9000/webhook` veya `https://<DOMAIN>:9000/webhook` |
    | **Content type** | `application/json` |
    | **Secret** | Kurulum sırasında size verilen webhook secret |
    | **Events** | `Just the push event` seçin |
    | **Active** | Checkbox'ı işaretleyin |

5.  **Add webhook** butonuna tıklayarak kaydedin.

### Mevcut Sistemde Güncelleme

Eğer eski sistemi kullanıyorsanız, yeni webhook sunucusunu kurmak için:

```bash
# Yeni webhook sunucusu dosyasını indir
curl -fsSL https://raw.githubusercontent.com/sata2500/habernexus-nextjs/master/scripts/webhook-server.js \
  -o /var/www/habernexus/scripts/webhook-server.js

# PM2 process'ini yeniden başlat
pm2 restart habernexus-webhook --update-env

# Durumu kontrol et
pm2 logs habernexus-webhook --lines 10
```

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

## 4. Test Etme

Webhook'un doğru çalışıp çalışmadığını test etmek için:

```bash
# Webhook sunucusunun sağlık durumunu kontrol et
curl http://localhost:9000/health | jq

# Webhook loglarını izle
pm2 logs habernexus-webhook --lines 20

# Test commit yaparak deployment'ı tetikle
cd /var/www/habernexus
echo "# Test - $(date)" > TEST.md
git add TEST.md
git commit -m "test: deployment test"
git push origin master

# Logları kontrol et (5-10 saniye bekle)
pm2 logs habernexus-webhook --lines 15
```

Başarılı deployment'da şu mesajları göreceksiniz:

```
[INFO] Webhook isteği alındı
[INFO] Deployment başlatılıyor
[INFO] Deployment başarılı
```

---

## 5. Sorun Giderme

### Webhook isteği gelmiyor

```bash
# Webhook sunucusunun çalışıp çalışmadığını kontrol et
pm2 list

# Webhook sunucusunun durumunu kontrol et
curl http://localhost:9000/health

# Logları kontrol et
pm2 logs habernexus-webhook --lines 50
```

### "Geçersiz imza" hatası

Bu, GitHub'dan gelen webhook secret'ının sunucudaki secret'tan farklı olduğu anlamına gelir:

```bash
# Sunucudaki webhook secret'ını öğren
cat /proc/$(pgrep -f "webhook-server.js")/environ | tr '\0' '\n' | grep WEBHOOK_SECRET

# GitHub'daki webhook'u düzenle ve secret'ı güncelleyin
```

### Deployment başarısız oluyor

```bash
# En son deployment logunu kontrol et
ls -lt /var/log/habernexus/auto-deploy-*.log | head -1 | awk '{print $NF}' | xargs cat

# Uygulama loglarını kontrol et
pm2 logs habernexus --lines 50
```

---

## 6. Güvenlik Notları

- Webhook secret'ını güvenli bir yerde saklayın.
- Webhook URL'sini sadece GitHub'da kullanın.
- Sunucudaki firewall ayarlarını kontrol edin (port 9000 açık olmalı).
- Webhook loglarında hassas bilgileri kontrol edin.

