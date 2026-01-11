# GitHub Actions Lint Hatalarını Düzeltme Planı

**Tarih:** 11 Ocak 2026  
**Agent:** Manus AI  
**Durum:** Tamamlandı

---

## 1. Sorun Tanımı

GitHub Actions'da Deploy workflow'u "Lint Check" adımında başarısız oluyor.

### Tespit Edilen Hatalar

1. **`scripts/webhook-server.js` dosyasında lint hataları:**
   - 5 adet `@typescript-eslint/no-require-imports` hatası (require() kullanımı)
   - 1 adet `@typescript-eslint/no-unused-vars` uyarısı (kullanılmayan `err` değişkeni)

2. **`package.json` lint script sorunu:**
   - `next lint` komutu Next.js 16'da farklı çalışıyor
   - ESLint doğrudan çalıştırılmalı

---

## 2. Çözüm Planı

### Mikro-Adım 1: package.json lint script güncelleme
- **Dosya:** `package.json`
- **Değişiklik:** `"lint": "next lint"` → `"lint": "eslint app components lib scripts --ext .ts,.tsx,.js"`
- **Doğrulama:** `npm run lint` çalıştır

### Mikro-Adım 2: webhook-server.js ESLint disable comment ekleme
- **Dosya:** `scripts/webhook-server.js`
- **Değişiklik:** Dosya başına `/* eslint-disable @typescript-eslint/no-require-imports */` ekle
- **Doğrulama:** `npx eslint scripts/webhook-server.js`

### Mikro-Adım 3: Kullanılmayan değişken düzeltme
- **Dosya:** `scripts/webhook-server.js`
- **Değişiklik:** `catch (err)` → `catch` (değişkensiz)
- **Doğrulama:** `npx eslint scripts/webhook-server.js`

### Mikro-Adım 4: Tam doğrulama
- **Komutlar:**
  ```bash
  npx tsc --noEmit
  npm run lint
  npm run build
  ```

---

## 3. Hata Günlüğü

| Zaman | Hata | Çözüm |
|-------|------|-------|
| - | - | - |

---

## 4. Referanslar

- `docs/ai-knowledge-base/errors/lint-errors-fix-report.md`
- ESLint Flat Config: https://eslint.org/docs/latest/use/configure/configuration-files-new


---

## 5. Test Sonuçları

### Doğrulama Komutları

```
✓ TypeScript Check: npx tsc --noEmit - PASSED
✓ Lint Check: npm run lint - PASSED
✓ Build Test: npm run build - PASSED
```

### Build Çıktısı

```
▲ Next.js 16.1.1 (Turbopack)
✓ Compiled successfully in 7.8s
✓ Finished TypeScript in 5.8s
✓ Collecting page data using 5 workers in 639.7ms
✓ Generating static pages using 5 workers (12/12) in 591.5ms
✓ Finalizing page optimization in 15.8ms
```

---

## 6. Yapılan Değişiklikler

| Dosya | Değişiklik |
|-------|------------|
| `package.json` | `lint` script'i `next lint` → `eslint app components lib scripts --ext .ts,.tsx,.js` olarak güncellendi |
| `scripts/webhook-server.js` | Dosya başına `/* eslint-disable @typescript-eslint/no-require-imports */` eklendi |
| `scripts/webhook-server.js` | `catch (err)` → `catch` olarak değiştirildi (kullanılmayan değişken) |
