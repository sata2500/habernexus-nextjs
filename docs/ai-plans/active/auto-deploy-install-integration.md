# Development Plan: Auto-Deploy Kurulum Script'ine Entegrasyon

- **Issue:** N/A (Kullanıcı talebi)
- **Agent:** Manus AI
- **Status:** In Progress

---

## 1. Objective

Mevcut otomatik güncelleme sistemini (auto-deploy) kurulum script'ine (`install.sh`) isteğe bağlı bir özellik olarak entegre etmek, böylece kullanıcılar kurulum sırasında bu özelliği kolayca etkinleştirebilsin.

## 2. Research & Findings

- **Mevcut Sistem Analizi:**
  - `setup-auto-deploy.sh` - Ayrı bir script olarak otomatik deployment kurulumu
  - `auto-deploy.sh` - Webhook tarafından tetiklenen güncelleme scripti
  - `webhook-server.js` - GitHub webhook'larını dinleyen Node.js sunucusu
  - `deploy.yml` - GitHub Actions workflow'u

- **Entegrasyon Yaklaşımı:**
  - Kurulum sırasında kullanıcıya isteğe bağlı seçenek sunma
  - Webhook sunucusunu PM2 ile yönetme
  - Web sunucusu proxy yapılandırması (Caddy/Nginx)
  - Firewall kurallarını otomatik güncelleme

## 3. Step-by-Step Implementation

1. [x] **Değişken Tanımları:** `ENABLE_AUTO_DEPLOY`, `WEBHOOK_PORT`, `WEBHOOK_SECRET`, `LOG_DIR` değişkenlerini ekle
2. [x] **Kullanıcı Girdisi:** `get_user_input()` fonksiyonuna 6. soru olarak auto-deploy seçeneği ekle
3. [x] **Setup Fonksiyonu:** `setup_auto_deploy()` fonksiyonunu implement et
   - Webhook secret oluşturma
   - Log dizini hazırlama
   - Webhook sunucusunu PM2 ile başlatma
   - Yönetim scripti oluşturma
4. [x] **Web Sunucusu Proxy:** `configure_caddy()` ve `configure_nginx()` fonksiyonlarına webhook proxy ekle
5. [x] **Firewall:** `setup_firewall()` fonksiyonuna webhook portu kuralı ekle
6. [x] **Kurulum Özeti:** `print_summary()` fonksiyonunu auto-deploy bilgileriyle güncelle
7. [x] **Versiyon:** Script versiyonunu 2.1.0 olarak güncelle
8. [ ] **Test:** Bash syntax kontrolü ve fonksiyonel test

## 4. Testing Strategy

- **Syntax Test:** `bash -n scripts/install.sh` - Bash syntax kontrolü
- **Fonksiyonel Test:** Kullanıcı tarafından gerçek sunucuda test edilecek
- **Entegrasyon Test:** Auto-deploy seçeneği ile kurulum yapılıp webhook'un çalışıp çalışmadığı kontrol edilecek

## 5. Test Results

- **Syntax Test:** ✅ Passed (`bash -n scripts/install.sh` - Syntax OK)
- **Fonksiyonel Test:** ⏳ Kullanıcı testi bekleniyor
- **Entegrasyon Test:** ⏳ Kullanıcı testi bekleniyor

## 6. Documentation Impact

- [x] `CHANGELOG.md` - v1.6.0 sürüm notları eklendi
- [x] `ROADMAP.md` - v1.5 altına bu özellik eklendi
- [x] `wiki/Deployment.md` - Auto-deploy kurulum talimatları güncellendi

## 7. Error Log

*Henüz hata ile karşılaşılmadı.*

---

## Eklenen/Değiştirilen Dosyalar

| Dosya | Değişiklik Türü | Açıklama |
|-------|-----------------|----------|
| `scripts/install.sh` | Değiştirildi | Auto-deploy entegrasyonu eklendi |
| `CHANGELOG.md` | Değiştirildi | v1.6.0 sürüm notları eklendi |
| `docs/ai-plans/active/auto-deploy-install-integration.md` | Oluşturuldu | Bu plan dosyası |

## Teknik Detaylar

### Yeni Değişkenler (install.sh)
```bash
ENABLE_AUTO_DEPLOY="false"
WEBHOOK_PORT="9000"
WEBHOOK_SECRET=""
LOG_DIR="/var/log/habernexus"
```

### Yeni Fonksiyonlar
- `setup_auto_deploy()` - Webhook sunucusu kurulumu ve yapılandırması

### Değiştirilen Fonksiyonlar
- `get_user_input()` - Auto-deploy seçeneği eklendi
- `configure_caddy()` - Webhook proxy eklendi
- `configure_nginx()` - Webhook proxy eklendi
- `setup_firewall()` - Webhook portu kuralı eklendi
- `print_summary()` - Auto-deploy bilgileri eklendi

---

**Son Güncelleme:** 11 Ocak 2026
