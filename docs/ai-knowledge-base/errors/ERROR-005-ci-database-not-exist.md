# ERROR-005: CI Build Sırasında Veritabanı Tablosu Bulunamadı

**Tarih:** 7 Ocak 2026  
**Önem:** Kritik  
**Durum:** ✅ Çözüldü

---

## Hata Açıklaması

GitHub Actions CI ve Release workflow'ları `npm run build` sırasında başarısız oluyor. Next.js static generation sırasında Prisma veritabanı sorguları çalıştırılırken hata alınıyor.

## Hata Mesajı

```
Error [PrismaClientKnownRequestError]: 
Invalid `prisma.article.findMany()` invocation:

The table `main.Article` does not exist in the current database.
    at async v (.next/server/chunks/ssr/[root-of-the-server]__c96b0648._.js:3:12240)
    at async w (.next/server/chunks/ssr/[root-of-the-server]__c96b0648._.js:3:12381) {
  code: 'P2021',
  meta: [Object],
  clientVersion: '6.19.1',
  digest: '1733440625'
}
Export encountered an error on /page: /, exiting the build.
```

## Kök Neden

1. CI workflow'unda `DATABASE_URL: "file:./test.db"` environment variable tanımlı
2. Ancak bu test veritabanı dosyası hiç oluşturulmamış
3. `npx prisma db push` komutu çalıştırılmadığı için veritabanı tabloları mevcut değil
4. Next.js static generation sırasında `LatestNews` ve `PopularNews` bileşenleri Prisma ile veritabanına erişmeye çalışıyor
5. Tablolar olmadığı için `P2021` hatası alınıyor

## Etkilenen Dosyalar

| Dosya | Sorun |
|-------|-------|
| `.github/workflows/ci.yml` | Veritabanı migration adımı eksikti |
| `.github/workflows/release.yml` | Prisma generate ve db push adımları eksikti |
| `components/home/LatestNews.tsx` | Static generation sırasında DB'ye erişiyor |
| `components/home/PopularNews.tsx` | Static generation sırasında DB'ye erişiyor |

## Çözüm

### CI Workflow Düzeltmesi

"Generate Prisma Client" adımından sonra "Setup Test Database" adımı eklendi:

```yaml
- name: Generate Prisma Client
  run: npx prisma generate

- name: Setup Test Database
  run: npx prisma db push --skip-generate
  env:
    DATABASE_URL: "file:./test.db"
```

### Release Workflow Düzeltmesi

Aynı adımlar Release workflow'una da eklendi:

```yaml
- name: Generate Prisma Client
  run: npx prisma generate

- name: Setup Test Database
  run: npx prisma db push --skip-generate
  env:
    DATABASE_URL: "file:./test.db"

- name: Build
  run: npm run build
  env:
    DATABASE_URL: "file:./test.db"
    AUTH_SECRET: "test-secret-for-ci-build-only"
    AUTH_URL: "http://localhost:3000"
    NEXTAUTH_URL: "http://localhost:3000"
    NEXTAUTH_SECRET: "test-secret-for-ci-build-only"
```

## Doğrulama

Düzeltmeden sonra her iki workflow da başarıyla tamamlandı:
- ✅ CI workflow: 53s
- ✅ Release workflow: 1m10s

## Önleme Stratejileri

1. **CI/CD Pipeline'da Veritabanı Kurulumu:** Her zaman `prisma generate` sonrasında `prisma db push` çalıştırılmalı
2. **Environment Variables:** Build sırasında gerekli tüm env variables tanımlanmalı
3. **Test Veritabanı:** CI ortamında SQLite test veritabanı kullanılmalı

## İlgili Dosyalar

- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `prisma/schema.prisma`

## Referanslar

- [Next.js Prerender Error](https://nextjs.org/docs/messages/prerender-error)
- [Prisma CI/CD Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides)
- [Prisma Error P2021](https://www.prisma.io/docs/reference/api-reference/error-reference#p2021)

## Öğrenilen Dersler

1. CI ortamında veritabanı işlemleri için her zaman migration/db push adımı gerekli
2. Next.js static generation, server-side bileşenlerdeki veritabanı çağrılarını build sırasında çalıştırır
3. Test veritabanı için SQLite kullanmak CI süresini kısaltır
