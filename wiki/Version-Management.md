# Sürüm Yönetimi (Version Management)

Bu sayfa, HaberNexus projesinin admin panel üzerinden yönetilebilen sürüm yönetimi ve deployment sistemini açıklar.

---

## Genel Bakış

Sürüm Yönetimi sistemi, aşağıdaki özellikleri sunar:

| Özellik | Açıklama |
|---------|----------|
| **Mevcut Sürüm Görüntüleme** | Çalışan commit, branch ve tag bilgilerini gösterir |
| **GitHub Releases** | Tüm GitHub release'lerini listeler ve yönetir |
| **Manuel Deployment** | İstenen herhangi bir sürüme geçiş yapabilme |
| **Otomatik Deployment Kontrolü** | Webhook ve auto-deploy özelliklerini açıp kapatma |
| **Deployment Geçmişi** | Tüm deployment işlemlerinin loglarını görüntüleme |
| **Ayar Yönetimi** | Cooldown süresi, izlenen branch'ler vb. ayarlar |

---

## Admin Panel Erişimi

Sürüm yönetimi sayfasına erişmek için:

```
https://habernexus.com/admin/surum-yonetimi
```

Bu sayfaya sadece **ADMIN** rolüne sahip kullanıcılar erişebilir.

---

## Özellikler

### 1. Mevcut Sürüm Bilgisi

Sayfanın üst kısmında üç kart bulunur:

**Mevcut Sürüm Kartı:**
- Çalışan commit hash (kısa format)
- Mevcut branch adı
- Eğer varsa, mevcut tag
- Son commit mesajı ve tarihi

**Webhook Durumu Kartı:**
- Webhook sunucusunun çalışıp çalışmadığı
- Otomatik deployment durumu (açık/kapalı)

**Son Deployment Kartı:**
- Son deployment'ın durumu (başarılı/başarısız)
- Deployment tipi (otomatik/manuel/rollback)
- Hedef sürüm ve süre

### 2. GitHub Sürümleri

GitHub'daki tüm release'ler listelenir. Her release için:

- Tag adı ve release adı
- Yayınlanma tarihi
- Pre-release veya draft durumu
- Mevcut sürüm işaretlemesi
- GitHub'da görüntüleme linki

Bir release'e tıklayarak detayları görebilir ve **"Bu Sürüme Geç"** butonu ile deployment başlatabilirsiniz.

### 3. Deployment Ayarları

Ayarlar bölümünde aşağıdaki seçenekler yönetilebilir:

| Ayar | Açıklama | Varsayılan |
|------|----------|------------|
| **Otomatik Deployment** | Push event'lerinde otomatik deploy | Açık |
| **Webhook Aktif** | GitHub webhook isteklerini kabul etme | Açık |
| **Deployment Öncesi Yedekleme** | Deploy öncesi otomatik yedek alma | Açık |
| **Cooldown Süresi** | İki deployment arasındaki minimum süre | 60 saniye |

### 4. Hızlı Deployment

Sayfanın alt kısmında, herhangi bir tag veya commit hash girerek hızlı deployment başlatabilirsiniz:

```
Örnek: v3.2.0 veya abc123de
```

### 5. Deployment Geçmişi

Tüm deployment işlemleri kaydedilir ve görüntülenebilir:

- Deployment tipi (auto/manual/rollback)
- Başlangıç ve bitiş sürümü
- Tetikleyen kullanıcı
- Başlangıç ve bitiş zamanı
- Süre
- Başarı/başarısızlık durumu
- Detaylı loglar

---

## API Endpoint'leri

Sürüm yönetimi için aşağıdaki API endpoint'leri kullanılır:

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/admin/deployment/status` | GET | Mevcut deployment durumu |
| `/api/admin/deployment/releases` | GET | GitHub releases listesi |
| `/api/admin/deployment/commits` | GET | Son commit'ler |
| `/api/admin/deployment/branches` | GET | Branch listesi |
| `/api/admin/deployment/settings` | GET/PUT | Ayarları oku/güncelle |
| `/api/admin/deployment/deploy` | POST | Manuel deployment başlat |
| `/api/admin/deployment/history` | GET/POST | Deployment geçmişi |
| `/api/admin/deployment/webhook` | GET/POST | Webhook sunucu kontrolü |

---

## Webhook Sunucusu (v3.0)

Yeni webhook sunucusu (`webhook-server-v3.js`) aşağıdaki özelliklere sahiptir:

### Endpoint'ler

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/health` | GET | Health check |
| `/status` | GET | Detaylı durum bilgisi |
| `/settings` | GET | Mevcut ayarlar |
| `/settings/reload` | PUT | Ayarları veritabanından yeniden yükle |
| `/webhook` | POST | GitHub webhook endpoint |

### Özellikler

1. **Veritabanı Entegrasyonu:** Ayarlar veritabanından okunur
2. **Dinamik Kontrol:** Admin panelden açılıp kapatılabilir
3. **Deployment Kaydı:** Her deployment veritabanına kaydedilir
4. **Otomatik Ayar Yenileme:** Her 30 saniyede ayarlar yenilenir

### Başlatma

```bash
# Doğrudan çalıştırma
node scripts/webhook-server-v3.js

# PM2 ile çalıştırma
pm2 start scripts/webhook-server-v3.js --name habernexus-webhook
```

---

## Veritabanı Modelleri

### DeploymentSettings

Deployment ayarlarını saklar:

```prisma
model DeploymentSettings {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Kullanılan ayar anahtarları:
- `webhook_enabled`
- `auto_deploy_enabled`
- `cooldown_period`
- `allowed_branches`
- `webhook_secret`
- `backup_before_deploy`
- `notify_on_deploy`

### DeploymentHistory

Deployment geçmişini saklar:

```prisma
model DeploymentHistory {
  id            String    @id @default(cuid())
  type          String    // "auto" | "manual" | "rollback"
  status        String    // "pending" | "running" | "success" | "failed"
  fromVersion   String?
  toVersion     String
  triggeredBy   String?
  startedAt     DateTime  @default(now())
  completedAt   DateTime?
  duration      Int?
  logs          String?
  errorMessage  String?
}
```

---

## Ortam Değişkenleri

Sürüm yönetimi için gerekli ortam değişkenleri:

```env
# GitHub Integration
GITHUB_PAT="ghp_your_personal_access_token"
GITHUB_REPO_OWNER="sata2500"
GITHUB_REPO_NAME="habernexus-nextjs"

# Webhook Server
WEBHOOK_PORT=9000
WEBHOOK_SECRET="your-webhook-secret"
INSTALL_DIR="/var/www/habernexus"
LOG_DIR="/var/log/habernexus"
```

---

## Güvenlik

1. **Yetkilendirme:** Tüm API endpoint'leri ADMIN rolü gerektirir
2. **Webhook İmzası:** GitHub webhook'ları X-Hub-Signature-256 ile doğrulanır
3. **Rate Limiting:** Cooldown süresi ile aşırı deployment engellenir
4. **Yedekleme:** Deployment öncesi otomatik yedekleme yapılır

---

## Sorun Giderme

### Webhook Sunucusu Çalışmıyor

```bash
# Durumu kontrol et
pm2 status habernexus-webhook

# Logları görüntüle
pm2 logs habernexus-webhook

# Yeniden başlat
pm2 restart habernexus-webhook
```

### GitHub API Hataları

1. PAT token'ın geçerli olduğundan emin olun
2. Token'ın `repo` yetkisine sahip olduğunu kontrol edin
3. Rate limit'e takılmadığınızı doğrulayın

### Deployment Başarısız

1. Deployment geçmişinden logları inceleyin
2. `auto-deploy.sh` script'inin çalıştırılabilir olduğunu kontrol edin
3. Disk alanı ve bellek durumunu kontrol edin

---

## Sürüm Geçmişi

| Sürüm | Tarih | Değişiklikler |
|-------|-------|---------------|
| v3.0 | 2026-01-18 | Admin panel entegrasyonu, veritabanı desteği |
| v2.0 | 2025-12-XX | İmza doğrulama, cooldown, health check |
| v1.0 | 2025-XX-XX | İlk sürüm |
