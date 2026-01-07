# Fix CI/CD Workflow Database Error

**Tarih:** 7 Ocak 2026  
**Durum:** Aktif  
**Öncelik:** Kritik

---

## Sorun Özeti

GitHub Actions CI ve Release workflow'ları `npm run build` sırasında başarısız oluyor. Hata mesajı:

```
Error [PrismaClientKnownRequestError]: 
Invalid `prisma.article.findMany()` invocation:
The table `main.Article` does not exist in the current database.
```

## Kök Neden Analizi

1. CI workflow'unda `DATABASE_URL: "file:./test.db"` tanımlı
2. Ancak bu test veritabanı hiç oluşturulmamış (migration/db push yapılmamış)
3. Next.js static generation sırasında `LatestNews` ve `PopularNews` bileşenleri Prisma ile veritabanına erişmeye çalışıyor
4. Veritabanı tabloları olmadığı için hata alınıyor

## Etkilenen Dosyalar

| Dosya | Sorun |
|-------|-------|
| `.github/workflows/ci.yml` | Veritabanı migration adımı eksik |
| `.github/workflows/release.yml` | Env variables ve migration eksik |

## Çözüm Stratejisi

CI workflow'una `npx prisma db push` adımı ekleyerek test veritabanını oluşturmak.

---

## Mikro-Adım Planı

### Adım 1: CI Workflow Düzeltmesi
- **Dosya:** `.github/workflows/ci.yml`
- **Değişiklik:** "Generate Prisma Client" adımından sonra "Setup Test Database" adımı ekle
- **Doğrulama:** Yerel simülasyon ile test

### Adım 2: Release Workflow Düzeltmesi
- **Dosya:** `.github/workflows/release.yml`
- **Değişiklik:** Env variables ve database setup adımları ekle
- **Doğrulama:** Yerel simülasyon ile test

### Adım 3: Doğrulama
- Tüm değişiklikleri yerel ortamda test et
- `npx tsc --noEmit && npm run lint && npm run build`

### Adım 4: Commit ve Push
- Değişiklikleri commit et
- GitHub'a push et

### Adım 5: GitHub Actions Doğrulama
- GitHub Actions'da workflow'ların başarılı olduğunu doğrula

---

## Hata Günlüğü

| Tarih | Hata | Çözüm |
|-------|------|-------|
| 7 Ocak 2026 | `The table main.Article does not exist` | CI workflow'una db push adımı eklendi |

---

## Referanslar

- [Next.js Prerender Error](https://nextjs.org/docs/messages/prerender-error)
- [Prisma CI/CD Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides)
