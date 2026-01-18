# Sürüm Yönetimi Sistemi Araştırması

**Tarih:** 18 Ocak 2026  
**Amaç:** Admin panel üzerinden GitHub sürüm yönetimi ve otomatik deployment kontrolü

---

## 1. Mevcut Sistem Analizi

### Webhook Server (v2.0)
- **Dosya:** `scripts/webhook-server.js`
- **Port:** 9000 (varsayılan)
- **Özellikler:**
  - GitHub push event'lerini dinler
  - X-Hub-Signature-256 ile imza doğrulaması
  - Cooldown süresi (60 saniye)
  - Health check ve status endpoint'leri
  - Sadece master/main branch'lerini izler

### Auto-Deploy Script
- **Dosya:** `scripts/auto-deploy.sh`
- **İşlevler:**
  - Hızlı yedekleme (data.db, .env)
  - Git pull ile güncelleme
  - npm ci ile bağımlılık kurulumu
  - Prisma veritabanı güncelleme
  - npm run build
  - PM2 restart

---

## 2. GitHub API Endpoint'leri

### Releases API
```
GET /repos/{owner}/{repo}/releases
```
- Tüm release'leri listeler
- tag_name, name, body, created_at, published_at bilgileri
- draft ve prerelease durumları

### Latest Release
```
GET /repos/{owner}/{repo}/releases/latest
```
- En son yayınlanan release'i döndürür

### Release by Tag
```
GET /repos/{owner}/{repo}/releases/tags/{tag}
```
- Belirli bir tag'e göre release bilgisi

### Tags API
```
GET /repos/{owner}/{repo}/tags
```
- Tüm git tag'lerini listeler

---

## 3. Planlanan Özellikler

### Admin Panel Sürüm Yönetimi Sayfası
1. **Mevcut Sürüm Bilgisi**
   - Çalışan sürüm (git commit/tag)
   - Son güncelleme tarihi
   - Deployment durumu

2. **Sürüm Listesi**
   - GitHub'daki tüm release'ler
   - Tag adı, tarih, açıklama
   - Mevcut sürüm işaretlemesi

3. **Sürüm Değiştirme**
   - İstenen sürüme geçiş (rollback/upgrade)
   - Onay mekanizması
   - İşlem logları

4. **Otomatik Güncelleme Kontrolü**
   - Webhook açma/kapama
   - Cooldown süresi ayarı
   - İzlenen branch seçimi

5. **Deployment Geçmişi**
   - Son deployment'lar
   - Başarı/başarısızlık durumu
   - Detaylı loglar

---

## 4. Teknik Tasarım

### Yeni API Route'ları
- `GET /api/admin/deployment/status` - Mevcut durum
- `GET /api/admin/deployment/releases` - GitHub releases
- `POST /api/admin/deployment/deploy` - Manuel deployment
- `GET /api/admin/deployment/settings` - Ayarlar
- `PUT /api/admin/deployment/settings` - Ayar güncelleme
- `GET /api/admin/deployment/history` - Deployment geçmişi

### Veritabanı Modelleri
- `DeploymentSettings` - Webhook ayarları
- `DeploymentHistory` - Deployment geçmişi

### Webhook Server Güncellemeleri
- Ayarları veritabanından okuma
- Dinamik açma/kapama desteği
- API endpoint'leri ekleme
