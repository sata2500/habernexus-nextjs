# Learning: GitHub Actions Secrets ile Webhook Tetikleme

**Tarih:** 11 Ocak 2026  
**Kategori:** CI/CD, GitHub Actions  
**İlgili Dosyalar:** `.github/workflows/deploy.yml`, `scripts/install.sh`

---

## Özet

GitHub Actions workflow'ları içinden harici webhook URL'lerine istek göndermek için GitHub Actions Secrets kullanılabilir. Bu yöntem, doğrudan GitHub Webhooks'tan farklıdır ancak bazı avantajları vardır.

## Detay

### İki Farklı Yaklaşım

| Özellik | GitHub Webhooks | GitHub Actions Secrets |
|---------|-----------------|------------------------|
| Tetikleme | Her push'ta otomatik | Workflow içinden manuel |
| Build Kontrolü | Yok | Var (build başarılı olursa) |
| Yapılandırma | Settings → Webhooks | Settings → Secrets and variables → Actions |
| Güvenlik | Webhook secret ile | Encrypted secrets ile |
| Esneklik | Sınırlı | Yüksek (workflow özelleştirilebilir) |

### HaberNexus'ta Kullanılan Yöntem

Projede **GitHub Actions Secrets** yöntemi kullanılmaktadır:

1. `deploy.yml` workflow'u `master` branch'e push yapıldığında tetiklenir
2. Kod build edilir ve test edilir
3. Build başarılı olursa, `secrets.DEPLOY_WEBHOOK_URL` adresine curl ile POST isteği gönderilir
4. İmza için `secrets.DEPLOY_WEBHOOK_SECRET` kullanılır

### Avantajları

1. **Build Kontrolü:** Sadece başarılı build'lerden sonra deploy tetiklenir
2. **Güvenlik:** Secret'lar şifreli olarak saklanır ve loglarda görünmez
3. **Esneklik:** Workflow'u özelleştirerek farklı koşullar eklenebilir (örn: sadece belirli dosyalar değiştiğinde)
4. **Hata Ayıklama:** GitHub Actions logları ile sorunlar kolayca tespit edilebilir

### GitHub Arayüzünde Secret Ekleme

1. Repository → **Settings** sekmesine git
2. Sol menüde **Security** başlığı altında **Secrets and variables** → **Actions** seç
3. **New repository secret** butonuna tıkla
4. **Name** alanına secret adını gir (örn: `DEPLOY_WEBHOOK_URL`)
5. **Secret** alanına değeri gir
6. **Add secret** butonuna tıkla

## Önemli Notlar

- Secret'lar oluşturulduktan sonra değerleri görüntülenemez, sadece güncellenebilir
- Workflow'da secret'lara `${{ secrets.SECRET_NAME }}` şeklinde erişilir
- Secret adları büyük harf ve alt çizgi kullanmalıdır (örn: `DEPLOY_WEBHOOK_URL`)

## Kaynaklar

- [GitHub Docs: Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions)
- [Matt Stauffer: How to trigger a webhook using GitHub Actions](https://mattstauffer.com/blog/how-to-trigger-a-webhook-on-a-schedule-using-github-actions/)

---

**Katkıda Bulunan:** Manus AI
