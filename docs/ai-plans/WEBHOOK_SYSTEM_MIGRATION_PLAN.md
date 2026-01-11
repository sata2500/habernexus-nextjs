'''
# Plan: Webhook Sistemi Geçişi

**Sürüm:** 1.0  
**Tarih:** 11 Ocak 2026  
**Durum:** Taslak

---

## 1. Hedef

Mevcut dolaylı, GitHub Actions tabanlı webhook sistemini, daha basit, daha güvenilir ve standartlara uygun olan doğrudan GitHub Repository Webhook sistemine geçirmek.

## 2. Mevcut Sistem (Eski Sistem)

- **Tetikleyici:** `master` branch'ine yapılan `push` işlemi.
- **Akış:**
  1. GitHub Actions'da `deploy.yml` workflow'u tetiklenir.
  2. Workflow, bir `curl` komutu ile sunucudaki `webhook-server.js`'e bir istek gönderir.
  3. Bu istek, `DEPLOY_WEBHOOK_URL` ve `DEPLOY_WEBHOOK_SECRET` adında iki adet GitHub Actions secret'ı kullanır.
- **Sorunlar:**
  - **Karmaşıklık:** Gereksiz bir ara katman (GitHub Actions) içerir.
  - **Güvenlik:** İmza doğrulama (`X-Hub-Signature-256`) mekanizması manuel olarak taklit edilmek zorundadır ve bu, mevcut `deploy.yml` dosyasında yapılmamaktadır. Bu durum "Geçersiz imza" hatalarına yol açmaktadır.
  - **Bakım:** İki ayrı sistemi (Actions ve Webhook sunucusu) yönetmek gerekir.

## 3. Yeni Sistem (Hedef Sistem)

- **Tetikleyici:** `master` branch'ine yapılan `push` işlemi.
- **Akış:**
  1. GitHub Repository -> Settings -> Webhooks bölümünde tanımlanan webhook, `push` olayını doğrudan sunucudaki `http://<SUNUCU_IP>:9000/webhook` adresine gönderir.
  2. GitHub, bu isteği oluştururken payload'u ve webhook secret'ını kullanarak otomatik olarak geçerli bir `X-Hub-Signature-256` başlığı oluşturur.
  3. Sunucudaki `webhook-server.js`, bu isteği alır ve `WEBHOOK_SECRET` ortam değişkenini kullanarak imzayı doğrular.
  4. İmza geçerliyse, `auto-deploy.sh` script'i çalıştırılır.
- **Avantajlar:**
  - **Basitlik:** Aracı (GitHub Actions) ortadan kalkar.
  - **Güvenlik:** GitHub'ın standart ve güvenli imza mekanizması kullanılır. Manuel imza oluşturmaya gerek kalmaz.
  - **Güvenilirlik:** Daha az hareketli parça, daha az hata olasılığı demektir.
  - **Standartlara Uygunluk:** Webhook'lar için tasarlanan standart endüstri pratiğidir.

## 4. Geçiş Adımları

| Faz | Adım | Açıklama | Sorumlu |
|---|---|---|---|
| 1 | **Planlama** | Bu belgenin oluşturulması ve onaylanması. | AI Agent |
| 2 | **Kod Güncelleme** | `scripts/install.sh` ve `scripts/webhook-server.js` dosyalarının yeni sisteme göre güncellenmesi. | AI Agent |
| 3 | **Dokümantasyon** | `README.md`, `wiki/Auto-Deployment.md` ve diğer ilgili tüm belgelerin güncellenmesi. | AI Agent |
| 4 | **Eski Sistemi Kaldırma** | `.github/workflows/deploy.yml` dosyasının silinmesi. | AI Agent |
| 5 | **Yeni Sistemi Kurma** | Kullanıcının GitHub repository'sinde yeni webhook'u kurması için yönlendirilmesi. | Kullanıcı & AI Agent |
| 6 | **Secrets Temizliği** | Kullanıcının artık gereksiz olan `DEPLOY_WEBHOOK_URL` ve `DEPLOY_WEBHOOK_SECRET` Actions secret'larını silmesi için yönlendirilmesi. | Kullanıcı & AI Agent |
| 7 | **Test ve Doğrulama** | Yeni bir test commit'i ile tüm akışın baştan sona test edilmesi. | AI Agent |

## 5. Etki Analizi

- **Kurulum Script'i (`install.sh`):** Baştan sona güncellenmelidir. Artık `DEPLOY_WEBHOOK_URL` oluşturmayacak, bunun yerine kullanıcıya sunucu IP'sini ve webhook secret'ını vererek GitHub'a manuel olarak girmesini isteyecektir.
- **Webhook Sunucusu (`webhook-server.js`):** Kod büyük ölçüde uyumlu. Sadece loglama ve hata mesajları, artık doğrudan GitHub'dan gelen isteklere göre ayarlanabilir.
- **GitHub Actions:** `deploy.yml` ve `release.yml` dosyaları incelenmeli. `deploy.yml` tamamen kaldırılacak. `release.yml`'in tetiklediği bir deployment adımı varsa, bu da kaldırılmalıdır.
- **Dokümantasyon:** Otomatik deployment ile ilgili tüm belgeler, yeni ve daha basit süreci yansıtacak şekilde yeniden yazılmalıdır.

---
Bu plan, projenin CI/CD altyapısını modernize edecek ve gelecekteki bakımı önemli ölçüde basitleştirecektir.
'''
