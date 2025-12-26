# Katkıda Bulunma Rehberi (İnsanlar İçin)

**AI Ajanları:** Bu rehber sizin için de geçerlidir, ancak sizin ana yönerge setiniz [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) dosyasıdır. Lütfen önce onu okuyun.

HaberNexus projesine katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklar.

## 📋 Başlamadan Önce

1. **README.md** dosyasını okuyun
2. **ROADMAP.md** dosyasını inceleyin
3. **GitHub Issues** sayfasından bir görev seçin
4. Bu rehberdeki kurallara uyun

## 🔧 Geliştirme Ortamı Kurulumu

```bash
# Projeyi fork edin ve klonlayın
git clone https://github.com/YOUR_USERNAME/habernexus-nextjs.git
cd habernexus-nextjs

# Bağımlılıkları yükleyin
npm install

# Veritabanını oluşturun
npx prisma migrate dev

# Geliştirme sunucusunu başlatın
npm run dev
```

## 📝 Kodlama Standartları

### Genel Kurallar

- **TypeScript** kullanın
- **ESLint** kurallarına uyun
- **Prettier** ile kodu formatlayın
- Anlamlı değişken ve fonksiyon isimleri kullanın

### Dosya ve Klasör İsimlendirme

- Dosyalar: `kebab-case` (örn: `user-profile.tsx`)
- Komponentler: `PascalCase` (örn: `UserProfile`)
- Fonksiyonlar: `camelCase` (örn: `getUserData`)

## 🌿 Branch Stratejisi

### Branch İsimlendirme

- `feature/` - Yeni özellikler (örn: `feature/dark-theme`)
- `fix/` - Hata düzeltmeleri (örn: `fix/login-error`)
- `docs/` - Dokümantasyon (örn: `docs/update-readme`)
- `refactor/` - Kod iyileştirmeleri (örn: `refactor/api-service`)

### Workflow

```bash
# Ana branch'i güncelleyin
git checkout main
git pull origin main

# Yeni branch oluşturun
git checkout -b feature/your-feature-name

# Değişikliklerinizi yapın ve commit edin
git add .
git commit -m "feat: Add your feature description"

# Branch'inizi push edin
git push origin feature/your-feature-name

# GitHub'da Pull Request açın
```

## 💬 Commit Mesajı Formatı

Commit mesajları [Conventional Commits](https://www.conventionalcommits.org/) standardına uymalıdır:

```
<type>: <description>

[optional body]
```

### Commit Tipleri

- `feat:` - Yeni özellik
- `fix:` - Hata düzeltmesi
- `docs:` - Dokümantasyon değişikliği
- `style:` - Kod formatı (işlevselliği etkilemez)
- `refactor:` - Kod iyileştirme
- `test:` - Test ekleme/düzenleme
- `chore:` - Diğer değişiklikler

### Örnekler

```bash
feat: Add dark theme support
fix: Resolve login authentication issue
docs: Update installation instructions
refactor: Improve RSS parsing performance
```

## 🔍 Pull Request Süreci

1. **Issue Seçin:** Çalışmak istediğiniz bir issue seçin veya yeni bir tane oluşturun
2. **Branch Oluşturun:** Yukarıdaki branch stratejisine göre yeni bir branch oluşturun
3. **Geliştirin:** Değişikliklerinizi yapın ve test edin
4. **PR Açın:** GitHub'da Pull Request açın ve şablonu doldurun
5. **Code Review:** Geri bildirimlere yanıt verin ve gerekli değişiklikleri yapın
6. **Merge:** Onaylandıktan sonra PR'ınız merge edilecektir

## ✅ PR Kontrol Listesi

PR açmadan önce kontrol edin:

- [ ] Kod ESLint kurallarına uyuyor
- [ ] Tüm testler geçiyor
- [ ] Yeni özellik için dokümantasyon eklendi
- [ ] Commit mesajları standartlara uygun
- [ ] PR açıklaması net ve anlaşılır

## 🐛 Hata Bildirimi

Hata bulduysanız:

1. GitHub Issues'da arama yapın (belki daha önce bildirilmiştir)
2. Yeni bir issue açın ve şablonu doldurun
3. Hatayı yeniden oluşturma adımlarını ekleyin
4. Ekran görüntüsü veya log ekleyin

## 💡 Özellik İsteği

Yeni özellik önerisi için:

1. GitHub Issues'da "Feature Request" şablonunu kullanın
2. Özelliğin amacını ve faydalarını açıklayın
3. Mümkünse örnek kullanım senaryoları ekleyin

## 📞 İletişim

Sorularınız için:

- GitHub Issues'da tartışma başlatın
- Email: salihtanriseven25@gmail.com

## 🙏 Teşekkürler

Katkılarınız için teşekkür ederiz! Her katkı, HaberNexus'u daha iyi hale getirir.
