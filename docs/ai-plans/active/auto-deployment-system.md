# Auto-Deployment System Development Plan

**Issue:** Otomatik Deployment Sistemi Ekleme  
**Date:** 10 January 2026  
**Status:** In Progress

---

## 1. Objective

GitHub'a yapılan her push işleminde sunucudaki uygulamanın otomatik olarak güncellenmesini sağlayan bir CI/CD sistemi kurmak.

### Success Criteria

- [ ] GitHub Actions workflow oluşturuldu
- [ ] Webhook listener scripti oluşturuldu
- [ ] Auto-deploy scripti oluşturuldu
- [ ] Kurulum dokümantasyonu oluşturuldu
- [ ] Tüm verification komutları başarılı

---

## 2. Research & Findings

### Mevcut Sistem Analizi

| Bileşen | Durum | Notlar |
|---------|-------|--------|
| CI Workflow | ✅ Var | Build ve test yapıyor |
| Release Workflow | ✅ Var | Semantic release yapıyor |
| Install Script | ✅ Var | Tam kurulum yapıyor |
| Update Script | ✅ Var | Manuel güncelleme yapıyor |
| **Auto-Deploy** | ❌ Yok | Oluşturulacak |

### Seçilen Yaklaşım

**Webhook-based Auto-Deployment:**
1. GitHub Actions → Webhook tetikler
2. Sunucuda Node.js webhook listener çalışır
3. Webhook geldiğinde deploy script çalışır
4. PM2 ile uygulama yeniden başlatılır

### Neden Bu Yaklaşım?

| Alternatif | Avantaj | Dezavantaj |
|------------|---------|------------|
| SSH Deploy | Doğrudan erişim | SSH key yönetimi karmaşık |
| Webhook | Basit, güvenli | Sunucuda listener gerekli |
| Self-hosted Runner | Tam kontrol | Kaynak tüketimi yüksek |

**Webhook seçildi** çünkü:
- Kurulumu basit
- Güvenlik için secret token kullanılabilir
- Sunucu kaynakları minimum kullanılır
- Mevcut update.sh scripti ile entegre edilebilir

---

## 3. Step-by-Step Implementation

### Step 1: GitHub Actions Deploy Workflow
- **Files:** `.github/workflows/deploy.yml`
- **Verification:** Workflow syntax check

### Step 2: Webhook Listener Script
- **Files:** `scripts/webhook-server.js`
- **Verification:** Node.js syntax check

### Step 3: Auto-Deploy Script
- **Files:** `scripts/auto-deploy.sh`
- **Verification:** Bash syntax check

### Step 4: PM2 Ecosystem Config
- **Files:** `ecosystem.config.js`
- **Verification:** PM2 config validation

### Step 5: Setup Script
- **Files:** `scripts/setup-auto-deploy.sh`
- **Verification:** Script execution test

### Step 6: Documentation
- **Files:** `wiki/Auto-Deployment.md`, `docs/guides/AUTO_DEPLOYMENT.md`
- **Verification:** Markdown lint

---

## 4. Documentation Impact

- [ ] `wiki/Deployment.md` - Auto-deploy bölümü eklenmeli
- [ ] `wiki/Auto-Deployment.md` - Yeni sayfa oluşturulmalı
- [ ] `README.md` - Özellik listesine eklenmeli
- [ ] `ROADMAP.md` - Tamamlandı olarak işaretlenmeli

---

## 5. Error Log

(Hatalar burada kaydedilecek)

---

## 6. Test Results

(Test sonuçları burada kaydedilecek)
